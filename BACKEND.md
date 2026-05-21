# Backend — current state

> **Status (May 2026):** Prisma + Postgres migration shipped. The
> file-backed JSON store is gone. The runtime queries Neon Postgres
> via a singleton Prisma client.

## What's live today

A full REST API runs as Next.js Route Handlers under `app/api/`. Every
endpoint follows the same envelope:

```json
// success
{ "ok": true, "data": { ... } }

// failure
{ "ok": false, "error": "মেসেজ", "code": "BAD_REQUEST" }
```

The frontend talks to these via the typed client in `lib/api-client.ts`.

### Endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account, issue session cookie |
| POST | `/api/auth/login` | Authenticate, issue session cookie |
| POST | `/api/auth/logout` | Clear session cookie |
| GET  | `/api/auth/me` | Current user + addresses |
| POST | `/api/auth/verify-email` | OTP-based email verification |
| POST | `/api/auth/forgot-password` | Issue reset code |
| POST | `/api/auth/reset-password` | Set new password with code |
| POST | `/api/auth/change-password` | Authenticated password change |
| GET  | `/api/products` | Catalog list (`?category`, `?q`) |
| GET  | `/api/products/:slug` | Product detail with live stock + ratings |
| GET  | `/api/cart` | Logged-in user's cart |
| POST | `/api/cart` | Add / merge cart item |
| PATCH| `/api/cart` | Update qty or selected flag |
| DELETE| `/api/cart` | Remove a slug, or `?clear=selected|all` |
| GET  | `/api/orders` | List my orders |
| POST | `/api/orders` | Place order (atomic inventory check) |
| GET  | `/api/orders/:id` | Single order |
| PATCH| `/api/orders/:id` | `{ action: "cancel" | "return", reason }` |
| POST | `/api/coupons/validate` | Validate + compute coupon discount |
| GET  | `/api/reviews/:slug` | Reviews + summary |
| POST | `/api/reviews/:slug` | Add review (must have purchased) |
| GET  | `/api/addresses` | List my addresses |
| POST | `/api/addresses` | Create address |
| PATCH| `/api/addresses/:id` | Update / set default |
| DELETE| `/api/addresses/:id` | Delete (auto-promotes a new default) |
| PATCH| `/api/profile` | Update name / phone |

### Auth model

- Passwords: `bcryptjs` 10 rounds
- Sessions: JWT (HS256) via `jose`, stored in HTTP-only cookie
  `udvash_session`, 30-day expiry, `SameSite=Lax`, `Secure` in prod
- Secret: `process.env.AUTH_SECRET` (falls back to a dev key — replace
  in production)

### Data store (today)

Everything persists through `lib/server/store.ts`. In dev it writes to
`.data/store.json` after each mutation, debounced 100ms. The store
exposes a typed CRUD API per domain (users, addresses, cart, orders,
reviews, inventory).

On Netlify the file-system is read-only at runtime, so writes succeed in
memory and silently no-op on disk — perfect for demo, **NOT durable
across cold-starts**.

## Migration path: Prisma + Postgres

The store API is intentionally narrow so the swap is mechanical.

### 1. Add Prisma + a Postgres database

```bash
npm install --save prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

Choose a free Postgres host:

- **Neon** — neon.tech, free 0.5GB
- **Supabase** — supabase.com, free 500MB
- **Vercel Postgres** — if deploying to Vercel
- **Railway** — $5/mo trial, fastest setup

Copy the connection string into `.env`:

```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
AUTH_SECRET="<at least 32 random chars>"
```

### 2. Define the schema

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String
  name            String
  phone           String?
  emailVerified   Boolean   @default(false)
  emailVerifyCode String?
  resetCode       String?
  createdAt       DateTime  @default(now())
  addresses       Address[]
  orders          Order[]
  reviews         Review[]
  cart            CartItem[]
}

model Address {
  id            String  @id @default(cuid())
  userId        String
  label         String
  recipientName String
  phone         String
  line1         String
  line2         String?
  city          String
  zip           String?
  isDefault     Boolean @default(false)
  user          User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model CartItem {
  userId    String
  slug      String
  quantity  Int
  selected  Boolean  @default(true)
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([userId, slug])
}

model Order {
  id            String   @id
  userId        String
  placedAt      DateTime @default(now())
  status        String
  items         Json
  address       Json
  payment       Json
  subtotal      Int
  vat           Int
  shipping      Int
  total         Int
  couponCode    String?
  returnStatus  String   @default("none")
  cancelReason  String?
  returnReason  String?
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, placedAt])
}

model Review {
  id               String   @id @default(cuid())
  slug             String
  userId           String
  authorName       String
  rating           Int
  title            String
  body             String
  createdAt        DateTime @default(now())
  verifiedPurchase Boolean
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([slug])
}

model Inventory {
  slug  String @id
  units Int
}
```

