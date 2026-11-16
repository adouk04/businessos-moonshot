import {
  BarChart3,
  BookOpen,
  CalendarDays,
  FlaskConical,
  Lightbulb,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  Tags,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

/** Single source of truth for sidebar navigation (desktop + mobile). */
export const navSections: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Appointments", href: "/appointments", icon: CalendarDays },
      { title: "Services", href: "/services", icon: Tags },
      { title: "Finances", href: "/finances", icon: Wallet },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Opportunities", href: "/intelligence/opportunities", icon: Lightbulb },
      { title: "Decision Simulator", href: "/intelligence/simulator", icon: SlidersHorizontal },
      { title: "Experiments", href: "/intelligence/experiments", icon: FlaskConical },
      { title: "Business Memory", href: "/intelligence/memory", icon: BookOpen },
    ],
  },
  {
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

export const brand = {
  name: "BusinessOS",
  tagline: "Manage smarter. Grow faster.",
  icon: BarChart3,
};
