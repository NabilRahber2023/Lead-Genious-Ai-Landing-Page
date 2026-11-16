import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Bot, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import { adminApi } from "@/lib/api";
import { agentTypes } from "@/lib/data";

/**
 * Platform-level AI agent control. The super admin picks a company and switches
 * any of the 9 AI modules on/off for it. A disabled agent shows as "Unavailable"
 * on that company's role-based dashboards / AI Agents page and cannot be run or
 * toggled by its own users. State lives in tenants.feature_flags.disabled_agents.
 */
const AgentControl = () => {
  const { toast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState("");
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [disabledAgents, setDisabledAgents] = useState([]);
  const [tenantAgents, setTenantAgents] = useState([]); // company's own on/off state
  const [savingAgent, setSavingAgent] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await adminApi.tenants("");
        setTenants(list);
        if (list.length) setTenantId(list[0].id);
      } catch (e) {
        toast({ title: "Failed to load companies", description: e.message, variant: "destructive" });
      } finally {
        setLoadingTenants(false);
      }
    })();
  }, [toast]);

  // `silent` polling refreshes only the company's on/off state (tenantAgents),
  // not the platform block list the admin may be actively editing.
  const loadDetail = useCallback(async (id, silent = false) => {
    if (!id) return;
    if (!silent) setLoadingDetail(true);
    try {
      const d = await adminApi.tenant(id);
      if (!silent) setDisabledAgents(d.tenant.featureFlags?.disabled_agents || []);
      setTenantAgents(d.agents || []);
    } catch (e) {
      if (!silent) toast({ title: "Failed to load agents", description: e.message, variant: "destructive" });
    } finally {
      if (!silent) setLoadingDetail(false);
    }
  }, [toast]);

  useEffect(() => { loadDetail(tenantId); }, [tenantId, loadDetail]);

  // Live sync: poll the selected company every 5s so deactivations done by its
  // own owner/manager show up here without a manual refresh.
  useEffect(() => {
    if (!tenantId) return;
    const t = setInterval(() => loadDetail(tenantId, true), 5000);
    return () => clearInterval(t);
  }, [tenantId, loadDetail]);

  const toggleAgent = async (agentKey) => {
    const isDisabled = disabledAgents.includes(agentKey);
    const next = isDisabled
      ? disabledAgents.filter((k) => k !== agentKey)
      : [...disabledAgents, agentKey];
    setDisabledAgents(next);
    setSavingAgent(agentKey);
    try {
      const updated = await adminApi.updateTenantFeatures(tenantId, { disabled_agents: next });
      setDisabledAgents(updated.featureFlags?.disabled_agents || next);
      const name = agentTypes.find((a) => a.id === agentKey)?.name || agentKey;
      toast({ title: "AI agent updated", description: `${name} is now ${isDisabled ? "available" : "unavailable"} for this company.` });
    } catch (e) {
      setDisabledAgents(disabledAgents);
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingAgent(null);
    }
  };

  const activeCount = agentTypes.length - disabledAgents.length;
  const selectedTenant = tenants.find((t) => t.id === tenantId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader icon={<Bot />} accent="acc-cyan" eyebrow="Platform control"
        title="AI Agents"
        description="Switch any of the 9 AI modules on or off per company. Disabled agents show as “Unavailable” on that company’s dashboards." />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />Agent Availability</CardTitle>
          <CardDescription>
            Select a company, then enable or disable individual AI agents for it. This is the
            platform-level control — separate from the agent on/off switches the company’s own
            managers use day to day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingTenants ? (
            <div className="flex items-center text-muted-foreground py-4"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading companies…</div>
          ) : tenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No companies on the platform yet.</p>
          ) : (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">Company</span>
                <Select value={tenantId} onValueChange={setTenantId}>
                  <SelectTrigger className="w-[260px] h-9"><SelectValue placeholder="Select a company" /></SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} <span className="text-muted-foreground">· {t.slug}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingDetail
                  ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  : selectedTenant && <Badge variant="secondary" className="font-mono">{activeCount}/{agentTypes.length} active</Badge>}
              </div>

              <div className="divide-y">
                {agentTypes.map((agent) => {
                  const enabled = !disabledAgents.includes(agent.id);   // platform availability (super admin)
                  const companyAgent = tenantAgents.find((a) => a.agentKey === agent.id);
                  const companyActive = companyAgent ? companyAgent.isActive : true; // company's own switch
                  const saving = savingAgent === agent.id;
                  return (
                    <div key={agent.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${enabled ? agent.color : "bg-muted/20"}`}>
                          {React.cloneElement(agent.icon, { className: `h-5 w-5 ${enabled ? "text-primary-foreground" : "text-muted-foreground"}` })}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{agent.name}</p>
                            {enabled
                              ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              : <ShieldOff className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                          </div>
                          {/* Effective status: platform block wins; otherwise reflect the
                              company's own activate/deactivate (live-polled). */}
                          {!enabled ? (
                            <p className="text-xs font-medium text-red-600 dark:text-red-400">Blocked by super admin</p>
                          ) : companyActive ? (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active in company</p>
                          ) : (
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Deactivated by company</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant={enabled ? "default" : "outline"}
                        size="sm"
                        disabled={saving || loadingDetail}
                        onClick={() => toggleAgent(agent.id)}
                        className={`shrink-0 w-[110px] ${enabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-muted-foreground"}`}
                      >
                        {saving
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : (enabled ? "Active" : "Deactivated")}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldOff className="h-3.5 w-3.5" />
                Agents you block show as “Blocked by super admin” on every role that uses them. When a company’s own owner/manager turns an agent off, it appears here as “Deactivated by company” (auto-refreshes every 5s).
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgentControl;
