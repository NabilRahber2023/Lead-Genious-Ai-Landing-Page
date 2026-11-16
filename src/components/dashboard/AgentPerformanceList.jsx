import React from "react";
import { Badge } from "@/components/ui/badge";
import StatList from "@/components/ui/StatList";
import { CHART_COLORS } from "@/lib/palette";
import { getAgentById } from "@/lib/data";

const AgentPerformanceList = ({ agentPerformance = [] }) => {
  // Rank by conversion rate; the bar shows that rate so the leader is obvious.
  const ranked = [...agentPerformance]
    .map((a) => ({ ...a, rate: a.leads ? (a.conversions / a.leads) : 0 }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <StatList
      empty="No agent performance data yet."
      items={ranked.map((a, i) => {
        const details = getAgentById(a.name);
        return {
          key: a.name,
          rank: i + 1,
          title: details?.name || a.name,
          bar: a.rate,
          barColor: CHART_COLORS[i % CHART_COLORS.length],
          right: (
            <>
              <Badge variant="outline" className="text-xs tabular-nums">{a.leads} leads</Badge>
              <Badge variant="success" className="text-xs tabular-nums">{a.conversions} won</Badge>
            </>
          ),
        };
      })}
    />
  );
};

export default AgentPerformanceList;
