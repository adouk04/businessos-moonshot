"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBusinessSchema } from "@/schemas/business";
import { fieldErrors, type FormState } from "@/schemas/form";
import { getBusinessContext, requireUser } from "@/server/auth/session";

export async function createBusiness(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const raw = { name: String(formData.get("name") ?? ""), industry: String(formData.get("industry") ?? "") };
  const parsed = createBusinessSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: raw };
  }

  // MVP supports one business per user in the UI (the data model supports many).
  // This also makes a double-submit harmless.
  if (await getBusinessContext()) redirect("/dashboard");

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_business", {
    p_name: parsed.data.name,
    p_industry: parsed.data.industry,
  });
  if (error) {
    console.error("create_business failed", error.code);
    return { message: "We couldn't create your business. Please try again.", values: raw };
  }
  redirect("/dashboard");
}
