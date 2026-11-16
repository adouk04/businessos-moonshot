import { expect, type Page } from "@playwright/test";

export const E2E_EMAIL_DOMAIN = "example.test";
export const E2E_PASSWORD = "e2e-Password-123!";

export function uniqueEmail(label: string) {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@${E2E_EMAIL_DOMAIN}`;
}

/** Registers a brand-new user through the UI and completes business onboarding. */
export async function registerAndOnboard(page: Page, label: string, businessName = "Test Barbershop") {
  const email = uniqueEmail(label);
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Business name").fill(businessName);
  await page.getByLabel("Industry").selectOption("barbershop");
  await page.getByRole("button", { name: "Create workspace" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  return { email, password: E2E_PASSWORD, businessName };
}
