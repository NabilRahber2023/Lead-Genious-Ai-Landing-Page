import React from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatList from "@/components/ui/StatList";
import { getStatusById, formatRelativeTime } from "@/lib/data";

const initialsOf = (name) => (name || "?").split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const RecentActivityList = ({ leads }) => (
  <StatList
    empty="No recent activity."
    items={leads.slice(0, 5).map((lead) => ({
      key: lead.id,
      leading: { initials: initialsOf(lead.name), color: "bg-indigo-600" },
      title: lead.name,
      subtitle: lead.company,
      right: (
        <>
          <Badge variant="outline" className="capitalize">
            {(getStatusById(lead.status)?.name || lead.status).replace("-", " ")}
          </Badge>
          {lead.createdAt && (
            <span className="hidden items-center text-xs text-muted-foreground sm:flex">
              <Clock className="mr-1 h-3 w-3" />{formatRelativeTime(lead.createdAt)}
            </span>
          )}
        </>
      ),
    }))}
  />
);

export default RecentActivityList;
