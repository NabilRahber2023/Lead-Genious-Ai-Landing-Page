import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowLeft, Sun, Moon, ChevronRight, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Field from "@/components/ui/Field";
import Alert from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/components/ui/use-toast";
import { ROLE_CARDS, getDemoCredentials } from "@/lib/roles";
import { cn } from "@/lib/utils";

/**
 * Sign-in — a role-card entry followed by a clean form. The cards share one
 * uniform, professional style (the role only selects branding/form shape; the
 * backend derives the real role from the credentials). Picking "Create a
 * workspace" opens the owner card straight into register mode.
 */

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "workspace";

const TopBar = ({ onBackToHome, theme, toggleTheme }) => (
  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
    {onBackToHome ? (
      <button onClick={onBackToHome} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </button>
    ) : <span />}
    <button onClick={toggleTheme} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  </div>
);

/* ── The sign-in / register form for a chosen role ── */
const RoleForm = ({ role, startRegister, onBack }) => {
  const { signIn, register } = useAuth();
  const { toast } = useToast();
  const submitRef = useRef(null);

  const [mode, setMode] = useState(startRegister && role.canRegister ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ name, email, password, business_name: businessName });
      } else {
        await signIn({ email, password, domain: role.needsDomain ? domain.trim() || undefined : undefined });
      }
    } catch (err) {
      setError(err.message || "Sign in failed. Check your details and try again.");
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    const c = getDemoCredentials(role.id);
    if (!c) return;
    setMode("login");
    setError("");
    setEmail(c.email);
    setPassword(c.password);
    setDomain(c.domain || "");
    setShowPass(false);
    submitRef.current?.focus();
    toast({ title: "Demo credentials filled", description: `${role.label} · ${c.email}` });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All roles
      </button>

      <Card className="glass-card overflow-hidden">
        <div className={cn("h-1 w-full bg-gradient-to-r", role.gradient)} />
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg", role.gradient)}>{role.icon}</span>
            <div>
              <CardTitle className="text-lg">{isRegister ? "Create your workspace" : `Sign in as ${role.label}`}</CardTitle>
              <CardDescription>{role.tagline}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <>
                <Field label="Your name" htmlFor="name" required>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoComplete="name" required />
                </Field>
                <Field
                  label="Company name" htmlFor="business" required
                  help={businessName.trim() ? <>workspace domain: <span className="font-mono text-foreground">{slugify(businessName)}</span></> : "Becomes your workspace domain."}
                >
                  <Input id="business" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Inc." required />
                </Field>
              </>
            )}

            {!isRegister && role.needsDomain && (
              <Field label="Workspace domain" htmlFor="domain" help="Your workspace identifier (e.g. demo).">
                <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="your-company" className="font-mono" autoCapitalize="none" spellCheck={false} required />
              </Field>
            )}

            <Field label="Email" htmlFor="email" required>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
            </Field>

            <Field label="Password" htmlFor="password" required>
              <div className="relative">
                <Input
                  id="password" type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  autoComplete={isRegister ? "new-password" : "current-password"} className="pr-10" required
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide password" : "Show password"} aria-pressed={showPass}
                  className="absolute right-0 top-0 grid h-10 w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error && <Alert variant="error">{error}</Alert>}

            <Button ref={submitRef} type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegister ? "Create workspace" : `Sign in as ${role.label}`}
            </Button>

            {!isRegister && getDemoCredentials(role.id) && (
              <button type="button" onClick={fillDemo} className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Sparkles className="h-3.5 w-3.5" /> Fill in demo credentials
              </button>
            )}
          </form>

          {role.canRegister && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isRegister ? (
                <>Already have an account?{" "}
                  <button className="font-medium text-primary hover:underline" onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
                </>
              ) : (
                <>New business?{" "}
                  <button className="font-medium text-primary hover:underline" onClick={() => { setMode("register"); setError(""); }}>Create a workspace</button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const RoleLanding = ({ onBackToHome }) => {
  const { theme, toggleTheme } = useTheme();
  const [selected, setSelected] = useState(null);
  const [startRegister, setStartRegister] = useState(false);

  const openRole = (role, register = false) => { setStartRegister(register); setSelected(role); };
  const ownerCard = ROLE_CARDS.find((r) => r.canRegister);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <TopBar onBackToHome={onBackToHome} theme={theme} toggleTheme={toggleTheme} />

      <AnimatePresence mode="wait">
        {selected ? (
          <RoleForm key="form" role={selected} startRegister={startRegister} onBack={() => setSelected(null)} />
        ) : (
          <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full flex-col items-center">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-2 flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" strokeWidth={2.25} />
              <span className="text-2xl font-bold tracking-tight">LeadGenius AI</span>
            </motion.div>
            <p className="mb-8 text-center text-muted-foreground">Choose how you're signing in</p>

            <motion.div
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {ROLE_CARDS.map((role) => (
                <motion.button
                  key={role.id}
                  variants={{ hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  whileHover={{ y: -3 }}
                  onClick={() => openRole(role)}
                  className={cn(
                    "group rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    role.ring
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className={cn("grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", role.gradient)}>{role.icon}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{role.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{role.tagline}</p>
                </motion.button>
              ))}
            </motion.div>

            {ownerCard && (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                New business?{" "}
                <button onClick={() => openRole(ownerCard, true)} className="font-medium text-primary hover:underline">Create a workspace →</button>
              </p>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Demo company domain: <span className="font-mono">demo</span> · Owner: owner@demo.com / demo1234
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleLanding;
