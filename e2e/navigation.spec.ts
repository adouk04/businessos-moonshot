import { expect, test } from "@playwright/test";

// Scaffold smoke tests. Auth-gated flows are added in Phase 1.

test("root redirects to the dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
});

test("dashboard shows no fabricated numbers", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Total revenue")).toBeVisible();
  await expect(page.getByText("—")).toHaveCount(6);
});

test("navigation reaches every module", async ({ page, isMobile }) => {
  await page.goto("/dashboard");
  const targets: [string, RegExp][] = [
    ["Customers", /\/customers$/],
    ["Appointments", /\/appointments$/],
    ["Services", /\/services$/],
    ["Finances", /\/finances$/],
    ["Opportunities", /\/intelligence\/opportunities$/],
    ["Decision Simulator", /\/intelligence\/simulator$/],
    ["Experiments", /\/intelligence\/experiments$/],
    ["Business Memory", /\/intelligence\/memory$/],
    ["Settings", /\/settings$/],
  ];
  for (const [name, url] of targets) {
    if (isMobile) await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  }
});
