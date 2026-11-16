"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" />}
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
