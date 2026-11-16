import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2, Crown, UserPlus, Loader2, Check, RefreshCw, Copy, ClipboardCheck,
  Eye, EyeOff, Search, ExternalLink, ServerCog,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/ui/PageHeader";
import Field from "@/components/ui/Field";
import Alert from "@/components/ui/alert";
import { adminApi } from "@/lib/api";
import { formatRelativeTime } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Provisioning — one clean form for standing up a workspace or issuing an owner
 * account. Password is generated (or set) up front, and on success the sign-in
 * details appear once in a copyable handoff card (super-admin-created owners
 * don't get a temp-password prompt, so this is the moment to share them).
 */

const PLANS = ["free", "starter", "growth", "agency", "enterprise"];

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "workspace";
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const PW_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // no 0/O/1/l/I
const genPassword = (len = 16) => {
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => PW_ALPHABET[n % PW_ALPHABET.length]).join("");
};

const EMPTY = { companyName: "", plan: "free", ownerName: "", ownerEmail: "", tenantId: "" };

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    return true;
  } catch {
    return false;
  }
}

const CredRow = ({ label, value, onCopy }) => (
  <div className="flex items-center justify-between gap-3 border-b border-border/50 py-2.5 last:border-b-0">
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate font-mono text-sm">{value}</p>
    </div>
    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onCopy} aria-label={`Copy ${label}`}>
      <Copy className="h-3.5 w-3.5" />
    </Button>
  </div>
);

/* Uniform intent selector — two alike cards, single accent when active. */
const IntentCard = ({ active, icon: Icon, title, desc, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "flex flex-1 items-center gap-3 rounded-xl border p-4 text-left transition-colors",
      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"
    )}
  >
    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-muted/50", active ? "text-primary" : "text-foreground/70")}>
      <Icon className="h-5 w-5" />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-medium">{title}</span>
      <span className="block text-xs text-muted-foreground">{desc}</span>
    </span>
  </button>
);

