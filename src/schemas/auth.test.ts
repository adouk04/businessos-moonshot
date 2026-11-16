import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./auth";
import { createBusinessSchema } from "./business";
import { fieldErrors } from "./form";

describe("signUpSchema", () => {
  it("accepts a valid email and password, normalizing the email", () => {
    const r = signUpSchema.safeParse({ email: "  Owner@Example.COM ", password: "correct-horse" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("owner@example.com");
  });

  it("rejects bad emails", () => {
    for (const email of ["", "nope", "a@", "@b.com", "a b@c.com"]) {
      expect(signUpSchema.safeParse({ email, password: "longenough1" }).success).toBe(false);
    }
  });

  it("enforces password length bounds", () => {
    expect(signUpSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ email: "a@b.com", password: "x".repeat(73) }).success).toBe(false);
    expect(signUpSchema.safeParse({ email: "a@b.com", password: "x".repeat(8) }).success).toBe(true);
  });

  it("maps issues to field-level errors", () => {
    const r = signUpSchema.safeParse({ email: "bad", password: "short" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errs = fieldErrors(r.error);
      expect(errs.email?.length).toBeGreaterThan(0);
      expect(errs.password?.length).toBeGreaterThan(0);
    }
  });
});

describe("signInSchema", () => {
  it("does not reveal or enforce a password policy", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(signInSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("createBusinessSchema", () => {
  it("accepts a valid business and trims the name", () => {
    const r = createBusinessSchema.safeParse({ name: "  Fade Factory  ", industry: "barbershop" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Fade Factory");
  });

  it("rejects empty or overlong names and unknown industries", () => {
    expect(createBusinessSchema.safeParse({ name: "   ", industry: "salon" }).success).toBe(false);
    expect(createBusinessSchema.safeParse({ name: "x".repeat(121), industry: "salon" }).success).toBe(false);
    expect(createBusinessSchema.safeParse({ name: "Shop", industry: "hacking" }).success).toBe(false);
    expect(createBusinessSchema.safeParse({ name: "Shop", industry: "" }).success).toBe(false);
  });
});
