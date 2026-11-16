import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { UserPlus, Loader2, Copy, ShieldCheck, Trash2, UserCog, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { teamApi } from "@/lib/api";

const ASSIGNABLE_ROLES = ["manager", "marketing", "sales", "readonly"];
const ROLE_LABELS = {
  owner: "Owner", manager: "Manager", marketing: "Marketing", sales: "Sales", readonly: "Read-only",
};

const TeamManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "sales" });
  const [tempPassword, setTempPassword] = useState(null);
  // Password-reset result: { name, password } shown once in its own dialog.
  const [resetResult, setResetResult] = useState(null);

  const load = useCallback(async () => {
    try {
      setMembers(await teamApi.list());
    } catch (e) {
      toast({ title: "Failed to load team", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await teamApi.invite(form);
      setTempPassword(res.tempPassword);
      setForm({ name: "", email: "", role: "sales" });
      await load();
      toast({ title: "Member invited", description: `${res.member.name} was added to your workspace.` });
    } catch (err) {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await teamApi.updateRole(id, role);
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
      toast({ title: "Role updated", description: `Member is now ${ROLE_LABELS[role]}.` });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  // Local-first "forgot password": generates a new one-time temp password the
  // owner shares out-of-band. The member is prompted to change it on sign-in.
  const handleResetPassword = async (member) => {
    try {
      const res = await teamApi.resetPassword(member.id);
      setResetResult({ name: member.name, password: res.tempPassword });
    } catch (e) {
      toast({ title: "Reset failed", description: e.message, variant: "destructive" });
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await teamApi.deactivate(id);
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: false } : m)));
      toast({ title: "Member deactivated", description: "They can no longer sign in." });
    } catch (e) {
      toast({ title: "Deactivation failed", description: e.message, variant: "destructive" });
    }
  };

  const closeInvite = () => {
    setInviteOpen(false);
    setTempPassword(null);
    setForm({ name: "", email: "", role: "sales" });
  };

  const copyPassword = () => {
    navigator.clipboard?.writeText(tempPassword);
    toast({ title: "Copied", description: "Temporary password copied to clipboard." });
  };

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <PageHeader icon={<UserCog />} accent="acc-amber" eyebrow="Workspace"
          title="Team Management"
          description="Invite teammates and control what each can access."
          actions={
            <Button className="animated-gradient text-white" onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Invite Member
            </Button>
          } />

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Workspace Members ({members.length})</CardTitle>
            <CardDescription>Everyone with access to this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center text-muted-foreground py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading team…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => {
                      const isOwner = m.role === "owner";
                      return (
                        <tr key={m.id} className="border-b hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3 font-medium">{m.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                          <td className="px-4 py-3">
                            {isOwner ? (
                              <Badge className="bg-amber-500 text-white"><ShieldCheck className="h-3 w-3 mr-1" />Owner</Badge>
                            ) : (
                              <Select value={m.role} onValueChange={(role) => handleRoleChange(m.id, role)} disabled={!m.isActive}>
                                <SelectTrigger className="w-[150px] h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {ASSIGNABLE_ROLES.map((r) => (
                                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={m.isActive ? "success" : "outline"}>
                              {m.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {!isOwner && m.isActive && (
                              <Button variant="ghost" size="sm" onClick={() => handleResetPassword(m)} title={`Reset ${m.name}'s password`}>
                                <KeyRound className="h-4 w-4 mr-1" />Reset password
                              </Button>
                            )}
                            {!isOwner && m.isActive && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4 mr-1" />Deactivate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Deactivate {m.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      They will no longer be able to sign in. Their data is preserved and
                                      you can re-invite them later.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeactivate(m.id)}>Deactivate</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={(o) => (o ? setInviteOpen(true) : closeInvite())}>
        <DialogContent>
          {!tempPassword ? (
            <form onSubmit={handleInvite}>
              <DialogHeader>
                <DialogTitle>Invite a team member</DialogTitle>
                <DialogDescription>They’ll get a temporary password to sign in with.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="m-name">Full Name</Label>
                  <Input id="m-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-email">Email</Label>
                  <Input id="m-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeInvite}>Cancel</Button>
                <Button type="submit" disabled={inviting} className="animated-gradient text-white">
                  {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send Invite
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Member invited 🎉</DialogTitle>
                <DialogDescription>
                  Share this temporary password with them now — it won’t be shown again.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                  <code className="flex-1 text-sm font-mono break-all">{tempPassword}</code>
                  <Button type="button" variant="outline" size="icon" onClick={copyPassword} title="Copy">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={closeInvite}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Password-reset result dialog — the temp password is shown exactly once. */}
      <Dialog open={!!resetResult} onOpenChange={(o) => { if (!o) setResetResult(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password reset for {resetResult?.name}</DialogTitle>
            <DialogDescription>
              Share this temporary password with them now — it won't be shown again.
              They'll be prompted to set their own password after signing in.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
              <code className="flex-1 text-sm font-mono break-all">{resetResult?.password}</code>
              <Button type="button" variant="outline" size="icon" title="Copy"
                onClick={() => {
                  navigator.clipboard?.writeText(resetResult?.password || "");
                  toast({ title: "Copied", description: "Temporary password copied to clipboard." });
                }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setResetResult(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
