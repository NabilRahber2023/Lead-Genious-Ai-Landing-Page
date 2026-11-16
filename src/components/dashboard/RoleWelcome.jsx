import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getRoleCard } from "@/lib/roles";

const ROLE_LABELS = {
  owner: "Owner", manager: "Manager", marketing: "Marketing", sales: "Sales", readonly: "Read-only",
};

// One solid color per role — the SAME hue the landing's role cards use (shared.jsx
// ROLES), so signing in continues the landing's color for that role.
const ROLE_SOLID = {
  owner: "bg-amber-500", manager: "bg-emerald-600", marketing: "bg-violet-600",
  sales: "bg-sky-600", readonly: "bg-slate-600",
};

/**
 * Personalized banner shown at the top of every role dashboard: greeting,
 * role badge, company name, and an optional subtitle.
 */
const RoleWelcome = ({ subtitle }) => {
  const { user, role } = useAuth();
  const card = getRoleCard(role);
  const solid = ROLE_SOLID[role] || "bg-primary";
  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-5 mb-6 flex items-center justify-between gap-4 flex-wrap"
    >
      <div className="flex items-center gap-4">
        {card && (
          <div className={`p-3 rounded-xl ${solid} text-white`}>{card.icon}</div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${solid} text-white`}>
          {ROLE_LABELS[role] || role}
        </span>
        {user?.tenant_name && (
          <span className="text-xs text-muted-foreground">{user.tenant_name}</span>
        )}
      </div>
    </motion.div>
  );
};

export default RoleWelcome;