Run:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Swap `lib/server/store.ts` for a Prisma-backed implementation

The current store exports the same shape — `findUserByEmail`,
`createUser`, `cartFor`, `placeOrder`, etc. Replace each method's body
with the equivalent Prisma call. Every route handler in `app/api/`
continues to work unchanged.

A sample replacement for one method:

```ts
import { prisma } from "./prisma";

export const store = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },
  async createUser(u: ServerUser) {
    return prisma.user.create({ data: u });
  },
  // ...
};
```

Note: methods become `async` — update the route handlers to `await` calls.

### 4. Seed inventory

```bash
npx prisma db seed
```

Add to `package.json`:

```json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

`prisma/seed.ts` should iterate `data/books.json` and insert 25 units
per in-stock SKU.

### 5. Add a cleanup job (optional)

Schedule a daily cron (Vercel Cron or GitHub Actions) to:
- Delete unverified accounts older than 7 days
- Expire reset codes older than 1 hour
- Aggregate yesterday's revenue + email a summary

## Frontend migration plan

The localStorage-backed contexts still work as the offline fallback.
Swap them one at a time:

| Context | Where | Status |
|---|---|---|
| `auth-context` | `/lib/auth-context.tsx` | ✅ wired to `api.signup` / `api.login` / `api.me` + address CRUD |
| `cart-context` | `/lib/cart-context.tsx` | ✅ wired to `api.getCart` / `api.addToCart` / `api.updateCartItem` etc. |
| `orders-store` | `/lib/orders-store.tsx` | ✅ wired to `api.listOrders` / `api.placeOrder` / cancel / return |
| `reviews-store` | `/lib/reviews-store.tsx` | ✅ wired to `api.listReviews` / `api.postReview` |

Migration pattern: each `useXxx` hook keeps the same return shape but
sources state from `api.xxx()` instead of localStorage. The UI doesn't
change. Add SWR or React Query for caching when you do this.

## Environment variables

| Var | Purpose | Required |
|---|---|---|
| `AUTH_SECRET` | JWT signing key (32+ chars) | yes in prod |
| `DATABASE_URL` | Postgres URL (Prisma migration) | only after step 1 |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for sitemap / OG | optional |

## Payment integration

The `/api/orders` POST currently saves the order immediately. To wire a
real gateway:

1. Add a new route `/api/payments/initiate` that:
   - Creates the order in `pending` state
   - Calls bKash/SSLCommerz/etc. create-payment API
   - Returns the gateway's redirect URL
2. Frontend redirects user to that URL
3. Gateway POSTs to `/api/payments/webhook` on success/failure
4. Webhook handler:
   - Verifies signature
   - Updates order status → `confirmed` (success) or releases stock (failure)

Sample integrators for BD:
- bKash: https://developer.bka.sh/
- SSLCommerz: https://developer.sslcommerz.com/
- Nagad: https://developer.nagad.com.bd/

## Email + SMS

- Email (transactional): Resend, SendGrid, Postmark
- SMS (transactional): Bulk SMS BD, Vonage
- Implement `lib/server/notifications.ts` with:
  - `sendVerifyEmail(user, code)`
  - `sendOrderConfirmation(user, order)`
  - `sendShippingUpdate(user, order, tracking)`
  - `sendPasswordResetEmail(user, code)`
- Trigger from the corresponding route handlers

## Demo testing without a database

The current setup works for demo and dev without any external services.
To exercise the full backend:

```bash
npm run dev
```

Then:
1. Sign up at `/signup` → `devCode` returned in the API response
2. Verify at `/verify-email` with that code (or `123456`)
3. Browse → add to cart → checkout
4. View orders, cancel, request return

`.data/store.json` is gitignored; delete it to reset everything.
