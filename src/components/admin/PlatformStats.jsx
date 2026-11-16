import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Building2, Users, Database, Megaphone, Loader2, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import StatTile from "@/components/ui/StatTile";
import { CHART_COLORS } from "@/lib/palette";
import { adminApi } from "@/lib/api";

// Each bar / slice its own rich solid color.
const COLORS = CHART_COLORS;

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { y: 18, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

const PlatformStats = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setStats(await adminApi.stats());
      } catch (e) {
        toast({ title: "Failed to load stats", description: e.message, variant: "destructive" });
      }
    })();
  }, [toast]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading platform stats…
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
      <PageHeader
        icon={<LayoutDashboard />}
        accent="acc-indigo"
        eyebrow="Platform console"
        title="Platform Overview"
        description="Aggregate metrics across every workspace. No business data is shown."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatTile accent="acc-indigo"  icon={<Building2 />}  label="Total Tenants"      value={stats.totalTenants}   itemVariants={item} />
        <StatTile accent="acc-emerald" icon={<Users />}      label="Total Users"        value={stats.totalUsers}     itemVariants={item} />
        <StatTile accent="acc-violet"  icon={<Database />}   label="Total Lead Records" value={stats.totalLeads}     itemVariants={item} />
        <StatTile accent="acc-amber"   icon={<Megaphone />}  label="Total Campaigns"    value={stats.totalCampaigns} itemVariants={item} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Signups per Month</CardTitle>
            <CardDescription>New workspaces over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.signupsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} cursor={{ fill: "hsla(var(--muted-foreground)/0.1)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.signupsByMonth.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Tenants by Plan</CardTitle>
            <CardDescription>Plan distribution across all workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={stats.planDistribution} cx="50%" cy="50%" innerRadius={52} outerRadius={90} paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {stats.planDistribution.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlatformStats;
