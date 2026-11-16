/**
 * Money helpers. All monetary values in BusinessOS are stored and computed as
 * integer cents (see docs/DECISIONS.md, ADR-004). Never use floats for money.
 */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Format integer cents as a USD string, e.g. 18000 -> "$180.00". */
export function formatCents(cents: number): string {
  assertSafeCents(cents);
  return usd.format(cents / 100);
}

/**
 * Parse a user-entered dollar string ("180", "$1,234.5", "12.99") into integer
 * cents. Returns null for anything that is not a valid non-negative amount with
 * at most two decimal places. Parsing is string-based to avoid float rounding.
 */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const dollars = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0") || "0");
  const cents = dollars * 100 + fraction;
  return Number.isSafeInteger(cents) ? cents : null;
}

function assertSafeCents(cents: number): void {
  if (!Number.isSafeInteger(cents)) {
    throw new TypeError(`Money must be an integer number of cents, got ${cents}`);
  }
}
