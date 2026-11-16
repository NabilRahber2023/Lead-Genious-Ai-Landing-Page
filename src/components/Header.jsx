import React from "react";
import {
  Settings as SettingsIcon, BarChart2, Users, Zap, MessageSquare, FileText, UserCog, UserCircle,
} from "lucide-react";
import AppShell from "@/components/ui/AppShell";
import NotificationsBell from "@/components/notifications/NotificationsBell";
import CommandPalette from "@/components/CommandPalette";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// Maps a nav item id to its tenant feature-flag name. Items without an entry
// (dashboard, team, settings) are core and never gated by feature flags.
const NAV_FEATURE_MAP = {
  leads: "leads",
  campaigns: "campaigns",
  agents: "ai_agents",
  reports: "reports",
  team: "team_management",
};

// Role display names + accent colors — match the landing's role-card palette
// (shared.jsx ROLES) so a signed-in user sees the same color as on the landing.
const ROLE_DISPLAY = {
  owner: { label: "Business Owner", color: "bg-amber-500" },
  manager: { label: "Manager", color: "bg-emerald-600" },
  marketing: { label: "Marketing", color: "bg-violet-600" },
  sales: { label: "Sales", color: "bg-sky-600" },
  readonly: { label: "Read Only", color: "bg-slate-500" },
};

// roleNames lets a nav item have a different label for a specific role.
// Each section owns one solid color — shown in its active nav pill and page header.
const NAV_ITEMS = [
  { name: "Dashboard", roleNames: { owner: "Command Center" }, icon: <BarChart2 className="h-5 w-5" />, id: "dashboard", color: "bg-indigo-600", roles: ["owner", "manager", "sales", "readonly"] },
  { name: "Leads", icon: <Users className="h-5 w-5" />, id: "leads", color: "bg-sky-600", roles: ["owner", "manager", "marketing", "sales", "readonly"] },
  { name: "Campaigns", icon: <MessageSquare className="h-5 w-5" />, id: "campaigns", color: "bg-violet-600", roles: ["owner", "manager", "marketing", "readonly"] },
  { name: "AI Agents", roleNames: { owner: "AI Control" }, icon: <Zap className="h-5 w-5" />, id: "agents", color: "bg-cyan-600", roles: ["owner", "manager", "marketing", "sales"] },
  { name: "Reports", icon: <FileText className="h-5 w-5" />, id: "reports", color: "bg-emerald-600", roles: ["manager", "marketing", "sales", "readonly"] },
  { name: "Team", icon: <UserCog className="h-5 w-5" />, id: "team", color: "bg-amber-500", roles: ["owner"] },
  { name: "Settings", icon: <SettingsIcon className="h-5 w-5" />, id: "settings", color: "bg-slate-600", roles: ["owner", "manager"] },
];

const Header = ({ setActivePage, activePage, children }) => {
  const { user, logout, role, can, featureEnabled, roleCanAccess } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const roleInfo = ROLE_DISPLAY[role];

  const nav = NAV_ITEMS
    .filter((item) => item.roles.includes(role))
    .filter((item) => {
      const featureKey = NAV_FEATURE_MAP[item.id];
      return featureKey ? featureEnabled(featureKey) : true;
    })
    .filter((item) => roleCanAccess(item.id))
    .map((item) => ({ id: item.id, icon: item.icon, color: item.color, name: item.roleNames?.[role] ?? item.name }));

  return (
    <AppShell
      accent="business"
      brandIcon={Zap}
      brandLabel="LeadGenius AI"
      nav={nav}
      activePage={activePage}
      onNavigate={setActivePage}
      user={user}
      roleBadge={roleInfo}
      theme={theme}
      toggleTheme={toggleTheme}
      bellSlot={<NotificationsBell />}
      onLogout={logout}
      menuItems={[
        { label: "My profile", icon: <UserCircle />, onClick: () => setActivePage("profile"), show: true },
        { label: "Settings", icon: <SettingsIcon />, onClick: () => setActivePage("settings"), show: can("viewSettings") },
      ]}
    >
      {/* Ctrl+K — navigate + search leads/campaigns from anywhere. */}
      <CommandPalette pages={[
        ...nav.map((n) => ({ label: n.name, to: `/app/${n.id}` })),
        { label: "My profile", to: "/app/profile" },
      ]} />
      {children}
    </AppShell>
  );
};

export default Header;
