import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, KeyRound, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import Field from "@/components/ui/Field";
import Alert from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/lib/api";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

/**
 * ProfilePage — the signed-in user's own account (Project Bible R6):
 * identity summary + change-password form. Completes the temp-password
 * invite flow: while must_change_password is set, a prompt explains why.
 */
const ProfilePage = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (!currentPassword) next.current = "Enter your current password.";
    if (newPassword.length < 6) next.next = "New password must be at least 6 characters.";
    if (newPassword && newPassword === currentPassword) next.next = "New password must be different.";
    if (confirmPassword !== newPassword) next.confirm = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast({ title: "Password changed", description: "Your new password is active from now on." });
      // Refresh the session user so the temp-password prompt disappears.
      window.location.reload();
    } catch (err) {
      setErrors({ current: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mx-auto max-w-2xl space-y-6">
        <PageHeader icon={<UserCircle />} accent="acc-indigo" eyebrow="Account"
          title="My Profile" description="Your account details and password." />

        {user?.must_change_password && (
          <motion.div variants={itemVariants}>
            <Alert variant="warning" title="Set your own password">
              You're signed in with a temporary password. Choose your own below to secure your account.
            </Alert>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Managed by your workspace owner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Name"><Input value={user?.name || ""} disabled /></Field>
              <Field label="Email"><Input value={user?.email || ""} disabled /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role"><Input value={role || ""} disabled className="capitalize" /></Field>
                {user?.tenant_name && (
                  <Field label="Workspace"><Input value={user.tenant_name} disabled /></Field>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />Change password</CardTitle>
              <CardDescription>Requires your current password. Minimum 6 characters.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <Field label="Current password" htmlFor="currentPassword" required error={errors.current}>
                  <Input id="currentPassword" type="password" autoComplete="current-password"
                    value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="New password" htmlFor="newPassword" required error={errors.next}>
                    <Input id="newPassword" type="password" autoComplete="new-password"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </Field>
                  <Field label="Confirm new password" htmlFor="confirmPassword" required error={errors.confirm}>
                    <Input id="confirmPassword" type="password" autoComplete="new-password"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Field>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
