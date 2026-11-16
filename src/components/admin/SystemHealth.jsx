import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Server, Database, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import { adminApi } from "@/lib/api";
import AccessMatrix from "@/components/admin/AccessMatrix";

const StatusPill = ({ ok, label }) => (
  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
    {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
    {label}
  </span>
);

const SystemHealth = () => {
  const { toast } = useToast();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHealth(await adminApi.systemHealth());
    } catch (e) {
      toast({ title: "Health check failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader icon={<Activity />} accent="acc-rose" eyebrow="Infrastructure"
        title="System Health & Access"
        description="Live infrastructure status and per-company role access control."
        actions={
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
        } />

      {!health ? (
        <div className="flex items-center text-muted-foreground py-6"><Loader2 className="h-5 w-5 animate-spin mr-2" />Checking…</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />PostgreSQL</CardTitle>
                <StatusPill ok={health.database.connected} label={health.database.connected ? "Connected" : "Down"} />
              </CardHeader>
              <CardContent><CardDescription>Primary application database.</CardDescription></CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" />Ollama</CardTitle>
                <StatusPill ok={health.ollama.reachable} label={health.ollama.reachable ? "Reachable" : "Offline"} />
              </CardHeader>
              <CardContent>
                <CardDescription>{health.ollama.url}</CardDescription>
                {health.ollama.reachable && health.ollama.models?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Models available on the Ollama server">
                    {health.ollama.models.map((m) => (
                      <span key={m} className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground">Last checked: {new Date(health.checkedAt).toLocaleString()}</p>
        </>
      )}

      {/* Per-company, per-role access control. */}
      <AccessMatrix />
    </motion.div>
  );
};

export default SystemHealth;
