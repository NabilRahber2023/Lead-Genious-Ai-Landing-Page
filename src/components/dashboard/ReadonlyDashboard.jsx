import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Users, Flame, Target, Bot, Eye } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PipelineFunnel from "@/components/dashboard/PipelineFunnel";
import RoleWelcome from "@/components/dashboard/RoleWelcome";
import SectionHeader from "@/components/ui/SectionHeader";
import StatList from "@/components/ui/StatList";
import { CHART_COLORS } from "@/lib/palette";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { useLeadsAll } from "@/lib/queries";
import { getStatusIdByName } from "@/lib/data";

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

const CLOSED = ["closed-won", "closed-lost"];

/**
 * Read-only Observer view — a clean, write-free overview for stakeholders and
 * auditors. Same KPI shape as the Command Center, but no actions of any kind:
 * just numbers, pipeline shape, channel ROI, and a hot-leads readout.
 */
const ReadonlyDashboard = () => {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();
  // Funnel drill-through: click a stage to open Leads filtered to it.
  const goToStage = (name) => {
    const id = getStatusIdByName(name);
    navigate(id ? `/app/leads?status=${id}` : "/app/leads");
  };
  const { data: leads = [] } = useLeadsAll();

  if (isLoading || !data) return <SkeletonDashboard />;

  const { summary, leadsByStatus, conversionByChannel } = data;
  const hotLeads = leads
    .filter((l) => (l.score || 0) >= 70 && !CLOSED.includes(l.status))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="container py-6">
      <RoleWelcome subtitle="Read-only overview — you can view but not change anything." />
      <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
        <motion.div variants={item} className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" /> Observer mode · this dashboard is view-only
        </motion.div>

        {/* KPI row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="acc-sky"    title="Total Leads" value={String(summary.totalLeads)} icon={<Users />} trendText="All-time leads" itemVariants={item} />
          <StatCard accent="acc-rose"    title="Hot Leads (70+)" value={String(hotLeads.length)} icon={<Flame />} trendText="Open & high-score" itemVariants={item} />
          <StatCard accent="acc-emerald" title="Conversion Rate" value={`${summary.conversionRate}%`} icon={<Target />} trendText="Closed-won / total" itemVariants={item} />
          <StatCard accent="acc-violet"  title="Active Agents" value={`${summary.activeAgents}/9`} icon={<Bot />} trendText="AI team online" itemVariants={item} />
        </div>

        {/* Pipeline funnel */}
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
              <CardDescription>Where leads sit across the 7 stages</CardDescription>
            </CardHeader>
            <CardContent>
              <PipelineFunnel data={leadsByStatus} onStageClick={goToStage} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Channel ROI + hot leads */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Channel ROI" description="Conversion rate by acquisition channel" itemVariants={item}>
            <BarChart data={conversionByChannel}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} cursor={{ fill: "hsla(var(--muted-foreground)/0.1)" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {conversionByChannel.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ChartCard>

          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Flame />} accent="acc-amber" title="Hot Leads" description="Score 70+ and still open" />
              </CardHeader>
              <CardContent>
                <StatList
                  empty="No hot leads in the pipeline right now."
                  items={hotLeads.slice(0, 6).map((l) => ({
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
        </div>
      </motion.div>
    </div>
  );
};

export default ReadonlyDashboard;
