import { z } from "zod";

export const INDUSTRIES = [
  { value: "barbershop", label: "Barbershop" },
  { value: "salon", label: "Hair salon" },
  { value: "auto_detailing", label: "Auto detailing" },
  { value: "cleaning", label: "Residential cleaning" },
  { value: "other", label: "Other service business" },
] as const;

const industryValues = INDUSTRIES.map((i) => i.value) as [string, ...string[]];

export const createBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your business name.")
    .max(120, "Business name must be at most 120 characters."),
  industry: z.enum(industryValues, "Choose an industry."),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
