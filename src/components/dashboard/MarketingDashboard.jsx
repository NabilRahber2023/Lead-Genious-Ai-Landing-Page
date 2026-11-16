import React from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Megaphone, Target, TrendingUp } from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import RoleWelcome from "@/components/dashboard/RoleWelcome";
import SectionHeader from "@/components/ui/SectionHeader";
import StatList from "@/components/ui/StatList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/data";
import { CHART_COLORS } from "@/lib/palette";
import { useDashboard } from "@/hooks/useDashboard";
import { useCampaignsQuery } from "@/lib/queries";

const COLORS = CHART_COLORS;
const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

const MarketingDashboard = () => {
  const { data, isLoading } = useDashboard();
  const { data: campaigns = [] } = useCampaignsQuery();

  if (isLoading || !data) return <SkeletonDashboard />;

  const { conversionByChannel, leadsBySource, leadsByMonth } = data;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
  const avgRoi = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + (c.roi || 0), 0) / campaigns.length) : 0;
  const topCampaigns = [...campaigns].sort((a, b) => (b.roi || 0) - (a.roi || 0)).slice(0, 4);

  return (
    <div className="container py-6">
      <RoleWelcome subtitle="Your campaign performance and channel insights." />
      <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard accent="acc-violet"  title="Active Campaigns" value={`${activeCampaigns}/${campaigns.length}`} icon={<Megaphone />} trendText="Currently running" itemVariants={item} />
          <StatCard accent="acc-emerald" title="Total Budget" value={formatCurrency(totalBudget)} icon={<Target />} trendText="Across all campaigns" itemVariants={item} />
          <StatCard accent="acc-amber"   title="Avg. ROI" value={`${avgRoi}%`} icon={<TrendingUp />} trendText="Return on investment" itemVariants={item} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="Conversion by Channel" description="Which channels convert best" itemVariants={item}>
            <BarChart data={conversionByChannel}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} formatter={(v) => `${v}%`} cursor={{ fill: "hsla(var(--muted-foreground)/0.1)" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {conversionByChannel.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ChartCard>

          <ChartCard title="Leads by Source" description="Where your leads come from" itemVariants={item}>
            <PieChart>
              <Pie data={leadsBySource} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {leadsBySource.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          </ChartCard>
        </div>

        <ChartCard title="Lead Generation Trend" description="Monthly lead acquisition" itemVariants={item}>
          <AreaChart data={leadsByMonth}>
            <defs>
              <linearGradient id="mktArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
            <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#mktArea)" />
          </AreaChart>
        </ChartCard>

        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader>
              <SectionHeader icon={<TrendingUp />} accent="acc-violet" title="Top Campaigns by ROI" description="Your best performers" />
            </CardHeader>
            <CardContent>
              <StatList
                empty="No campaigns yet."
                items={topCampaigns.map((c, i) => ({
                  key: c.id,
                  rank: i + 1,
                  title: c.name,
                  subtitle: `${c.type} · ${c.leadsGenerated} leads`,
                  bar: Math.min((c.roi || 0) / 100, 1),
                  barColor: CHART_COLORS[i % CHART_COLORS.length],
                  right: (
                    <>
                      <Badge variant="success" className="tabular-nums">{c.roi}% ROI</Badge>
                      <span className="hidden text-sm text-muted-foreground tabular-nums sm:inline">{formatCurrency(c.budget)}</span>
                    </>
                  ),
                }))}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MarketingDashboard;
