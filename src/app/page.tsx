import Link from "next/link";
import { ArrowRight, FlaskConical, Lightbulb, SlidersHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/config/nav";

const features = [
  { icon: Lightbulb, title: "Find missed revenue", text: "See which regulars are overdue for a visit, and why." },
  { icon: SlidersHorizontal, title: "Simulate decisions", text: "Test a price change on paper before you make it." },
  { icon: FlaskConical, title: "Run growth experiments", text: "Track what you tried and compare it with what happened." },
];

// Signed-in users are redirected to /dashboard by proxy.ts.
export default function LandingPage() {
  const BrandIcon = brand.icon;
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BrandIcon className="size-4" aria-hidden />
          </span>
          {brand.name}
        </span>
        <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
          Sign in
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{brand.tagline}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Run your appointments, customers, and finances in one place, and get clear help deciding what to do next.
        </p>
        <Link href="/register" className={buttonVariants({ size: "lg" })}>
          Get started <ArrowRight className="size-4" aria-hidden />
        </Link>
        <ul className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="space-y-2 rounded-xl border p-5">
              <f.icon className="size-5 text-primary" aria-hidden />
              <h2 className="font-medium">{f.title}</h2>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
