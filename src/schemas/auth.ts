import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address.").max(254, "Email is too long."));

export const signUpSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
});

export const signInSchema = z.object({
  email: emailSchema,
  // No length rules on sign-in: never reveal the password policy to attackers.
  password: z.string().min(1, "Enter your password.").max(72),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
