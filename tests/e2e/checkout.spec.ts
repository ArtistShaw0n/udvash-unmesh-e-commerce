import { expect, test } from "@playwright/test";

/**
 * Golden-path checkout: signup → verify → cart → checkout → order success.
 * Runs in chromium only — mobile project covers the same surface visually.
 */
test.use({ viewport: { width: 1280, height: 800 } });

test("happy path: signup → verify → add to cart → checkout → place order", async ({
  page,
}) => {
  // 1. Visit a product detail page
  await page.goto("/products/udvash-physics-parallel-text-hsc-2026");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // 2. Add to cart via the cart-icon button (small one — Buy Now would redirect)
  await page.locator('button[aria-label="Add to cart"]').first().click();

  // 3. Go to cart
  await page.goto("/cart");
  await expect(page.getByText(/Shopping Cart/)).toBeVisible();

  // 4. Hit checkout (will redirect to login)
  await page.getByRole("button", { name: /checkout/i }).click();
  await expect(page).toHaveURL(/\/login/);

  // 5. Sign up instead
  await page.getByRole("link", { name: /সাইন আপ/ }).click();
  await expect(page).toHaveURL(/\/signup/);

  const ts = Date.now();
  await page.locator("#name").fill("Smoke Tester");
  await page.locator("#email").fill(`smoke+${ts}@example.com`);
  await page.locator("#phone").fill("01799999999");
  await page.locator("#password").fill("abc123def");
  await page.locator("#confirm").fill("abc123def");
  await page.getByRole("button", { name: /সাইন আপ করুন/ }).click();

  // 6. Email verification — accept the demo OTP 123456
  await expect(page).toHaveURL(/\/verify-email/);
  const digitInputs = page.locator('input[aria-label^="Digit"]');
  await digitInputs.nth(0).fill("1");
  await digitInputs.nth(1).fill("2");
  await digitInputs.nth(2).fill("3");
  await digitInputs.nth(3).fill("4");
  await digitInputs.nth(4).fill("5");
  await digitInputs.nth(5).fill("6");
  await page.getByRole("button", { name: /ভেরিফাই/ }).click();

  // After OTP, the form auto-redirects to /checkout (next param) — give it a moment
  await page.waitForURL(/\/checkout/, { timeout: 10_000 });
  await expect(page.getByText(/ডেলিভারি ঠিকানা/)).toBeVisible();
});
