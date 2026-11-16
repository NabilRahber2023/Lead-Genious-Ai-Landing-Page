
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Filter } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import PipelineFunnel from "@/components/dashboard/PipelineFunnel";
import { CHART_COLORS } from "@/lib/palette";
import { analyticsApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { getStatusIdByName } from "@/lib/data";

// Cohesive cool palette — blue primary + violet secondary (no warm greens/ambers).
const BLUE = '#2563eb';
const VIOLET = '#7c3aed';
// Shared, theme-aware chart chrome (works in both light + dark).
const AXIS = "hsl(var(--muted-foreground))";
const GRID = "hsl(var(--border)/0.5)";
const TOOLTIP = { backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", color: "hsl(var(--popover-foreground))" };

const Reports = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  // Funnel drill-through: click a stage to open Leads filtered to it.
  const goToStage = (name) => {
    const id = getStatusIdByName(name);
    navigate(id ? `/app/leads?status=${id}` : "/app/leads");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await analyticsApi.reports();
        if (!cancelled) setData(result);
      } catch (e) {
        toast({ title: "Failed to load reports", description: e.message, variant: "destructive" });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 }}};

  if (isLoading || !data) return <SkeletonDashboard />;

  const { funnel, campaignPerformance, agentEffectiveness } = data;

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PageHeader icon={<BarChart3 />} accent="acc-emerald" eyebrow="Insights"
          title="Reports & Analytics"
          description="Dive deeper into your lead generation data and campaign performance." />

        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <SectionHeader icon={<Filter />} accent="acc-emerald" title="Lead Conversion Funnel" description="Track leads through your sales pipeline." />
            </CardHeader>
            <CardContent>
              <PipelineFunnel data={funnel} onStageClick={goToStage} />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Campaign ROI Overview</CardTitle>
              <CardDescription>Return on investment for your campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis dataKey="name" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke={BLUE} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke={VIOLET} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "hsla(var(--muted-foreground)/0.1)" }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="budget" name="Budget ($)" fill={BLUE} radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="roi" name="ROI (%)" fill={VIOLET} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Deals Closed by Agent</CardTitle>
              <CardDescription>Closed-won leads attributed to each AI agent.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={agentEffectiveness}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis dataKey="name" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "hsla(var(--muted-foreground)/0.1)" }} />
                  <Bar dataKey="leadsClosed" name="Leads Closed" radius={[4, 4, 0, 0]}>
                    {agentEffectiveness.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Reports;
