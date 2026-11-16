import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { leadsApi } from "@/lib/api";
import { useLeadsAll, invalidateLeadData } from "@/lib/queries";
import { leadStatuses } from "@/lib/data";
import { CHART_COLORS } from "@/lib/palette";
import { cn } from "@/lib/utils";

/**
 * LeadsKanban — pipeline board view (Project Bible R13). One column per stage;
 * drag a card to move the lead (native HTML5 DnD — no extra dependency), which
 * PUTs the new status and re-scores server-side. Read-only roles see the board
 * without drag affordances. Clicking a card opens the details dialog.
 */
const LeadsKanban = ({ onViewDetails }) => {
  const { can } = useAuth();
  const { toast } = useToast();
  const { data: leads = [] } = useLeadsAll();
  const canMove = can("editLeads");
  const [dragOverCol, setDragOverCol] = useState(null);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(leadStatuses.map((s) => [s.id, []]));
    for (const l of leads) (map[l.status] || (map[l.status] = [])).push(l);
    for (const key of Object.keys(map)) map[key].sort((a, b) => (b.score || 0) - (a.score || 0));
    return map;
  }, [leads]);

  const moveLead = async (leadId, toStatus) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === toStatus) return;
    try {
      await leadsApi.update(leadId, { status: toStatus });
      invalidateLeadData();
      const stage = leadStatuses.find((s) => s.id === toStatus)?.name || toStatus;
      toast({ title: "Lead moved", description: `${lead.name} → ${stage}.` });
    } catch (e) {
      toast({ title: "Couldn't move lead", description: e.message, variant: "destructive" });
    }
  };

  const onDrop = (e, statusId) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/lead-id");
    if (id) moveLead(id, statusId);
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {leadStatuses.map((stage, i) => {
          const items = byStatus[stage.id] || [];
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <div
              key={stage.id}
              onDragOver={canMove ? (e) => { e.preventDefault(); setDragOverCol(stage.id); } : undefined}
              onDragLeave={canMove ? () => setDragOverCol((c) => (c === stage.id ? null : c)) : undefined}
              onDrop={canMove ? (e) => onDrop(e, stage.id) : undefined}
              className={cn(
                "flex w-64 shrink-0 flex-col rounded-2xl border bg-muted/20 transition-colors",
                dragOverCol === stage.id && "border-primary/60 bg-primary/5"
              )}
              aria-label={`${stage.name}: ${items.length} leads`}
            >
              <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                  {stage.name}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 px-2.5 pb-3">
                {items.length === 0 && (
                  <p className="rounded-xl border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                    {canMove ? "Drop leads here" : "No leads"}
                  </p>
                )}
                {items.map((l) => (
                  <motion.div
                    key={l.id}
                    layout
                    draggable={canMove}
                    onDragStart={canMove ? (e) => e.dataTransfer.setData("text/lead-id", l.id) : undefined}
                    onClick={() => onViewDetails?.(l)}
                    className={cn(
                      "group rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
                      canMove ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      {canMove && <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />}
                    </div>
                    {l.company && <p className="mt-0.5 truncate text-xs text-muted-foreground">{l.company}</p>}
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge
                        variant={l.score >= 70 ? "warning" : "outline"}
                        className="tabular-nums text-[11px]"
                      >
                        {l.score >= 70 && <Flame className="mr-0.5 h-3 w-3" aria-hidden="true" />}
                        {l.score}
                      </Badge>
                      <span className="truncate text-[11px] capitalize text-muted-foreground">{l.channel}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsKanban;
