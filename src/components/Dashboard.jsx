
import React from "react";
import { motion } from "framer-motion";
import {
  BarChart, PieChart, AreaChart,
  Bar, Pie, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer
} from "recharts";
import {
  Users, Zap, DollarSign, Target
} from "lucide-react";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import AgentPerformanceList from "@/components/dashboard/AgentPerformanceList";
import RecentActivityList from "@/components/dashboard/RecentActivityList";
import { formatCurrency } from "@/lib/data";
import { CHART_COLORS } from "@/lib/palette";
import { useDashboard } from "@/hooks/useDashboard";

const COLORS = CHART_COLORS;

const Dashboard = () => {
  const { data, isLoading } = useDashboard();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" }}
  };

  if (isLoading || !data) return <SkeletonDashboard />;

  const { summary, leadsByMonth, conversionByChannel, leadsByStatus, leadsBySource, agentPerformance, recentLeads } = data;

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <div className="flex flex-col gap-4">
          <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight">Dashboard</motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground">
            Overview of your lead generation performance and AI agent activities.
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="acc-sky" title="Total Leads" value={summary.totalLeads.toString()}
            icon={<Users />}
            trendText="All-time leads" itemVariants={itemVariants} />
          <StatCard accent="acc-emerald" title="Active Leads" value={summary.activeLeads.toString()}
            icon={<Zap />}
            trendText="In the pipeline" itemVariants={itemVariants} />
          <StatCard accent="acc-violet" title="Conversion Rate" value={`${summary.conversionRate}%`}
            icon={<Target />}
            trendText="Closed-won / total" itemVariants={itemVariants} />
          <StatCard accent="acc-amber" title="Avg. Lead Value" value={formatCurrency(summary.averageLeadValue)}
            icon={<DollarSign />}
            trendText="Budget per lead" itemVariants={itemVariants} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="Lead Generation Trend" description="Monthly lead acquisition over time" itemVariants={itemVariants}>
            <AreaChart data={leadsByMonth}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }} cursor={{fill: "hsla(var(--muted-foreground)/0.1)"}}/>
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS[0]} fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ChartCard>

          <ChartCard title="Lead Status Distribution" description="Current leads by status" itemVariants={itemVariants}>
            <PieChart>
              <Pie data={leadsByStatus} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} legendType="circle">
                {leadsByStatus.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }} />
            </PieChart>
          </ChartCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="Conversion by Channel" description="Conversion rates across different channels" itemVariants={itemVariants}>
            <BarChart data={conversionByChannel}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }} cursor={{fill: "hsla(var(--muted-foreground)/0.1)"}} formatter={(value) => `${value}%`}/>
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {conversionByChannel.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Bar>
            </BarChart>
          </ChartCard>

          <ChartCard title="Lead Source Distribution" description="Where your leads are coming from" itemVariants={itemVariants}>
            <PieChart>
              <Pie data={leadsBySource} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} legendType="circle">
                {leadsBySource.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }} />
            </PieChart>
          </ChartCard>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>AI Agent Performance</CardTitle>
              <CardDescription>Lead generation and conversion by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <AgentPerformanceList agentPerformance={agentPerformance} itemVariants={itemVariants} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest lead generation activities</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivityList leads={recentLeads} itemVariants={itemVariants} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
