import React from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BarChart2, Building2, Activity, Users, Bot, UserPlus } from "lucide-react";
import AppShell from "@/components/ui/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import PlatformStats from "@/components/admin/PlatformStats";
import TenantList from "@/components/admin/TenantList";
import SystemHealth from "@/components/admin/SystemHealth";
import UserLookup from "@/components/admin/UserLookup";
import AgentControl from "@/components/admin/AgentControl";
import Onboarding from "@/components/admin/Onboarding";

// Each platform section owns one solid color — its active nav pill + page header.
const NAV = [
  { id: "overview", name: "Overview", icon: <BarChart2 className="h-5 w-5" />, color: "bg-indigo-600" },
  { id: "onboard", name: "Onboard", icon: <UserPlus className="h-5 w-5" />, color: "bg-emerald-600" },
  { id: "tenants", name: "Tenants", icon: <Building2 className="h-5 w-5" />, color: "bg-violet-600" },
  { id: "agents", name: "AI Agents", icon: <Bot className="h-5 w-5" />, color: "bg-cyan-600" },
  { id: "health", name: "Health", icon: <Activity className="h-5 w-5" />, color: "bg-rose-500 dark:bg-indigo-600" },
  { id: "users", name: "Users", icon: <Users className="h-5 w-5" />, color: "bg-sky-600" },
];

const pageVariants = { initial: { opacity: 0, y: 12 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -12 } };

const SECTIONS = {
  overview: PlatformStats,
  onboard: Onboarding,
  tenants: TenantList,
  agents: AgentControl,
  health: SystemHealth,
  users: UserLookup,
};

const SuperAdminPortal = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { section } = useParams();

  // Unknown section in the URL → overview.
  const active = section && SECTIONS[section] ? section : null;
  if (!active) return <Navigate to="/platform/overview" replace />;

  const SectionComponent = SECTIONS[active];

  return (
    <AppShell
      accent="platform"
      brandIcon={Shield}
      brandLabel="Platform Admin"
      nav={NAV}
      activePage={active}
      onNavigate={(id) => navigate(`/platform/${id}`)}
      user={user}
      roleBadge={{ label: "Platform Admin", color: "bg-rose-500 dark:bg-indigo-600" }}
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={logout}
      statusLabel="All systems operational"
    >
      <div className="container py-8">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}>
            <SectionComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
};

export default SuperAdminPortal;
