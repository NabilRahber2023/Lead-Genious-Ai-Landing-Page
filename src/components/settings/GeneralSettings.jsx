
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { settingsApi } from "@/lib/api";
import Field from "@/components/ui/Field";
import Alert from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const GeneralSettings = ({ itemVariants }) => {
  const { toast } = useToast();
  const { can } = useAuth();
  const canEdit = can("editSettings");
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await settingsApi.get();
        if (!cancelled) setSettings(data);
      } catch (e) {
        toast({ title: "Failed to load settings", description: e.message, variant: "destructive" });
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsApi.update({
        name: settings.name,
        contactEmail: settings.contactEmail,
        logoUrl: settings.logoUrl,
        weeklyTarget: Math.max(1, parseInt(settings.weeklyTarget, 10) || 10),
      });
      setSettings(updated);
      toast({ title: "Settings saved", description: "Your business settings have been updated." });
    } catch (e) {
      toast({ title: "Error saving settings", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
          <CardDescription>Manage your business profile. These are saved to your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!settings ? (
            <div className="flex items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</div>
          ) : (
            <>
              {!canEdit && (
                <Alert variant="info" title="View-only access">
                  Only the workspace owner can change business settings.
                </Alert>
              )}
              <Field label="Business Name" htmlFor="businessName">
                <Input id="businessName" value={settings.name || ""} onChange={(e) => setSettings({ ...settings, name: e.target.value })} disabled={!canEdit} />
              </Field>
              <Field label="Contact Email" htmlFor="contactEmail">
                <Input id="contactEmail" type="email" value={settings.contactEmail || ""} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} disabled={!canEdit} />
              </Field>
              <Field label="Logo URL" htmlFor="logoUrl">
                <Input id="logoUrl" value={settings.logoUrl || ""} onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })} placeholder="https://…" disabled={!canEdit} />
              </Field>
              <Field
                label="Weekly sales target"
                htmlFor="weeklyTarget"
                help="Closed-won deals per week — drives the target ring on the sales dashboard."
              >
                <Input id="weeklyTarget" type="number" min="1" max="1000"
                  value={settings.weeklyTarget ?? 10}
                  onChange={(e) => setSettings({ ...settings, weeklyTarget: e.target.value })}
                  disabled={!canEdit} className="max-w-[10rem]" />
              </Field>
              <Field label="Plan" help="Your current subscription tier.">
                <Input value={(settings.plan || "free").toUpperCase()} disabled />
              </Field>
              {canEdit && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GeneralSettings;
