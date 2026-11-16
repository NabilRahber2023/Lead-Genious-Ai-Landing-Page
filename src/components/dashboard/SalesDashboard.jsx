import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Users, Flame, Target, Clock, MessageSquarePlus } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PipelineFunnel from "@/components/dashboard/PipelineFunnel";
import SectionHeader from "@/components/ui/SectionHeader";
import StatList from "@/components/ui/StatList";
import RoleWelcome from "@/components/dashboard/RoleWelcome";
import RecentActivityList from "@/components/dashboard/RecentActivityList";
import AddInteractionDialog from "@/components/leads/AddInteractionDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { leadsApi } from "@/lib/api";
import { useLeadsAll, invalidateLeadData } from "@/lib/queries";
import { useToast } from "@/components/ui/use-toast";
import { getStatusIdByName } from "@/lib/data";

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

// Statuses that are "in flight" — live deals that need ongoing follow-up.
const IN_FLIGHT = ["contacted", "qualified", "proposal", "negotiation"];
const DAY = 24 * 60 * 60 * 1000;
const daysSince = (d) => (d ? (Date.now() - new Date(d).getTime()) / DAY : Infinity);

/* Compact circular progress ring (SVG, no deps). */
const TargetRing = ({ value, target }) => {
  const pct = Math.min(100, target > 0 ? Math.round((value / target) * 100) : 0);
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none">{value}</span>
        <span className="text-[10px] text-muted-foreground">/ {target}</span>
      </div>
    </div>
  );
};

const SalesDashboard = () => {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();
  // Funnel drill-through: click a stage to open Leads filtered to it.
  const goToStage = (name) => {
    const id = getStatusIdByName(name);
    navigate(id ? `/app/leads?status=${id}` : "/app/leads");
  };
  const { toast } = useToast();
  const { data: leads = [] } = useLeadsAll();
  const [selectedLead, setSelectedLead] = useState(null);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);

  const openQuickLog = (lead) => { setSelectedLead(lead); setIsInteractionOpen(true); };

  const handleLogInteraction = async (interaction) => {
    if (!selectedLead) return;
    try {
      await leadsApi.addInteraction(selectedLead.id, interaction);
      invalidateLeadData();
      toast({ title: "Interaction logged", description: `Logged for ${selectedLead.name}.` });
    } catch (e) {
      toast({ title: "Error logging interaction", description: e.message, variant: "destructive" });
    }
    setIsInteractionOpen(false);
    setSelectedLead(null);
  };

  if (isLoading || !data) return <SkeletonDashboard />;

  const { summary, leadsByStatus, recentLeads } = data;
  const hotLeads = leads.filter((l) => (l.score || 0) >= 70).sort((a, b) => b.score - a.score);

  // Closed-won deals touched in the last 7 days = "this week's wins".
  const wonThisWeek = leads.filter(
    (l) => l.status === "closed-won" && daysSince(l.lastContactedAt || l.createdAt) <= 7
  ).length;

  // Overdue = live deals not contacted in 5+ days (or never contacted).
  const overdue = leads
    .filter((l) => IN_FLIGHT.includes(l.status) && daysSince(l.lastContactedAt) > 5)
    .sort((a, b) => daysSince(b.lastContactedAt) - daysSince(a.lastContactedAt));

  return (
    <div className="container py-6">
      <RoleWelcome subtitle="Your pipeline at a glance — focus on what's hot." />
      <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="acc-sky"    title="Active Leads" value={String(summary.activeLeads)} icon={<Users />} trendText="In your pipeline" itemVariants={item} />
          <StatCard accent="acc-rose"    title="Hot Leads (70+)" value={String(hotLeads.length)} icon={<Flame />} trendText="High-priority" itemVariants={item} />
          <StatCard accent="acc-emerald" title="Conversion Rate" value={`${summary.conversionRate}%`} icon={<Target />} trendText="Closed-won / total" itemVariants={item} />
          <motion.div variants={item}>
            <Card className="glass-card acc-bar-top acc-amber h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Weekly Target</CardTitle>
                <span className="acc-tile grid h-9 w-9 place-items-center rounded-xl"><Target className="h-4 w-4" /></span>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                {/* Target comes from the workspace setting (owner-editable). */}
                <TargetRing value={wonThisWeek} target={summary.weeklyTarget || 10} />
                <p className="text-xs text-muted-foreground">Closed-won deals this week</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
              <CardDescription>Leads by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <PipelineFunnel data={leadsByStatus} onStageClick={goToStage} />
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Flame />} accent="acc-amber" title="Hot Leads" description="Score 70 and above — log a touch as you work them" />
              </CardHeader>
              <CardContent>
                <StatList
                  empty="No hot leads right now."
                  items={hotLeads.slice(0, 6).map((l) => ({
                    key: l.id,
                    leading: { icon: <Flame />, accent: "acc-amber" },
                    title: l.name,
                    subtitle: l.company || "—",
                    right: (
                      <>
                        <Badge variant="warning" className="tabular-nums">{l.score}</Badge>
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openQuickLog(l)} title="Log interaction">
                          <MessageSquarePlus className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ),
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader>
                <SectionHeader icon={<Clock />} accent="acc-rose" title="Overdue Follow-ups" description="Live deals not contacted in 5+ days" />
              </CardHeader>
              <CardContent>
                <StatList
                  empty="You're all caught up — nothing overdue."
                  items={overdue.slice(0, 6).map((l) => {
                    const d = daysSince(l.lastContactedAt);
                    const label = d === Infinity ? "never" : `${Math.floor(d)}d ago`;
                    return {
                      key: l.id,
                      leading: { icon: <Clock />, accent: "acc-rose" },
                      title: l.name,
                      subtitle: `${l.company || "—"} · ${l.status}`,
                      right: (
                        <>
                          <Badge variant="warning" className="text-xs">{label}</Badge>
                          <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openQuickLog(l)} title="Log interaction">
                            <MessageSquarePlus className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ),
                    };
                  })}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Latest leads in the pipeline</CardDescription></CardHeader>
            <CardContent><RecentActivityList leads={recentLeads} itemVariants={item} /></CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {selectedLead && (
        <AddInteractionDialog
          isOpen={isInteractionOpen}
          onOpenChange={setIsInteractionOpen}
          leadName={selectedLead.name}
          onSubmit={handleLogInteraction}
        />
      )}
    </div>
  );
};

export default SalesDashboard;
