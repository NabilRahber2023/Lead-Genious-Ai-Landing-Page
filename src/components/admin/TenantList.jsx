import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, ArrowLeft, Users, Settings2, Trash2, ShieldCheck, ShieldOff, Bot, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import StatTile from "@/components/ui/StatTile";
import SectionHeader from "@/components/ui/SectionHeader";
import SettingRow from "@/components/ui/SettingRow";
import { adminApi } from "@/lib/api";
import { agentTypes } from "@/lib/data";

const PLANS = ["free", "starter", "growth", "agency", "enterprise"];
const TENANT_ROLES = ["owner", "manager", "marketing", "sales", "readonly"];
const ROLE_LABELS = { owner: "Owner", manager: "Manager", marketing: "Marketing", sales: "Sales", readonly: "Read-only" };

const DEFAULT_FLAGS = {
  leads_enabled: true,
  campaigns_enabled: true,
  ai_agents_enabled: true,
  reports_enabled: true,
  team_management_enabled: true,
};

const FLAG_LABELS = {
  leads_enabled: "Leads",
  campaigns_enabled: "Campaigns",
  ai_agents_enabled: "AI Agents",
  reports_enabled: "Reports",
  team_management_enabled: "Team Management",
};

const TenantDetail = ({ tenantId, onBack, onDeleted }) => {
  const { toast } = useToast();
  const [detail, setDetail] = useState(null);
  const [savingFlags, setSavingFlags] = useState(false);
  const [savingAgent, setSavingAgent] = useState(null);
  const [localFlags, setLocalFlags] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await adminApi.tenant(tenantId);
      setDetail(d);
      setLocalFlags(d.tenant.featureFlags || DEFAULT_FLAGS);
    } catch (e) {
      toast({ title: "Failed to load tenant", description: e.message, variant: "destructive" });
    }
  }, [tenantId, toast]);

  useEffect(() => { load(); }, [load]);

  const toggleFlag = async (key) => {
    const next = { ...localFlags, [key]: !localFlags[key] };
    setLocalFlags(next);
    setSavingFlags(true);
    try {
      const updated = await adminApi.updateTenantFeatures(tenantId, next);
      setLocalFlags(updated.featureFlags || next);
      toast({ title: "Feature updated", description: `${FLAG_LABELS[key]} is now ${next[key] ? "enabled" : "disabled"}.` });
    } catch (e) {
      setLocalFlags(localFlags);
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingFlags(false);
    }
  };

  // Per-tenant AI agent control. The set of disabled agent_keys lives inside the
  // tenant's feature_flags (key: disabled_agents). Disabling one makes it show as
  // "Unavailable" on that tenant's AI Agents page and blocks running/toggling it.
  const disabledAgents = localFlags?.disabled_agents || [];

  const toggleAgent = async (agentKey) => {
    const isDisabled = disabledAgents.includes(agentKey);
    const next = isDisabled
      ? disabledAgents.filter((k) => k !== agentKey)
      : [...disabledAgents, agentKey];
    setLocalFlags((prev) => ({ ...prev, disabled_agents: next }));
    setSavingAgent(agentKey);
    try {
      const updated = await adminApi.updateTenantFeatures(tenantId, { disabled_agents: next });
      setLocalFlags(updated.featureFlags || { ...localFlags, disabled_agents: next });
      const name = agentTypes.find((a) => a.id === agentKey)?.name || agentKey;
      toast({ title: "AI agent updated", description: `${name} is now ${isDisabled ? "available" : "unavailable"} for this workspace.` });
    } catch (e) {
      setLocalFlags((prev) => ({ ...prev, disabled_agents: disabledAgents }));
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingAgent(null);
    }
  };

  const toggleUserActive = async (u) => {
    try {
      const updated = await adminApi.updateUser(u.id, { isActive: !u.isActive });
      setDetail((prev) => ({
        ...prev,
        users: prev.users.map((x) => (x.id === u.id ? { ...x, isActive: updated.isActive } : x)),
      }));
      toast({ title: updated.isActive ? "User activated" : "User deactivated", description: u.email });
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const changeUserRole = async (u, role) => {
    try {
      const updated = await adminApi.updateUserRole(u.id, role);
      setDetail((prev) => ({
        ...prev,
        users: prev.users.map((x) => (x.id === u.id ? { ...x, role: updated.role } : x)),
      }));
      toast({ title: "Role updated", description: `${u.name} is now ${ROLE_LABELS[role] || role}.` });
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteTenant(tenantId);
      toast({ title: "Workspace deleted", description: `${detail.tenant.name} and all its data have been permanently removed.` });
      onDeleted();
    } catch (e) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!detail || !localFlags) {
    return <div className="flex items-center text-muted-foreground py-6"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading…</div>;
  }

  const t = detail.tenant;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-2"><ArrowLeft className="h-4 w-4 mr-2" />Back to tenants</Button>

      {/* Tenant header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight">{t.name}</h1>
        <Badge variant={t.isActive ? "success" : "outline"}>{t.isActive ? "Active" : "Deactivated"}</Badge>
        <Badge variant="secondary" className="uppercase">{t.plan}</Badge>
        <span className="text-sm text-muted-foreground font-mono">{t.slug}</span>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile accent="acc-sky"    icon={<Users className="h-5 w-5" />} label="Lead records"     value={t.leadCount} />
        <StatTile accent="acc-violet"  icon={<Bot className="h-5 w-5" />}   label="Campaigns"        value={t.campaignCount} />
        <StatTile accent="acc-emerald" icon={<Bot className="h-5 w-5" />}   label="Active AI agents" value={`${detail.activeAgents}/9`} />
      </div>

      {/* Feature flags */}
      <Card className="glass-card">
        <CardHeader>
          <SectionHeader icon={<Settings2 />} accent="acc-violet" title="Feature Access"
            description="Toggle which modules this workspace can use. Changes take effect immediately." />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(FLAG_LABELS).map(([key, label]) => {
              const enabled = localFlags[key] ?? true;
              return (
                <SettingRow
                  key={key}
                  icon={enabled ? <ShieldCheck /> : <ShieldOff />}
                  accent={enabled ? "acc-emerald" : "acc-slate"}
                  title={label}
                  control={
                    <Button
                      variant={enabled ? "default" : "outline"}
                      size="sm"
                      disabled={savingFlags}
                      onClick={() => toggleFlag(key)}
                      className={enabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                    >
                      {enabled ? "Enabled" : "Disabled"}
                    </Button>
                  }
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Agents — per-tenant control */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4" />AI Agents</CardTitle>
          <CardDescription>
            Enable or disable individual AI modules for this workspace. Disabled agents
            appear as “Unavailable” on the tenant’s AI Agents page and cannot be run or
            toggled by its users. {disabledAgents.length} of {agentTypes.length} disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {agentTypes.map((agent) => {
              const enabled = !disabledAgents.includes(agent.id);
              return (
                <div key={agent.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {enabled
                      ? <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      : <ShieldOff className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                    </div>
                  </div>
                  <Button
                    variant={enabled ? "default" : "outline"}
                    size="sm"
                    disabled={savingAgent === agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={`shrink-0 ${enabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                  >
                    {savingAgent === agent.id && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                    {enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Users */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" />Users ({detail.users.length})</CardTitle>
          <CardDescription>Change roles or deactivate individual accounts without affecting the whole workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead><tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr></thead>
              <tbody>
                {detail.users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium">{u.name}</td>
                    <td className="px-4 py-2 text-muted-foreground text-sm">{u.email}</td>
                    <td className="px-4 py-2">
                      <Select value={u.role} onValueChange={(role) => changeUserRole(u, role)}>
                        <SelectTrigger className="w-[130px] h-8 capitalize"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TENANT_ROLES.map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">{ROLE_LABELS[r]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={u.isActive ? "success" : "outline"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button variant={u.isActive ? "outline" : "default"} size="sm" onClick={() => toggleUserActive(u)}>
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30 glass-card">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2"><Trash2 className="h-4 w-4" />Danger Zone</CardTitle>
          <CardDescription>Permanently delete this workspace and all its data — users, leads, campaigns, and agents. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmDelete ? (
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>Delete Workspace</Button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-red-400 font-medium">Are you sure? This will permanently delete <strong>{t.name}</strong> and all its data.</p>
              <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
                {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Yes, delete permanently
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TenantList = () => {
  const { toast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (q) => {
    setLoading(true);
    try {
      setTenants(await adminApi.tenants(q));
    } catch (e) {
      toast({ title: "Failed to load tenants", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(""); }, [load]);

  // Debounced search.
  useEffect(() => {
    const id = setTimeout(() => load(search), 300);
    return () => clearTimeout(id);
  }, [search, load]);

  const changePlan = async (id, plan) => {
    try {
      await adminApi.updateTenant(id, { plan });
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, plan } : t)));
      toast({ title: "Plan updated", description: `Tenant is now on the ${plan} plan.` });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const toggleActive = async (t) => {
    try {
      const updated = await adminApi.updateTenant(t.id, { isActive: !t.isActive });
      setTenants((prev) => prev.map((x) => (x.id === t.id ? { ...x, isActive: updated.isActive } : x)));
      toast({ title: updated.isActive ? "Workspace activated" : "Workspace deactivated" });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  if (selected) {
    return (
      <TenantDetail
        tenantId={selected}
        onBack={() => setSelected(null)}
        onDeleted={() => { setSelected(null); load(""); }}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader icon={<Building2 />} accent="acc-violet" eyebrow="Workspaces"
        title="Tenants" description="Every business workspace on the platform." />

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search by name or slug…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>All Tenants ({tenants.length})</CardTitle><CardDescription>Click a tenant to view details.</CardDescription></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center text-muted-foreground py-6"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead><tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Users</th><th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <button className="font-medium hover:underline text-left" onClick={() => setSelected(t.id)}>{t.name}</button>
                        <div className="text-xs text-muted-foreground">{t.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Select value={t.plan} onValueChange={(plan) => changePlan(t.id, plan)}>
                          <SelectTrigger className="w-[130px] h-8 capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PLANS.map((p) => (<SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">{t.userCount}</td>
                      <td className="px-4 py-3">{t.leadCount}</td>
                      <td className="px-4 py-3"><Badge variant={t.isActive ? "success" : "outline"}>{t.isActive ? "Active" : "Inactive"}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button variant={t.isActive ? "outline" : "default"} size="sm" onClick={() => toggleActive(t)}>
                          {t.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TenantList;
