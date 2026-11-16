import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Users, Flame, Gauge, Megaphone, Clock, Bot } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PipelineFunnel from "@/components/dashboard/PipelineFunnel";
import SectionHeader from "@/components/ui/SectionHeader";
import StatList from "@/components/ui/StatList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { useLeadsAll, useCampaignsQuery, useAgentsQuery } from "@/lib/queries";
import { getStatusIdByName } from "@/lib/data";

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
// Stages where a lead is "in flight" and a follow-up is expected.
const IN_FLIGHT = ["contacted", "qualified", "proposal", "negotiation"];

/**
 * Manager Operations Hub — the daily operational overview.
 *
 * Where the owner's Command Center is strategic, the manager's hub is tactical:
 * pipeline health, overdue follow-ups, live campaigns, and which AI agents are
 * online to run. Everything points at "what needs doing today".
 */
const OperationsHub = () => {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();
  // Funnel drill-through: click a stage to open Leads filtered to it.
  const goToStage = (name) => {
    const id = getStatusIdByName(name);
    navigate(id ? `/app/leads?status=${id}` : "/app/leads");
  };
  // All three lists come from the shared query cache (deduped with other pages).
  const { data: leads = [] } = useLeadsAll();
  const { data: campaigns = [] } = useCampaignsQuery();
  const { data: agents = [] } = useAgentsQuery();

  if (isLoading || !data) return <SkeletonDashboard />;

  const { summary, leadsByStatus } = data;

  const hotLeads = leads.filter((l) => (l.score || 0) >= 70);
  const avgScore = leads.length
    ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length)
    : 0;

  const now = Date.now();
  const daysSince = (iso) => Math.floor((now - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  const overdue = leads
    .filter((l) => IN_FLIGHT.includes(l.status) &&
      (!l.lastContactedAt || (now - new Date(l.lastContactedAt).getTime()) > SEVEN_DAYS))
    .sort((a, b) => {
      const da = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
      const dbb = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
      return da - dbb; // oldest / never-contacted first
    });

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const activeAgents = agents.filter((a) => a.isActive);

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight">Operations Hub</h1>
          <p className="text-muted-foreground">Daily operations — pipeline health, follow-ups, campaigns, and AI activity.</p>
        </motion.div>

        {/* KPI row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="acc-sky"    title="Open Leads" value={String(summary.activeLeads)} icon={<Users />} trendText="Active pipeline" itemVariants={item} />
          <StatCard accent="acc-rose"    title="Hot Leads (70+)" value={String(hotLeads.length)} icon={<Flame />} trendText="Need action today" itemVariants={item} />
          <StatCard accent="acc-amber"   title="Avg. Lead Score" value={String(avgScore)} icon={<Gauge />} trendText="Pipeline quality" itemVariants={item} />
          <StatCard accent="acc-violet"  title="Active Campaigns" value={String(activeCampaigns.length)} icon={<Megaphone />} trendText="Running now" itemVariants={item} />
        </div>

        {/* Overdue follow-ups + Pipeline health */}
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Clock />} accent="acc-rose" title="Overdue Follow-ups" description="In-flight leads not contacted in 7+ days" />
              </CardHeader>
              <CardContent>
                <StatList
                  empty="No overdue follow-ups. Pipeline is on track."
                  items={overdue.slice(0, 6).map((l) => ({
                    key: l.id,
                    leading: { icon: <Clock />, accent: "acc-rose" },
                    title: l.name,
                    subtitle: `${l.company || "—"} · ${l.status}`,
                    right: (
                      <Badge variant="destructive" className="text-xs">
                        {l.lastContactedAt ? `${daysSince(l.lastContactedAt)}d ago` : "never"}
                      </Badge>
                    ),
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="text-lg">Pipeline Health</CardTitle>
                <CardDescription>Leads across the 7 stages</CardDescription>
              </CardHeader>
              <CardContent>
                <PipelineFunnel data={leadsByStatus} onStageClick={goToStage} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Active campaigns + Agent status */}
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Megaphone />} accent="acc-violet" title="Active Campaigns" description="Campaigns running right now" />
              </CardHeader>
              <CardContent>
                <StatList
                  empty="No active campaigns."
                  items={activeCampaigns.slice(0, 6).map((c) => ({
                    key: c.id,
                    leading: { icon: <Megaphone />, accent: "acc-violet" },
                    title: c.name,
                    subtitle: `$${(c.budget || 0).toLocaleString()} budget · ${c.leadsGenerated || 0} leads`,
                    right: <Badge variant="success" className="text-xs tabular-nums">{c.roi || 0}% ROI</Badge>,
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Bot />} accent="acc-cyan" title="AI Agent Status" count={`${activeAgents.length}/${agents.length || 9}`}
                  description="Online agents — run them from the AI Agents page" />
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Agent status unavailable.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {agents.map((a) => (
                      <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/50">
                        <span className="truncate text-sm">{a.name}</span>
                        <Badge variant={a.isActive ? "success" : "warning"} className="text-xs">{a.isActive ? "Active" : "Off"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OperationsHub;
