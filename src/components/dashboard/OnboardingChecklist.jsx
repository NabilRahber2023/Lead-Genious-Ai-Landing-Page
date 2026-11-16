import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Rocket, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/ui/SectionHeader";
import { useToast } from "@/components/ui/use-toast";
import { dataApi } from "@/lib/api";
import { invalidateLeadData, queryClient } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * OnboardingChecklist — the owner's first-run guide (Project Bible R5).
 * Four activation steps computed from live data; each row deep-links to the
 * page where it's done. Hidden automatically once every step is complete.
 * Includes "Load sample data" so an empty workspace can explore with data.
 */
const OnboardingChecklist = ({ leadsCount, campaignsCount, activeAgents, teamCount, itemVariants }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingSample, setLoadingSample] = useState(false);

  const steps = [
    { done: leadsCount > 0, label: "Add your first lead", hint: "Import a CSV or add one by hand.", to: "/app/leads" },
    { done: activeAgents > 0, label: "Activate an AI agent", hint: "Turn on an agent for your team to run.", to: "/app/agents" },
    { done: campaignsCount > 0, label: "Create a campaign", hint: "Track budget, leads, and ROI per channel.", to: "/app/campaigns" },
    { done: teamCount > 1, label: "Invite a teammate", hint: "Each role gets its own portal.", to: "/app/team" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null; // fully activated — get out of the way

  const loadSample = async () => {
    setLoadingSample(true);
    try {
      const res = await dataApi.sample();
      invalidateLeadData();
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Sample data loaded",
        description: `${res.created_leads} leads and ${res.created_campaigns} campaigns added — explore away.`,
      });
    } catch (e) {
      toast({ title: "Couldn't load sample data", description: e.message, variant: "destructive" });
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card acc-bar-top acc-indigo">
        <CardHeader>
          <SectionHeader
            icon={<Rocket />}
            accent="acc-indigo"
            title="Get set up"
            count={`${doneCount}/${steps.length}`}
            description="A few steps and your workspace is fully live."
            actions={leadsCount === 0 && (
              <Button variant="outline" size="sm" onClick={loadSample} disabled={loadingSample}>
                {loadingSample ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                Load sample data
              </Button>
            )}
          />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {steps.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => navigate(s.to)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  s.done ? "opacity-70" : "hover:bg-muted/50"
                )}
              >
                {s.done
                  ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                  : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" aria-hidden="true" />}
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm font-medium", s.done && "line-through decoration-muted-foreground/50")}>
                    {s.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{s.hint}</span>
                </span>
                {!s.done && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingChecklist;
