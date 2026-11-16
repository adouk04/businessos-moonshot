import { expect, test } from "@playwright/test";
import { E2E_PASSWORD, registerAndOnboard, uniqueEmail } from "./helpers";

test("landing page is public and links to sign-up", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Manage smarter. Grow faster." })).toBeVisible();
  await page.getByRole("link", { name: "Get started" }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test("signed-out users are redirected from app routes to login", async ({ page }) => {
  for (const path of ["/dashboard", "/customers", "/intelligence/simulator", "/onboarding", "/settings"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("registration validates input with field-level messages", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
});

test("login rejects bad credentials with a generic message", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(uniqueEmail("ghost"));
  await page.getByLabel("Password").fill("whatever-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toHaveText("Invalid email or password.");
});

test("register -> onboard -> dashboard -> sign out -> sign in", async ({ page }) => {
  const { email, password, businessName } = await registerAndOnboard(page, "flow", "Fade Factory");

  await expect(page.getByTestId("business-name")).toHaveText(businessName);

  // Signed-in users are bounced away from auth pages and the landing page.
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("business-name")).toHaveText("Fade Factory");
});

test("onboarding validates the business name", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill(uniqueEmail("onb"));
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByText("Enter your business name.")).toBeVisible();
  await expect(page.getByText("Choose an industry.")).toBeVisible();
});

test("a user without a business cannot reach the app", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill(uniqueEmail("nobiz"));
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/onboarding$/);
});
