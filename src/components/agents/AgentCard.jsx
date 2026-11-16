
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Pause, PlusCircle, RefreshCw, Brain, Lock, Cpu, History, ChevronDown } from "lucide-react";
import AgentRunHistory from "@/components/agents/AgentRunHistory";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { hue } from "@/lib/palette";

// Quick steering suggestions shown under the instruction box.
const SUGGESTED_PROMPTS = [
  "Focus on this week's hottest leads",
  "Prioritize the referral channel",
  "One quick win I can do today",
];

// Turn one agent response (multi-line bullets) into clean individual items —
// stripping bullet characters, numbering, and stray "Recommendation N:" prefixes.
const parseBullets = (text) =>
  (text || "")
    .split(/\r?\n/)
    .map((l) =>
      l
        .replace(/^\s*(?:[-•*–—·]\s*)+/, "")                    // leading bullet chars
        .replace(/^\s*\d+[.)]\s*/, "")                           // "1." / "2)" numbering
        .replace(/^\s*recommendation\s*\d*\s*[:.\-]\s*/i, "")    // "Recommendation 1:"
        .replace(/\*\*/g, "")                                    // stray markdown bold
        .trim()
    )
    .filter(Boolean);

// If a bullet is "Short Label: value", split it so the label can be emphasized.
const splitLabel = (item) => {
  const m = item.match(/^([A-Z][\w&/'’ ]{1,26}?):\s+(\S.*)$/);
  if (m && m[1].trim().split(/\s+/).length <= 4) {
    return { label: m[1].trim(), body: m[2].trim() };
  }
  return { label: null, body: item };
};

const AgentCard = ({ agent, isActive, onToggle, onTrigger, onClearMessages, messages, isTyping, isUnavailable, model }) => {
  const { can } = useAuth();
  const canToggle = can("toggleAgents");
  const canRun = can("runAgents");
  // Optional steering instruction sent along with the next run.
  const [instruction, setInstruction] = useState("");
  // One expand toggle covers both recommendations and run history — collapsed
  // by default so an active agent with nothing to show doesn't reserve space.
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef(null);
  const { acc, bg } = hue(agent.accent);
  const showRecommendations = canRun || messages?.length > 0;

  const runNow = () => {
    onTrigger(agent.id, instruction.trim() || undefined);
    setInstruction("");
  };
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };
  // Drives the cursor-follow spotlight glow (same mechanism as StatTile).
  const onSpotlightMove = (e) => {
    const el = cardRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  // Platform-disabled by the super admin: show a clearly locked, greyed card
  // with no controls, so tenant users know the module exists but is switched off.
  if (isUnavailable) {
    return (
      <motion.div variants={cardVariants}>
        <Card className="glass-card border-dashed border-muted-foreground/40 h-full flex flex-col opacity-70">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted/20">
                  {React.cloneElement(agent.icon, { className: "h-6 w-6 text-muted-foreground" })}
                </div>
                <CardTitle className="text-lg text-muted-foreground">{agent.name}</CardTitle>
              </div>
              <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground text-xs font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3" />Unavailable
              </Badge>
            </div>
            <CardDescription className="text-xs leading-relaxed">{agent.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1" />
          <CardFooter className="pt-3 mt-auto">
            <span className="text-xs text-muted-foreground italic w-full text-center py-1.5 flex items-center justify-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />Blocked by super admin
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // ── Active: a compact row (icon, name, effectiveness, status, actions) with
  // recommendations + run history tucked behind a single "Details" expander,
  // so an agent nobody has triggered yet doesn't reserve a wall of empty space.
  if (isActive) {
    return (
      <motion.div variants={cardVariants}>
        <Card ref={cardRef} onMouseMove={onSpotlightMove} className={cn("glass-card app-spotlight acc-bar-top overflow-hidden", acc)}>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:w-64 sm:shrink-0">
              <div className="acc-tile grid h-11 w-11 shrink-0 place-items-center rounded-xl">
                {React.cloneElement(agent.icon, { className: "h-5 w-5" })}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{agent.name}</p>
                {model && (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground" title={`Runs on the local ${model} model via Ollama`}>
                    <Cpu className="h-3 w-3" aria-hidden="true" />{model}
                  </span>
                )}
              </div>
            </div>

            <p className="hidden min-w-0 flex-1 truncate text-xs text-muted-foreground lg:block" title={agent.description}>
              {agent.description}
            </p>

            <div className="sm:w-36 sm:shrink-0">
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Effectiveness</span><span className="font-semibold text-foreground">{agent.effectiveness}%</span>
              </div>
              <Progress value={agent.effectiveness} className="h-1.5" indicatorClassName={bg} />
            </div>

            <Badge variant="success" className="shrink-0 self-start sm:self-auto">Active</Badge>

            <div className="flex shrink-0 items-center gap-2">
              {canToggle && (
                <Button variant="outline" size="sm" onClick={() => onToggle(agent.id)}><Pause className="mr-1.5 h-3.5 w-3.5" />Deactivate</Button>
              )}
              {canRun && (
                <Button size="sm" onClick={runNow} disabled={isTyping} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />{isTyping ? "Thinking..." : "Trigger"}
                </Button>
              )}
              {!canToggle && !canRun && (
                <span className="text-xs italic text-muted-foreground">View only</span>
              )}
              <Button
                variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => setShowDetails((v) => !v)}
                aria-expanded={showDetails}
                aria-label={`${showDetails ? "Hide" : "Show"} details for ${agent.name}`}
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", showDetails && "rotate-180")} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {showDetails && (
            <div className="border-t border-border/40 p-4 pt-3 space-y-4">
              {showRecommendations && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <h4 className="flex items-center text-xs font-semibold text-muted-foreground"><Brain className="mr-1.5 h-3.5 w-3.5" />Recommendations</h4>
                    <Button variant="ghost" size="sm" className="h-6 px-1.5 py-0.5 text-xs" onClick={() => onClearMessages(agent.id)}><RefreshCw className="mr-1 h-3 w-3" />Clear</Button>
                  </div>
                  <div className="min-h-[140px] rounded-lg border border-border/40 bg-background/60 p-4 text-sm leading-relaxed shadow-inner">
                    {messages?.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg, mIdx) => {
                          const items = parseBullets(msg);
                          const typingHere = mIdx === messages.length - 1 && isTyping;
                          return (
                            <div key={mIdx} className={mIdx > 0 ? "border-t border-border/40 pt-3" : ""}>
                              {items.length === 0 ? (
                                <p className="text-sm italic text-muted-foreground typing-animation">Thinking…</p>
                              ) : (
                                <ol className="space-y-2">
                                  {items.map((item, i) => {
                                    const { label, body } = splitLabel(item);
                                    const lastRow = typingHere && i === items.length - 1;
                                    return (
                                      <li key={i} className="flex items-start gap-2.5 rounded-lg bg-muted/40 px-3 py-2">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">{i + 1}</span>
                                        <p className={`text-sm leading-relaxed text-foreground/90 ${lastRow ? "typing-animation" : ""}`}>
                                          {label && <span className="font-semibold text-foreground">{label}: </span>}
                                          {body}
                                        </p>
                                      </li>
                                    );
                                  })}
                                </ol>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 py-6 text-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 opacity-25" />
                        <p className="text-sm italic">No recommendations yet.</p>
                        <p className="text-xs">Click <span className="font-medium text-foreground/70">Trigger</span> to generate advice from your live data.</p>
                      </div>
                    )}
                  </div>

                  {/* Steering instruction + quick suggestions (runners only). */}
                  {canRun && (
                    <div className="mt-2.5 space-y-1.5">
                      <Input
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !isTyping) runNow(); }}
                        placeholder="Optional: steer this run (e.g. focus on referrals)…"
                        maxLength={500}
                        className="h-8 text-xs"
                        aria-label={`Instruction for ${agent.name}`}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_PROMPTS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setInstruction(p)}
                            className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="mb-1.5 flex items-center text-xs font-semibold text-muted-foreground"><History className="mr-1.5 h-3.5 w-3.5" />Run history</h4>
                <AgentRunHistory agentKey={agent.id} />
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    );
  }

  // ── Inactive ("Available Agents"): unchanged compact card — activate only.
  return (
    <motion.div variants={cardVariants}>
      <Card className="glass-card border-dashed border-muted-foreground/40 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted/20">
                {React.cloneElement(agent.icon, { className: "h-5 w-5 text-muted-foreground" })}
              </div>
              <div>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                {model && (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground" title={`Runs on the local ${model} model via Ollama`}>
                    <Cpu className="h-3 w-3" aria-hidden="true" />{model}
                  </span>
                )}
              </div>
            </div>
            <Badge variant="warning" className="shrink-0">Inactive</Badge>
          </div>
          <CardDescription className="text-xs leading-relaxed">{agent.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span>Effectiveness</span><span className="font-semibold text-foreground">{agent.effectiveness}%</span>
          </div>
          <Progress value={agent.effectiveness} className="h-1.5" indicatorClassName="bg-muted-foreground/40" />
        </CardContent>
        <CardFooter className="pt-3 mt-auto">
          {canToggle ? (
            <Button className="w-full animated-gradient text-white" onClick={() => onToggle(agent.id)}><PlusCircle className="mr-1.5 h-4 w-4" />Activate Agent</Button>
          ) : (
            <span className="text-xs text-muted-foreground italic w-full text-center py-1.5">Inactive</span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AgentCard;
