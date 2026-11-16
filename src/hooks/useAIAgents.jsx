
import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { agentTypes } from "@/lib/data";
import { agentsApi } from "@/lib/api";
import { useAgentsQuery, queryClient, QK } from "@/lib/queries";
import { useAuth } from "@/context/AuthContext";

// Which of the 9 agents each role actually uses (from research.md §2.2). Roles
// not listed here (owner, manager) get the full set — owner governs all of them
// and the manager runs all of them operationally. Marketing and sales only see
// the agents relevant to their job; the rest are dropped from their view.
//   marketing: drops Prospector (customer-finder) + Guardian (cart-recovery)
//   sales:     drops Oracle (trend-analyzer), Communicator (email-marketer),
//              Loyalty (retention-catalyst)
const ROLE_AGENT_KEYS = {
  marketing: [
    "upsell-specialist", "trend-analyzer", "email-marketer",
    "chat-agent", "outreach-agent", "onboarding-specialist", "retention-catalyst",
  ],
  sales: [
    "customer-finder", "cart-recovery", "upsell-specialist",
    "chat-agent", "outreach-agent", "onboarding-specialist",
  ],
};

export const useAIAgents = () => {
  const [agentMessages, setAgentMessages] = useState({});
  const [isTyping, setIsTyping] = useState({});
  const { toast } = useToast();
  // Agents the platform super admin has switched off for this tenant. They are
  // shown as "Unavailable" and can't be activated or run from here.
  const { disabledAgents, agentDisabled, role } = useAuth();

  // The agents this role is allowed to see at all. `null` = the full set.
  const roleAgentKeys = ROLE_AGENT_KEYS[role] ?? null;
  const inRoleScope = useCallback(
    (key) => (roleAgentKeys ? roleAgentKeys.includes(key) : true),
    [roleAgentKeys]
  );
  // Only the agents relevant to this role (used everywhere the page lists them).
  const roleAgentTypes = roleAgentKeys
    ? agentTypes.filter((a) => roleAgentKeys.includes(a.id))
    : agentTypes;

  // Tenant agent rows from the shared query cache. A platform-disabled agent
  // (or one outside this role's scope) never counts as active, regardless of
  // its stored is_active state.
  const { data: agentRows = [] } = useAgentsQuery();
  const activeAgents = useMemo(
    () =>
      agentRows
        .filter((a) => a.isActive && !disabledAgents.includes(a.agentKey) && inRoleScope(a.agentKey))
        .map((a) => a.agentKey),
    [agentRows, disabledAgents, inRoleScope]
  );
  // key → { model } so cards can show which LLM powers each agent.
  const agentMeta = useMemo(
    () => Object.fromEntries(agentRows.map((a) => [a.agentKey, { model: a.model }])),
    [agentRows]
  );

  const toggleAgent = useCallback(async (agentId) => {
    const agent = agentTypes.find(a => a.id === agentId);
    if (agentDisabled(agentId)) {
      toast({ title: "Agent unavailable", description: `${agent?.name || "This agent"} has been disabled by the platform administrator.`, variant: "destructive" });
      return;
    }
    try {
      const updated = await agentsApi.toggle(agentId);
      queryClient.invalidateQueries({ queryKey: QK.agents });
      if (updated.isActive) {
        setAgentMessages(prev => ({ ...prev, [agentId]: [] }));
        setIsTyping(prev => ({ ...prev, [agentId]: false }));
      }
      toast({
        title: updated.isActive ? "Agent Activated" : "Agent Deactivated",
        description: `${agent?.name || updated.name} is now ${updated.isActive ? "active" : "inactive"}.`,
      });
    } catch (e) {
      toast({ title: "Error toggling agent", description: e.message, variant: "destructive" });
    }
  }, [toast, agentDisabled]);

  // Type a message out character-by-character (the "thinking" animation).
  // Under prefers-reduced-motion the full text renders instantly — the
  // simulated typing is pure decoration and would also read badly to
  // assistive tech announcing partial words.
  const typeOut = useCallback((agentId, message) => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setAgentMessages(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), message] }));
      setIsTyping(prev => ({ ...prev, [agentId]: false }));
      return;
    }
    setAgentMessages(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), ""] }));
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex <= message.length) {
        setAgentMessages(prev => {
          const current = prev[agentId] || [];
          const next = [...current];
          next[next.length - 1] = message.substring(0, charIndex);
          return { ...prev, [agentId]: next };
        });
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(prev => ({ ...prev, [agentId]: false }));
      }
    }, 18);
  }, []);

  // Trigger the agent: call the LLM endpoint (with an optional user-typed
  // steering instruction), then animate the response and refresh run history.
  const triggerAgentResponse = useCallback(async (agentId, instruction) => {
    if (isTyping[agentId]) return;
    if (agentDisabled(agentId)) {
      toast({ title: "Agent unavailable", description: "This agent has been disabled by the platform administrator.", variant: "destructive" });
      return;
    }
    setIsTyping(prev => ({ ...prev, [agentId]: true }));
    try {
      const res = await agentsApi.run(agentId, instruction);
      typeOut(agentId, res.output);
      queryClient.invalidateQueries({ queryKey: QK.agentLogs(agentId) });
      queryClient.invalidateQueries({ queryKey: QK.notifications });
    } catch (e) {
      setIsTyping(prev => ({ ...prev, [agentId]: false }));
      toast({ title: "Agent error", description: e.message, variant: "destructive" });
    }
  }, [isTyping, typeOut, toast, agentDisabled]);

  const clearAgentMessages = useCallback((agentId) => {
    setAgentMessages(prev => ({ ...prev, [agentId]: [] }));
    const agent = agentTypes.find(a => a.id === agentId);
    if (agent) {
      toast({ title: "Messages Cleared", description: `Messages from ${agent.name} cleared.` });
    }
  }, [toast]);

  return {
    activeAgents, agentMessages, isTyping,
    toggleAgent, triggerAgentResponse, clearAgentMessages,
    allAgentTypes: roleAgentTypes,
    disabledAgents,
    agentMeta,
  };
};
