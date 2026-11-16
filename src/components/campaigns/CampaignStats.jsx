import React from "react";
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import StatTile from "@/components/ui/StatTile";
import { formatCurrency } from "@/lib/data";

const CampaignStats = ({ campaigns, itemVariants }) => {
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leadsGenerated, 0);
  const avgROI = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length
    : 0;

  const stats = [
    { accent: "acc-violet",  title: "Active Campaigns", value: activeCampaigns, trendText: `${campaigns.length} total campaigns`, icon: <Calendar /> },
    { accent: "acc-emerald", title: "Total Budget", value: formatCurrency(totalBudget), trendText: "Across all campaigns", icon: <DollarSign /> },
    { accent: "acc-amber",   title: "Leads Generated", value: totalLeads, trendText: "From all campaigns", icon: <Users /> },
    { accent: "acc-cyan",    title: "Average ROI", value: `${avgROI.toFixed(1)}%`, trendText: "Return on investment", icon: <TrendingUp /> },
  ];

  return (
    <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatTile key={stat.title} accent={stat.accent} title={stat.title} value={stat.value}
          icon={stat.icon} trendText={stat.trendText} />
      ))}
    </motion.div>
  );
};

export default CampaignStats;
