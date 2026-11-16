import React from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import RoleDashboard from "@/components/dashboard/RoleDashboard";
import LeadsManagement from "@/components/LeadsManagement";
import AIAgents from "@/components/AIAgents";
import Campaigns from "@/components/Campaigns";
import Reports from "@/components/reports/Reports";
import Settings from "@/components/settings/Settings";
import TeamManagement from "@/components/team/TeamManagement";
import ProfilePage from "@/components/profile/ProfilePage";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 },
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

// Which roles may reach each page — mirrors the nav in Header.jsx exactly.
// Owner: no reports (sees KPIs in Command Center); AI Agents = management/control view only.
// Marketing: no dashboard (lands on campaigns); Sales: no campaigns.
const PAGE_ROLES = {
  dashboard: ["owner", "manager", "sales", "readonly"],
  leads:     ["owner", "manager", "marketing", "sales", "readonly"],
  campaigns: ["owner", "manager", "marketing", "readonly"],
  agents:    ["owner", "manager", "marketing", "sales"],
  reports:   ["manager", "marketing", "sales", "readonly"],   // owner excluded
  settings:  ["owner", "manager"],
  team:      ["owner"],
  profile:   ["owner", "manager", "marketing", "sales", "readonly"], // everyone
};

// Marketing's primary workspace is Campaigns, so land them there on login.
const getDefaultPage = (role) => (role === "marketing" ? "campaigns" : "dashboard");

const PAGES = {
  dashboard: RoleDashboard,
  leads: LeadsManagement,
  agents: AIAgents,
  campaigns: Campaigns,
  reports: Reports,
  settings: Settings,
  team: TeamManagement,
  profile: ProfilePage,
};

/**
 * The shared shell for every tenant-level user (owner + manager/marketing/
 * sales/readonly). URL-routed: /app/:page. Navigation and in-page controls are
 * filtered by role, so each role effectively gets its own landing experience.
 */
const BusinessPortal = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const { page } = useParams();

  // /app (no page) → this role's default workspace.
  if (!page) return <Navigate to={`/app/${getDefaultPage(role)}`} replace />;

  // Guard: unknown page or one this role can't reach → back to the default.
  if (!PAGES[page] || !PAGE_ROLES[page]?.includes(role)) {
    return <Navigate to={`/app/${getDefaultPage(role)}`} replace />;
  }

  const PageComponent = PAGES[page];

  return (
    <Header setActivePage={(id) => navigate(`/app/${id}`)} activePage={page}>
      {/* Temp-password prompt — shown everywhere except the profile page itself. */}
      {user?.must_change_password && page !== "profile" && (
        <div className="container pt-4">
          <Alert
            variant="warning"
            title="You're using a temporary password"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate("/app/profile")}>
                Set a new password
              </Button>
            }
          >
            Choose your own password to secure your account.
          </Alert>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={page} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
          <PageComponent />
        </motion.div>
      </AnimatePresence>
    </Header>
  );
};

export default BusinessPortal;
