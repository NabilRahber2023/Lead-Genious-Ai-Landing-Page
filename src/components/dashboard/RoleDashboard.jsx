import React from "react";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "@/components/Dashboard";
import MarketingDashboard from "@/components/dashboard/MarketingDashboard";
import SalesDashboard from "@/components/dashboard/SalesDashboard";
import CommandCenter from "@/components/dashboard/CommandCenter";
import OperationsHub from "@/components/dashboard/OperationsHub";
import ReadonlyDashboard from "@/components/dashboard/ReadonlyDashboard";
import RoleWelcome from "@/components/dashboard/RoleWelcome";

/**
 * Picks the right dashboard for the signed-in role:
 *  - owner     → strategic Command Center (KPIs, AI ROI, hot leads, team)
 *  - manager   → operational Operations Hub (follow-ups, campaigns, agents)
 *  - marketing → campaign-focused dashboard
 *  - sales     → pipeline-focused dashboard
 *  - readonly  → write-free Observer view
 *  - other     → generic dashboard with a personalized banner
 */
const RoleDashboard = () => {
  const { role } = useAuth();

  if (role === "owner") return <CommandCenter />;
  if (role === "manager") return <OperationsHub />;
  if (role === "marketing") return <MarketingDashboard />;
  if (role === "sales") return <SalesDashboard />;
  if (role === "readonly") return <ReadonlyDashboard />;

  return (
    <>
      <div className="container pt-6">
        <RoleWelcome subtitle="" />
      </div>
      <Dashboard />
    </>
  );
};

export default RoleDashboard;
