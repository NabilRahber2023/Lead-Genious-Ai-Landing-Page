import React from "react";
import { Shield, Crown, Briefcase, Megaphone, TrendingUp, Eye } from "lucide-react";

// Metadata for the 6 role login cards. Tailwind classes are written out in full
// (no string interpolation) so they survive the production purge.
export const ROLE_CARDS = [
  {
    id: "super_admin",
    label: "Super Admin",
    tagline: "Platform operator — manage every workspace",
    icon: <Shield className="h-7 w-7" />,
    gradient: "from-red-500 to-rose-600",
    accent: "text-red-500",
    ring: "hover:border-red-500/60 hover:shadow-red-500/10",
    needsDomain: false,
    canRegister: false,
  },
  {
    id: "owner",
    label: "Business Owner",
    tagline: "Full control of your workspace + team",
    icon: <Crown className="h-7 w-7" />,
    gradient: "from-amber-500 to-orange-600",
    accent: "text-amber-500",
    ring: "hover:border-amber-500/60 hover:shadow-amber-500/10",
    needsDomain: true,
    canRegister: true,
  },
  {
    id: "manager",
    label: "Manager",
    tagline: "Run operations across leads & campaigns",
    icon: <Briefcase className="h-7 w-7" />,
    gradient: "from-emerald-500 to-green-600",
    accent: "text-emerald-500",
    ring: "hover:border-emerald-500/60 hover:shadow-emerald-500/10",
    needsDomain: true,
    canRegister: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    tagline: "Build campaigns & track conversion",
    icon: <Megaphone className="h-7 w-7" />,
    gradient: "from-violet-500 to-purple-600",
    accent: "text-violet-500",
    ring: "hover:border-violet-500/60 hover:shadow-violet-500/10",
    needsDomain: true,
    canRegister: false,
  },
  {
    id: "sales",
    label: "Sales",
    tagline: "Work your pipeline & close deals",
    icon: <TrendingUp className="h-7 w-7" />,
    gradient: "from-sky-500 to-blue-600",
    accent: "text-sky-500",
    ring: "hover:border-sky-500/60 hover:shadow-sky-500/10",
    needsDomain: true,
    canRegister: false,
  },
  {
    id: "readonly",
    label: "Read-only",
    tagline: "View dashboards & monitor performance",
    icon: <Eye className="h-7 w-7" />,
    gradient: "from-slate-500 to-slate-600",
    accent: "text-slate-400",
    ring: "hover:border-slate-400/60 hover:shadow-slate-400/10",
    needsDomain: true,
    canRegister: false,
  },
];

export const getRoleCard = (id) => ROLE_CARDS.find((r) => r.id === id);

// Demo credentials, keyed by role card id. Powers the "Fill in demo credentials"
// button on each role's login form. These mirror the accounts created by
// backend/seed.py. All tenant roles use the demo company domain "demo";
// super_admin has no domain field.
export const DEMO_CREDENTIALS = {
  super_admin: { email: "superadmin@leadgenius.ai", password: "super1234", domain: "" },
  owner:       { email: "owner@demo.com",           password: "demo1234",  domain: "demo" },
  manager:     { email: "moe@demo.com",             password: "talha123",  domain: "demo" },
  marketing:   { email: "mia@demo.com",             password: "mkt1234",   domain: "demo" },
  sales:       { email: "sam@demo.com",             password: "sales1234", domain: "demo" },
  readonly:    { email: "rita@demo.com",            password: "ro1234",    domain: "demo" },
};

export const getDemoCredentials = (id) => DEMO_CREDENTIALS[id] || null;
