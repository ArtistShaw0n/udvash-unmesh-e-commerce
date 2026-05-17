import { expect, test } from "@playwright/test";

test.describe("smoke — every critical route renders without crashing", () => {
  const routes = [
    { path: "/", expects: /উদ্ভাস|বই খুঁজুন/ },
    { path: "/products", expects: /All|একাডেমিক/ },
    {
      path: "/products/udvash-physics-parallel-text-hsc-2026",
      expects: /Udvash Physics|ACADEMIC|রিভিউ/,
    },
    { path: "/search?q=physics", expects: /Search/ },
    { path: "/cart", expects: /Shopping Cart|আপনার কার্ট/ },
    { path: "/login", expects: /লগইন/ },
    { path: "/signup", expects: /সাইন আপ/ },
    { path: "/forgot-password", expects: /পাসওয়ার্ড/ },
    { path: "/orders/track", expects: /অর্ডার ট্র্যাক/ },
    { path: "/about", expects: /আমাদের সম্পর্কে|About/ },
    { path: "/contact", expects: /যোগাযোগ|Contact/ },
    { path: "/help", expects: /হেল্প|FAQ/ },
    { path: "/terms", expects: /Terms|শর্তাবলী/ },
    { path: "/privacy", expects: /Privacy|গোপনীয়তা/ },
    { path: "/design-system", expects: /Design System|ডিজাইন/ },
  ];

  for (const r of routes) {
    test(`GET ${r.path}`, async ({ page }) => {
      const response = await page.goto(r.path);
      expect(response?.status(), `${r.path} status`).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(r.expects);
    });
  }
});

test.describe("smoke — no horizontal overflow on critical routes", () => {
  // Reuses the responsive-audit check we wrote manually.
  const routes = ["/", "/products", "/cart", "/checkout", "/orders/track"];
  for (const path of routes) {
    test(`no horizontal overflow @ ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
      });
      expect(overflow, `${path} should not horizontally overflow`).toBeLessThanOrEqual(2);
    });
  }
});
