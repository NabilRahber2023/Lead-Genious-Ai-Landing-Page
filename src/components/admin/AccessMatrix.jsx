import React, { useEffect, useState, useCallback } from "react";
import { Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { adminApi } from "@/lib/api";

// Tenant roles, top to bottom.
const ROLES = [
  { id: "owner", label: "Owner" },
  { id: "manager", label: "Manager" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "readonly", label: "Read-only" },
];

// Controllable modules (nav ids). Dashboard is core and never gated here.
const MODULES = [
  { id: "leads", label: "Leads" },
  { id: "campaigns", label: "Campaigns" },
  { id: "agents", label: "AI Agents" },
  { id: "reports", label: "Reports" },
  { id: "team", label: "Team" },
  { id: "settings", label: "Settings" },
];

// Which modules each role can ever reach — mirrors NAV_ITEMS in Header.jsx.
// A "—" cell means the role has no such capability by design (not toggleable).
const DEFAULT_ACCESS = {
  owner: ["leads", "campaigns", "agents", "team", "settings"],
  manager: ["leads", "campaigns", "agents", "reports", "settings"],
  marketing: ["leads", "campaigns", "agents", "reports"],
  sales: ["leads", "agents", "reports"],
  readonly: ["leads", "campaigns", "reports"],
};

const AccessMatrix = () => {
  const { toast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState("");
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [roleAccess, setRoleAccess] = useState({}); // { role: { module: false } }
  const [savingCell, setSavingCell] = useState(null);

  // Load the tenant list for the company selector.
  useEffect(() => {
    (async () => {
      try {
        const list = await adminApi.tenants("");
        setTenants(list);
        if (list.length) setTenantId(list[0].id);
      } catch (e) {
        toast({ title: "Failed to load tenants", description: e.message, variant: "destructive" });
      } finally {
        setLoadingTenants(false);
      }
    })();
  }, [toast]);

  // Load the selected tenant's current role-access overrides.
  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    setLoadingDetail(true);
    try {
      const d = await adminApi.tenant(id);
      setRoleAccess(d.tenant.featureFlags?.role_access || {});
    } catch (e) {
      toast({ title: "Failed to load access settings", description: e.message, variant: "destructive" });
    } finally {
      setLoadingDetail(false);
    }
  }, [toast]);

  useEffect(() => { loadDetail(tenantId); }, [tenantId, loadDetail]);

  const isEnabled = (role, module) => roleAccess?.[role]?.[module] !== false;

  const toggleCell = async (role, module) => {
    const enabled = isEnabled(role, module);
    const next = { ...roleAccess };
    const roleMap = { ...(next[role] || {}) };
    if (enabled) roleMap[module] = false;   // turn access off → store explicit false
    else delete roleMap[module];            // back to default (allowed)
    if (Object.keys(roleMap).length) next[role] = roleMap;
    else delete next[role];

    setRoleAccess(next);
    setSavingCell(`${role}:${module}`);
    try {
      const updated = await adminApi.updateTenantFeatures(tenantId, { role_access: next });
      setRoleAccess(updated.featureFlags?.role_access || next);
      const roleLabel = ROLES.find((r) => r.id === role)?.label || role;
      const modLabel = MODULES.find((m) => m.id === module)?.label || module;
      toast({ title: "Access updated", description: `${roleLabel} · ${modLabel} is now ${enabled ? "hidden" : "visible"}.` });
    } catch (e) {
      setRoleAccess(roleAccess);
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingCell(null);
    }
  };

  // How many of a role's available modules are currently enabled.
  const accessSummary = (role) => {
    const total = DEFAULT_ACCESS[role].length;
    const on = DEFAULT_ACCESS[role].filter((m) => isEnabled(role, m)).length;
    return `${on}/${total}`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Role-Based Access Control</CardTitle>
        <CardDescription>
          Control how much of the system each role can reach, per company. This is the
          per-role layer — separate from the workspace-wide module switches on the
          <span className="font-medium"> Tenants</span> page and the individual account
          controls on the <span className="font-medium"> Users</span> page. Turning a cell
          off hides that module from that role in the selected company only.
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
                <SelectTrigger className="w-[240px] h-9"><SelectValue placeholder="Select a company" /></SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} <span className="text-muted-foreground">· {t.slug}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingDetail && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Role</th>
                    <th className="px-4 py-2 font-medium text-center">Access</th>
                    {MODULES.map((m) => (
                      <th key={m.id} className="px-3 py-2 font-medium text-center whitespace-nowrap">{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 font-medium capitalize">{r.label}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant="secondary" className="font-mono">{accessSummary(r.id)}</Badge>
                      </td>
                      {MODULES.map((m) => {
                        const available = DEFAULT_ACCESS[r.id].includes(m.id);
                        if (!available) {
                          return <td key={m.id} className="px-3 py-2 text-center text-muted-foreground/40">—</td>;
                        }
                        const enabled = isEnabled(r.id, m.id);
                        const saving = savingCell === `${r.id}:${m.id}`;
                        return (
                          <td key={m.id} className="px-3 py-2 text-center">
                            <Button
                              variant={enabled ? "default" : "outline"}
                              size="sm"
                              disabled={saving || loadingDetail}
                              onClick={() => toggleCell(r.id, m.id)}
                              className={`h-7 w-[68px] ${enabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-muted-foreground"}`}
                            >
                              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (enabled ? "On" : "Off")}
                            </Button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              A “—” means the role never has that module by design. Changes apply to users on their next sign-in.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessMatrix;
