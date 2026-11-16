import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Users, Flame, Target, Bot } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PipelineFunnel from "@/components/dashboard/PipelineFunnel";
import SectionHeader from "@/components/ui/SectionHeader";
import StatList from "@/components/ui/StatList";
import { CHART_COLORS } from "@/lib/palette";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { useLeadsAll, useTeamQuery, useCampaignsQuery } from "@/lib/queries";
import { periodTrend } from "@/lib/deltas";
import { getStatusIdByName } from "@/lib/data";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

// Role accent colors for the team snapshot badges.
const ROLE_BADGE = {
  owner: "bg-amber-500",
  manager: "bg-green-600",
  marketing: "bg-violet-600",
  sales: "bg-blue-600",
  readonly: "bg-slate-500",
};

const CLOSED = ["closed-won", "closed-lost"];

const initialsOf = (name) => (name || "?").split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

/**
 * Owner Command Center — the executive overview.
 *
 * Strategic governance, not operational detail: KPIs, pipeline shape, AI ROI,
 * channel ROI, hot-lead alerts, and a team snapshot. The owner reads results
 * here; the team does the operational work elsewhere.
 */
const CommandCenter = () => {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();
  // Funnel drill-through: click a stage to open Leads filtered to it.
  const goToStage = (name) => {
    const id = getStatusIdByName(name);
    navigate(id ? `/app/leads?status=${id}` : "/app/leads");
  };
  const { data: leads = [] } = useLeadsAll();
  const { data: team = [] } = useTeamQuery();
  const { data: campaigns = [] } = useCampaignsQuery();

  if (isLoading || !data) return <SkeletonDashboard />;

  const { summary, leadsByStatus, conversionByChannel, agentPerformance, deltas } = data;
  // Real 30-day-vs-prior-30-day trends — arrows only when there's a baseline.
  const leadsTrend = periodTrend(deltas?.leads?.current, deltas?.leads?.previous, "All-time leads");
  const wonTrend = periodTrend(deltas?.won?.current, deltas?.won?.previous, "Closed-won / total");

  // Hot leads = score ≥ 70 and still live in the pipeline (not closed).
  const hotLeads = leads
    .filter((l) => (l.score || 0) >= 70 && !CLOSED.includes(l.status))
    .sort((a, b) => b.score - a.score);

  // AI ROI — agents that have produced converted leads, biggest contributors first.
  const agentRoi = [...(agentPerformance || [])].sort((a, b) => (b.conversions || 0) - (a.conversions || 0));
  const maxAgentLeads = Math.max(...agentRoi.map((a) => a.leads || 0), 1);

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground">Your workspace at a glance — strategic overview, not operational detail.</p>
        </motion.div>

        {/* First-run activation guide — disappears once all steps are done. */}
        <OnboardingChecklist
          leadsCount={leads.length}
          campaignsCount={campaigns.length}
          activeAgents={summary.activeAgents}
          teamCount={team.length}
          itemVariants={item}
        />

        {/* KPI row — trends are real 30d-vs-prior-30d deltas from the backend. */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="acc-sky"    title="Total Leads" value={String(summary.totalLeads)} icon={<Users />} trend={leadsTrend.trend} trendText={leadsTrend.trendText} itemVariants={item} />
          <StatCard accent="acc-rose"    title="Hot Leads (70+)" value={String(hotLeads.length)} icon={<Flame />} trendText="Need attention" itemVariants={item} />
          <StatCard accent="acc-emerald" title="Conversion Rate" value={`${summary.conversionRate}%`} icon={<Target />} trend={wonTrend.trend} trendText={wonTrend.trendText} itemVariants={item} />
          <StatCard accent="acc-violet"  title="Active Agents" value={`${summary.activeAgents}/9`} icon={<Bot />} trendText="AI team online" itemVariants={item} />
        </div>

        {/* Pipeline funnel — custom, each stage its own color */}
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
              <CardDescription>Where your leads sit across the 7 stages</CardDescription>
            </CardHeader>
            <CardContent>
              <PipelineFunnel data={leadsByStatus} onStageClick={goToStage} />
            </CardContent>
          </Card>
        </motion.div>

        {/* AI ROI + Channel ROI */}
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Bot />} accent="acc-cyan" title="AI Agent ROI" description="Leads handled and deals closed per agent" />
              </CardHeader>
              <CardContent>
                <StatList
                  empty="No agent activity yet."
                  items={agentRoi.map((a, i) => ({
                    key: a.name,
                    rank: i + 1,
                    title: a.name,
                    bar: (a.leads || 0) / maxAgentLeads,
                    barColor: CHART_COLORS[i % CHART_COLORS.length],
                    right: (
                      <>
                        <Badge variant="secondary" className="text-xs tabular-nums">{a.leads} leads</Badge>
                        <Badge variant="success" className="text-xs tabular-nums">{a.conversions} won</Badge>
                      </>
                    ),
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>

          <ChartCard title="Channel ROI" description="Conversion rate by acquisition channel" itemVariants={item}>
            <BarChart data={conversionByChannel} layout="vertical" margin={{ left: 8, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={124} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} cursor={{ fill: "hsla(var(--muted-foreground)/0.1)" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {conversionByChannel.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ChartCard>
        </div>

        {/* Hot leads alert + Team snapshot */}
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Flame />} accent="acc-amber" title="Hot Leads Alert" description="Score 70+ and still open — your team should act now" />
              </CardHeader>
              <CardContent>
                <StatList
                  empty="No hot leads in the pipeline right now."
                  items={hotLeads.slice(0, 5).map((l) => ({
                    key: l.id,
                    leading: { icon: <Flame />, accent: "acc-amber" },
                    title: l.name,
                    subtitle: `${l.company || "—"} · ${l.status}`,
                    right: <Badge variant="warning" className="tabular-nums">{l.score}</Badge>,
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Users />} accent="acc-violet" title="Team Snapshot" description="Who is in your workspace" />
              </CardHeader>
              <CardContent>
                <StatList
                  empty="No team members yet. Invite teammates from the Team page."
                  items={team.map((m) => ({
                    key: m.id,
                    leading: { initials: initialsOf(m.name), color: ROLE_BADGE[m.role] || "bg-slate-500" },
                    title: m.name,
                    subtitle: m.email,
                    right: (
                      <>
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize text-white ${ROLE_BADGE[m.role] || "bg-slate-500"}`}>{m.role}</span>
                        {!m.isActive && <Badge variant="outline" className="text-xs">inactive</Badge>}
                      </>
                    ),
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommandCenter;
