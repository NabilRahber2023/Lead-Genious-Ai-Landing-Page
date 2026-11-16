
import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import AgentCard from "@/components/agents/AgentCard";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useAIAgents } from "@/hooks/useAIAgents";
import { useAuth } from "@/context/AuthContext";

const AIAgents = () => {
  const {
    activeAgents, agentMessages, isTyping,
    toggleAgent, triggerAgentResponse, clearAgentMessages,
    allAgentTypes, disabledAgents, agentMeta,
  } = useAIAgents();
  const { role } = useAuth();

  // Agents the platform super admin switched off for this tenant.
  const unavailableAgents = allAgentTypes.filter(a => disabledAgents.includes(a.id));
  // "Available" = inactive AND not platform-disabled.
  const availableAgents = allAgentTypes.filter(
    a => !activeAgents.includes(a.id) && !disabledAgents.includes(a.id)
  );

  // Owner governs the AI layer ("AI Control" — toggle on/off, no Run button); the
  // team operates it ("AI Agents" — run agents to generate recommendations).
  const isOwner = role === "owner";
  const pageTitle = isOwner ? "AI Control" : "AI Agents";
  const pageSubtitle = isOwner
    ? "Govern which AI agents are active for your team. You set the strategy — your team runs them."
    : "Manage your AI agents and generate recommendations from live data.";

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 }}};

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <PageHeader icon={<Zap />} accent="acc-cyan" eyebrow="AI workforce"
          title={pageTitle} description={pageSubtitle} />

        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold tracking-tight mb-4">Active Agents</h2>
          <div className="flex flex-col gap-3">
            {activeAgents.length > 0 ? activeAgents.map(agentId => {
              const agent = allAgentTypes.find(a => a.id === agentId);
              if (!agent) return null;
              return (
                <AgentCard
                  key={agent.id} agent={agent} isActive={true}
                  model={agentMeta[agent.id]?.model}
                  onToggle={toggleAgent} onTrigger={triggerAgentResponse} onClearMessages={clearAgentMessages}
                  messages={agentMessages[agent.id]} isTyping={isTyping[agent.id]}
                />
              );
            }) : (
              <div className="col-span-full">
                <EmptyState
                  icon={<Zap />}
                  accent="acc-cyan"
                  title="No active agents"
                  body={isOwner
                    ? "Activate an agent below to make it available to your team."
                    : "No agents are switched on right now. Ask your owner or manager to activate one below."}
                />
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Available Agents</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} isActive={false} model={agentMeta[agent.id]?.model} onToggle={toggleAgent} />
            ))}
          </div>
        </motion.div>

        {unavailableAgents.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-1">Unavailable Agents</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These agents have been disabled for your workspace by the platform administrator.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unavailableAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} isActive={false} isUnavailable />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AIAgents;
