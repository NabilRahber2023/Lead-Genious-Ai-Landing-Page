import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/use-toast";
import { adminApi } from "@/lib/api";

const ROLE_LABELS = { owner: "Owner", manager: "Manager", marketing: "Marketing", sales: "Sales", readonly: "Read-only" };

const UserLookup = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async (q) => {
    setLoading(true);
    try {
      setUsers(await adminApi.users(q));
    } catch (e) {
      toast({ title: "Failed to load users", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(""); }, [load]);
  useEffect(() => {
    const id = setTimeout(() => load(search), 300);
    return () => clearTimeout(id);
  }, [search, load]);

  const toggle = async (u) => {
    try {
      const updated = await adminApi.updateUser(u.id, { isActive: !u.isActive });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: updated.isActive } : x)));
      toast({ title: updated.isActive ? "User activated" : "User deactivated" });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader icon={<Users />} accent="acc-sky" eyebrow="Directory"
        title="Users" description="Find and manage any user across all workspaces." />

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Users ({users.length})</CardTitle><CardDescription>Super admins are excluded from this list.</CardDescription></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center text-muted-foreground py-6"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead><tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">{ROLE_LABELS[u.role] || u.role}</td>
                      <td className="px-4 py-3"><Badge variant={u.isActive ? "success" : "outline"}>{u.isActive ? "Active" : "Inactive"}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button variant={u.isActive ? "outline" : "default"} size="sm" onClick={() => toggle(u)}>
                          {u.isActive ? "Deactivate" : "Activate"}
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

export default UserLookup;