const Onboarding = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [intent, setIntent] = useState("company"); // "company" | "owner"
  const [form, setForm] = useState(EMPTY);
  const [pwMode, setPwMode] = useState("generate");
  const [password, setPassword] = useState(() => genPassword());
  const [showPw, setShowPw] = useState(false);
  const [tenantSearch, setTenantSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isCompany = intent === "company";

  const loadTenants = useCallback(async () => {
    try {
      setTenants(await adminApi.tenants(""));
    } catch (e) {
      toast({ title: "Failed to load companies", description: e.message, variant: "destructive" });
    }
  }, [toast]);
  useEffect(() => { loadTenants(); }, [loadTenants]);

  const filteredTenants = useMemo(() => {
    const q = tenantSearch.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
  }, [tenants, tenantSearch]);

  const selectedTenant = tenants.find((t) => t.id === form.tenantId);

  const copy = async (text, what) => {
    const ok = await copyText(text);
    toast(ok ? { title: `${what} copied` } : { title: "Copy failed", description: "Copy it manually.", variant: "destructive" });
  };

  const regenerate = () => { setPassword(genPassword()); setShowPw(true); };

  const provision = async () => {
    const next = {};
    if (isCompany && !form.companyName.trim()) next.companyName = "Enter a company name.";
    if (!isCompany && !form.tenantId) next.tenantId = "Choose a company.";
    if (!form.ownerName.trim()) next.ownerName = "Enter the owner's name.";
    if (!emailOk(form.ownerEmail)) next.ownerEmail = "Enter a valid email.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      let slug;
      if (isCompany) {
        const t = await adminApi.createTenant({
          business_name: form.companyName.trim(),
          owner_name: form.ownerName.trim(),
          owner_email: form.ownerEmail.trim(),
          password,
          plan: form.plan,
        });
        slug = t.slug;
      } else {
        await adminApi.createTenantUser(form.tenantId, {
          name: form.ownerName.trim(),
          email: form.ownerEmail.trim(),
          password,
          role: "owner",
        });
        slug = selectedTenant?.slug;
      }
      setResult({
        intent,
        company: isCompany ? form.companyName.trim() : selectedTenant?.name,
        slug,
        email: form.ownerEmail.trim(),
        password,
      });
      loadTenants();
    } catch (err) {
      setSubmitError(err.message || "Provisioning failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setIntent("company");
    setForm(EMPTY);
    setPwMode("generate");
    setPassword(genPassword());
    setShowPw(false);
    setTenantSearch("");
    setErrors({});
    setSubmitError("");
    setResult(null);
  };

  const signInUrl = `${window.location.origin}/login`;
  const copyAll = () => {
    if (!result) return;
    copy([
      `Workspace domain: ${result.slug}`,
      `Sign-in URL: ${signInUrl}`,
      `Email: ${result.email}`,
      `Password: ${result.password}`,
    ].join("\n"), "Credentials");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        icon={<ServerCog />} accent="acc-indigo" eyebrow="Platform" title="Provisioning"
        description="Provision a workspace or issue an owner account — with a copyable credential handoff."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass-card lg:col-span-2">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {result ? (
                /* ── Success: credential handoff ── */
                <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-500"><Check className="h-5 w-5" /></span>
                    <div>
                      <p className="font-semibold">{result.intent === "company" ? "Workspace provisioned" : "Owner created"}</p>
                      <p className="text-sm text-muted-foreground">{result.company}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium">Sign-in credentials</p>
                      <Button variant="outline" size="sm" onClick={copyAll}>
                        <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" /> Copy all
                      </Button>
                    </div>
                    <CredRow label="Workspace domain" value={result.slug} onCopy={() => copy(result.slug, "Domain")} />
                    <CredRow label="Sign-in URL" value={signInUrl} onCopy={() => copy(signInUrl, "URL")} />
                    <CredRow label="Email" value={result.email} onCopy={() => copy(result.email, "Email")} />
                    <CredRow label="Password" value={result.password} onCopy={() => copy(result.password, "Password")} />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Share these with the owner over a secure channel. This is the only time the password is visible.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button onClick={reset}>Provision another</Button>
                    <Button variant="outline" onClick={() => navigate("/platform/tenants")}>
                      View tenants <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                /* ── Form ── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <IntentCard active={isCompany} icon={Building2} title="New workspace" desc="Company + 9 agents + first owner" onClick={() => setIntent("company")} />
                    <IntentCard active={!isCompany} icon={Crown} title="Additional owner" desc="New owner in an existing workspace" onClick={() => setIntent("owner")} />
                  </div>

                  {isCompany ? (
                    <>
                      <Field
                        label="Company name" htmlFor="companyName" required error={errors.companyName}
                        help={form.companyName.trim() ? <>domain preview: <span className="font-mono text-foreground">{slugify(form.companyName)}</span></> : "Becomes the workspace domain (slug)."}
                      >
                        <Input id="companyName" value={form.companyName} onChange={(e) => set({ companyName: e.target.value })} placeholder="Acme Inc." />
                      </Field>
                      <Field label="Plan" help="Informational today — no billing is enforced.">
                        <div className="flex flex-wrap gap-2">
                          {PLANS.map((p) => (
                            <button key={p} type="button" onClick={() => set({ plan: p })} aria-pressed={form.plan === p}
                              className={cn("rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors",
                                form.plan === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/50")}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </>
                  ) : (
                    <Field label="Company" required error={errors.tenantId}>
                      <div className="rounded-lg border border-border">
                        <div className="flex items-center gap-2 border-b border-border px-3">
                          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <input value={tenantSearch} onChange={(e) => setTenantSearch(e.target.value)} placeholder="Search companies…"
                            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" aria-label="Search companies" />
                        </div>
                        <div className="max-h-52 overflow-y-auto p-1" role="listbox" aria-label="Companies">
                          {filteredTenants.length === 0 ? (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No companies found.</p>
                          ) : filteredTenants.map((t) => (
                            <button key={t.id} type="button" role="option" aria-selected={form.tenantId === t.id} onClick={() => set({ tenantId: t.id })}
                              className={cn("flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                                form.tenantId === t.id ? "bg-primary/10 text-foreground" : "hover:bg-muted/50")}>
                              <span className="truncate font-medium">{t.name}</span>
                              <span className="shrink-0 font-mono text-xs text-muted-foreground">{t.slug}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </Field>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Owner name" htmlFor="ownerName" required error={errors.ownerName}>
                      <Input id="ownerName" value={form.ownerName} onChange={(e) => set({ ownerName: e.target.value })} placeholder="Jane Doe" />
                    </Field>
                    <Field label="Owner email" htmlFor="ownerEmail" required error={errors.ownerEmail}>
                      <Input id="ownerEmail" type="email" value={form.ownerEmail} onChange={(e) => set({ ownerEmail: e.target.value })} placeholder="owner@acme.com" />
                    </Field>
                  </div>

                  <Field label="Initial password" required error={errors.password} help="Shared with the owner on the next screen — shown once.">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {[["generate", "Generate secure"], ["manual", "Set manually"]].map(([m, label]) => (
                          <button key={m} type="button" aria-pressed={pwMode === m}
                            onClick={() => { setPwMode(m); if (m === "generate") { setPassword(genPassword()); setShowPw(true); } else { setPassword(""); setShowPw(true); } }}
                            className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                              pwMode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/50")}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                          readOnly={pwMode === "generate"} placeholder="At least 6 characters" className="pr-20 font-mono" />
                        <div className="absolute right-1 top-1 flex">
                          <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground">
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          {pwMode === "generate" && (
                            <button type="button" onClick={regenerate} aria-label="Generate a new password" className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground">
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Field>

                  {submitError && <Alert variant="error">{submitError}</Alert>}

                  <Button onClick={provision} disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isCompany ? <Building2 className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />)}
                    {isCompany ? "Provision workspace" : "Create owner"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Context rail */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-5">
              <p className="text-sm font-semibold">What provisioning does</p>
              <ul className="mt-3 space-y-2.5">
                {[
                  "Creates a workspace with a unique domain",
                  "Provisions 9 AI agents on local models",
                  "Issues an owner account with full access",
                  "Owner can then invite the team & reset passwords",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />{t}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-5">
              <p className="text-sm font-semibold">Recent workspaces</p>
              {tenants.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">None yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {tenants.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{t.name}</span>
                        <span className="block truncate font-mono text-xs text-muted-foreground">{t.slug}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(t.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Onboarding;
