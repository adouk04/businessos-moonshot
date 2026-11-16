"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Toggles the `dark` class on <html> and remembers the choice. The initial
 * class is set by the inline script in the root layout to avoid a flash.
 */
export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Storage may be unavailable (private mode); the toggle still works for this session.
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
      <Sun className="size-4 dark:hidden" aria-hidden />
      <Moon className="hidden size-4 dark:block" aria-hidden />
    </Button>
  );
}
