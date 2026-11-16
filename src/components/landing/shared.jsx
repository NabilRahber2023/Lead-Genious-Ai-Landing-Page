import React, { useEffect, useRef, useState } from "react";
import {
  motion, useScroll, useSpring, useInView, useMotionValue, animate, AnimatePresence,
} from "framer-motion";
import {
  Zap, ArrowRight, Crown, Briefcase, Megaphone, TrendingUp, Eye, ShieldCheck,
  Lock, Gauge, Building2, Users, Bot, Menu, X, Sun, Moon, Monitor, Server, Cpu,
} from "lucide-react";

/**
 * Shared building blocks for the dedicated nav landing pages.
 *
 * These mirror the primitives used by the main LandingPage (same `lp-*` CSS,
 * same dark/indigo theme and framer-motion feel) so every dedicated page looks
 * like a natural extension of the marketing site — without modifying the
 * original landing page itself.
 */

export const EASE = [0.22, 1, 0.36, 1];

export const spotlight = (e) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/**
 * Landing-only light/dark toggle. Independent of the app's global ThemeContext
 * — it just adds `.lp-light` to the `.lp` wrapper (dark stays the default when
 * absent) and remembers the choice. Persisted under its own localStorage key.
 */
const LP_THEME_KEY = "lg_landing_theme";
export const useLandingTheme = () => {
  const [light, setLight] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(LP_THEME_KEY) === "light";
  });
  useEffect(() => {
    try { window.localStorage.setItem(LP_THEME_KEY, light ? "light" : "dark"); } catch (_) { /* ignore */ }
  }, [light]);
  return { light, toggle: () => setLight((v) => !v) };
};

/* Small pill button that swaps the landing between light and dark. Its own
   utility classes are recolored by the .lp-light overrides automatically. */
export const ThemeToggle = ({ light, onToggle, className = "" }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
    title={light ? "Switch to dark mode" : "Switch to light mode"}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-zinc-300 transition-colors hover:border-white/30 hover:text-white ${className}`}
  >
    {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
  </button>
);

/* The nav-bar options — each now points at a dedicated page. */
// Trust & legal pages, rendered in the footer of every marketing page.
export const TRUST_LINKS = [
  { id: "privacy", label: "Privacy" },
  { id: "terms", label: "Terms" },
  { id: "security", label: "Security" },
];

export const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "agents", label: "AI Agents" },
  { id: "how", label: "How it works" },
  { id: "why", label: "Why LeadGenius" },
  { id: "roles", label: "For your team" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

/* ───────── content (shared with the dedicated pages) ───────── */
// `tint` = the same filled-tile pattern the agent cards use (bg/10 + solid
// border + text), one distinct hue per item so a row never reads as monotone.
export const FEATURES = [
  { icon: <Lock className="h-5 w-5" />, title: "100% Local & Private AI", body: "Every agent runs on your own machine through Ollama. No lead data, prompt, or business insight ever leaves your infrastructure.", tint: "bg-sky-500/10 border-sky-500 text-sky-400" },
  { icon: <Gauge className="h-5 w-5" />, title: "Deterministic Scoring", body: "Server-side 0–100 lead scoring recalculates on every change. Same inputs, same score — no black box.", tint: "bg-violet-500/10 border-violet-500 text-violet-400" },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Enterprise RBAC", body: "Six roles, enforced on every endpoint — each teammate sees a purpose-built portal.", tint: "bg-emerald-500/10 border-emerald-500 text-emerald-400" },
  { icon: <Building2 className="h-5 w-5" />, title: "True Multi-Tenancy", body: "Every workspace is isolated at the data layer. Run your business — or a whole agency of clients — from one platform.", tint: "bg-amber-500/10 border-amber-500 text-amber-400" },
];

export const STEPS = [
  { num: "01", title: "Capture & score leads", body: "Bring leads in from 9 channels. Each is instantly scored 0–100 so your team always knows who to call first.", icon: <Users className="h-5 w-5" />, tint: "bg-sky-500/10 border-sky-500 text-sky-400" },
  { num: "02", title: "Deploy your AI agents", body: "Activate any of 9 specialized agents. They read your live pipeline and return concrete, ready-to-act recommendations.", icon: <Bot className="h-5 w-5" />, tint: "bg-violet-500/10 border-violet-500 text-violet-400" },
  { num: "03", title: "Convert & grow", body: "Work the pipeline, run campaigns, and watch conversion climb — with dashboards that prove the ROI.", icon: <TrendingUp className="h-5 w-5" />, tint: "bg-emerald-500/10 border-emerald-500 text-emerald-400" },
];

export const ROLES = [
  { icon: <Crown className="h-5 w-5" />, label: "Owner", desc: "Executive command center — KPIs, pipeline, AI ROI, team.", grad: "from-amber-500 to-orange-600" },
  { icon: <Briefcase className="h-5 w-5" />, label: "Manager", desc: "Operations hub — pipeline health, overdue follow-ups, agents.", grad: "from-emerald-500 to-green-600" },
  { icon: <Megaphone className="h-5 w-5" />, label: "Marketing", desc: "Campaign ROI, channel conversion, and lead-source insights.", grad: "from-violet-500 to-purple-600" },
  { icon: <TrendingUp className="h-5 w-5" />, label: "Sales", desc: "Pipeline funnel, hot leads ≥70, and your daily close list.", grad: "from-sky-500 to-blue-600" },
  { icon: <Eye className="h-5 w-5" />, label: "Read-only", desc: "Clean, write-free dashboards for stakeholders & auditors.", grad: "from-slate-500 to-slate-600" },
  { icon: <ShieldCheck className="h-5 w-5" />, label: "Super Admin", desc: "Platform control — tenants, agents, and access matrix.", grad: "from-red-500 to-rose-600" },
];

// Enterprise's CTA is a real contact action (mailto) — it must never route to
// the login screen (Project Bible §19.4). `href` wins over onGetStarted.
export const CONTACT_EMAIL = "hello@leadgenius.ai";

export const PRICING = [
  { name: "Starter", price: "Free", period: "forever", blurb: "Everything you need to launch lead-gen with AI.", features: ["1 workspace", "Up to 3 teammates", "All 9 AI agents", "Lead & campaign management", "Live analytics dashboard"], cta: "Start free", highlight: false },
  { name: "Growth", price: "$49", period: "/ mo", blurb: "For growing teams that live in their pipeline.", features: ["Unlimited leads & campaigns", "Up to 15 teammates", "All 9 AI agents", "Role-based portals (6 roles)", "Advanced reports & ROI", "Priority support"], cta: "Start 14-day trial", highlight: true },
  { name: "Enterprise", price: "Custom", period: "", blurb: "Agencies & multi-tenant operators at scale.", features: ["Unlimited workspaces", "Unlimited teammates", "Dedicated AI hosting", "Per-company access control", "SSO & audit trails", "White-glove onboarding"], cta: "Talk to us", highlight: false, href: `mailto:${CONTACT_EMAIL}?subject=LeadGenius%20AI%20Enterprise` },
];

// Honesty ribbon shown with the pricing grid: paid plans aren't enforced yet.
export const PRICING_NOTE =
  "Pricing preview — while LeadGenius AI is in self-hosted beta, every plan is free and nothing is billed.";

// Replaces fictional testimonials (Project Bible §22.1-4): the trust story is
// the architecture itself, told honestly.
export const TRUST_PILLARS = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Your infrastructure only",
    body: "Lead data flows from your browser to your own backend and your own GPU. No third-party AI cloud is ever in the path.",
    tint: "bg-sky-500/10 border-sky-500 text-sky-400",
    flow: [
      { icon: <Monitor className="h-4 w-4" />, label: "Your browser" },
      { icon: <Server className="h-4 w-4" />, label: "Your server" },
      { icon: <Cpu className="h-4 w-4" />, label: "Your GPU" },
    ],
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Enforced, not hidden",
    body: "All six roles are checked on every backend endpoint. Access control isn't a hidden button — a wrong role gets a hard 403.",
    tint: "bg-emerald-500/10 border-emerald-500 text-emerald-400",
  },
  {
    icon: <Gauge className="h-5 w-5" />,
    title: "Deterministic & auditable",
    body: "Lead scores come from a fixed, documented formula — same inputs, same score — and every AI agent run is logged.",
    tint: "bg-violet-500/10 border-violet-500 text-violet-400",
  },
];

export const STATS = [
  { to: 9, suffix: "", label: "Autonomous AI agents" },
  { to: 100, suffix: "%", label: "Local & private" },
  { to: 6, suffix: "", label: "Role-based portals" },
  { to: 5, suffix: "", label: "Specialized LLMs" },
];

export const FAQS = [
  { q: "Is my data really private?", a: "Yes. LeadGenius AI runs its 9 agents on local LLMs through Ollama. Your leads, campaigns, and prompts never get sent to a third-party cloud AI provider — everything stays on your own infrastructure." },
  { q: "What are the 9 AI agents?", a: "Each agent is a specialized assistant — from Prospector AI (finds high-potential leads) to Loyalty AI (prevents churn). They read your live pipeline data and return concrete 3–5 bullet recommendations you can act on immediately." },
  { q: "How does role-based access work?", a: "There are six roles — Owner, Manager, Marketing, Sales, Read-only, and Super Admin. Each gets a purpose-built portal with only the tools they need, and access is enforced on every backend endpoint, not just hidden in the UI." },
  { q: "Can I run multiple businesses or clients?", a: "Absolutely. The platform is fully multi-tenant. Every workspace is isolated at the data layer, and a Super Admin can manage tenants, toggle AI agents per company, and control per-role access from one dashboard." },
  { q: "How is the lead score calculated?", a: "Deterministically, server-side. A score (0–100) is computed from the acquisition channel, pipeline stage, and engagement signals, and it recalculates automatically on every edit and interaction — so it's always accurate and auditable." },
];

/* ───────── primitives ───────── */
export const Reveal = ({ children, className = "", delay = 0, y = 26 }) => (
  <motion.div
    initial={{ opacity: 0, y, filter: "blur(6px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
    transition={{ duration: 0.6, delay, ease: EASE }}
    className={className}
  >
    {children}
  </motion.div>
);

export const CountUp = ({ to, suffix = "", duration = 1.6 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration, ease: "easeOut" });
    return c.stop;
  }, [inView, to, duration, mv]);
  useEffect(() => mv.on("change", (v) => setVal(Math.round(v))), [mv]);
  return <span ref={ref} className="tabular-nums">{val}{suffix}</span>;
};

export const MagneticButton = ({ children, onClick, variant = "primary", className = "" }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    const max = r.width / 2;
    if (dist < max * 2) {
      const s = Math.min(1, (max * 2 - dist) / max);
      setPos({ x: dx * s * 0.3, y: dy * s * 0.3 });
    }
  };
  const base = variant === "primary"
    ? "lp-shimmer bg-white text-zinc-900 hover:bg-zinc-200 hover:shadow-[0_0_34px_-6px_rgba(255,255,255,0.5)]"
    : "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10";
  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      onClick={onClick}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg px-7 text-sm font-semibold transition-colors ${base} ${className}`}
    >
      <span className="relative z-10 inline-flex items-center">{children}</span>
    </motion.button>
  );
};

export const MouseLight = () => {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const x = useSpring(mx, { stiffness: 60, damping: 22, mass: 0.4 });
  const y = useSpring(my, { stiffness: 60, damping: 22, mass: 0.4 });
  useEffect(() => {
    const m = (e) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, [mx, my]);
  return (
    <motion.div style={{ x, y }} className="pointer-events-none fixed left-0 top-0 z-20 hidden md:block">
      <div className="absolute" style={{ width: 540, height: 540, transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)", filter: "blur(40px)" }} />
    </motion.div>
  );
};

/* A handful of diagonal meteors streaking through the starfield — sparse and
   staggered (not a shower). Positions/timings are fixed, not random, so the
   scene is identical on every load and never reflows on re-render. */
const METEORS = [
  { x: "8%", y: "-4%", delay: "0s", duration: "7.5s" },
  { x: "28%", y: "8%", delay: "2.8s", duration: "6.5s" },
  { x: "52%", y: "-8%", delay: "5.4s", duration: "8s" },
  { x: "74%", y: "4%", delay: "1.4s", duration: "7s" },
  { x: "90%", y: "-2%", delay: "4.1s", duration: "6.8s" },
];

const Meteors = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {METEORS.map((m, i) => (
      <span
        key={i}
        className="lp-meteor"
        style={{ "--lp-meteor-x": m.x, "--lp-meteor-y": m.y, "--lp-meteor-delay": m.delay, "--lp-meteor-duration": m.duration }}
      />
    ))}
  </div>
);

export const JourneyBackground = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#08080b]">
    <div className="lp-bg-aurora" />
    <div className="lp-stars" />
    <div className="lp-stars2" />
    <Meteors />
    <div className="absolute inset-x-0 top-0 h-[520px] lp-glow opacity-90" />
    <div className="lp-vignette" />
    <div className="lp-grain" />
  </div>
);

/* A centered section heading used by every dedicated page. */
export const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <Reveal className="mb-10 text-center">
    {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] lp-accent">{eyebrow}</p>}
    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h2>
    {subtitle && <p className="mx-auto mt-4 max-w-2xl text-zinc-400">{subtitle}</p>}
  </Reveal>
);

/* The hero block at the top of each dedicated page. */
export const PageHero = ({ badge, title, accent, subtitle, onGetStarted }) => (
  <section className="relative flex min-h-[72vh] items-center justify-center px-6 pb-16 pt-28">
    <div className="mx-auto w-full max-w-4xl text-center">
      {badge && (
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur">
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold lp-accent">PAGE</span>
            {badge}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <span className="lp-title">{title}</span>{" "}
          {accent && <span className="lp-accent-flow bg-clip-text text-transparent">{accent}</span>}
        </h1>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">{subtitle}</p>
        </Reveal>
      )}
      {onGetStarted && (
        <Reveal delay={0.15}>
          <div className="mt-9 flex justify-center">
            <MagneticButton onClick={onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton>
          </div>
        </Reveal>
      )}
    </div>
  </section>
);

/**
 * The chrome shared by every dedicated page: fixed background, nav bar (logo
 * returns home, links jump between dedicated pages), and the footer.
 */
export const PageShell = ({ current, onNavigate, onHome, onGetStarted, children }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { light, toggle } = useLandingTheme();
  const { scrollYProgress } = useScroll();
  const barScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  // Dedicated pages are normal-scroll (no slide snapping), and always start at top.
  useEffect(() => { window.scrollTo(0, 0); }, [current]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => { setMobileOpen(false); onNavigate(id); };

  return (
    <div className={`lp relative min-h-screen ${light ? "lp-light" : ""}`}>
      <JourneyBackground />
      <MouseLight />

      <motion.div style={{ scaleX: barScale }} className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-gradient-to-r from-indigo-500 to-violet-400" />

      {/* ─── NAV ─── */}
      <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-[#08080b]/70 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <nav className="container flex h-16 items-center justify-between">
          <button onClick={onHome} className="group flex items-center gap-2">
            <Zap className="h-6 w-6 lp-accent transition-transform group-hover:scale-110" />
            <span className="text-lg font-semibold text-white">LeadGenius AI</span>
          </button>
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${current === l.id ? "text-white" : "text-zinc-400 hover:text-white"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle light={light} onToggle={toggle} />
            <button onClick={onGetStarted} className="hidden h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-white sm:inline-flex">Sign in</button>
            <button onClick={onGetStarted} className="lp-shimmer group hidden h-9 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 text-sm font-semibold text-white ring-1 ring-white/20 shadow-lg shadow-purple-600/30 transition-all hover:-translate-y-0.5 hover:shadow-purple-600/50 sm:inline-flex">Get started<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></button>
            <button className="text-white md:hidden" onClick={() => setMobileOpen((v) => !v)}>{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </nav>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-white/10 bg-[#08080b]/95 backdrop-blur md:hidden">
              <div className="container flex flex-col gap-1 py-3">
                <button onClick={() => { setMobileOpen(false); onHome(); }} className="rounded-md px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white">← Home</button>
                {NAV_LINKS.map((l) => <button key={l.id} onClick={() => go(l.id)} className={`rounded-md px-3 py-2.5 text-left text-sm hover:bg-white/5 hover:text-white ${current === l.id ? "text-white" : "text-zinc-300"}`}>{l.label}</button>)}
                <button onClick={onGetStarted} className="mt-2 h-10 rounded-lg bg-white text-sm font-semibold text-zinc-900">Get started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">{children}</main>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="container py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <button onClick={onHome} className="flex items-center gap-2"><Zap className="h-5 w-5 lp-accent" /><span className="font-semibold text-white">LeadGenius AI</span></button>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
              {NAV_LINKS.map((l) => <button key={l.id} onClick={() => go(l.id)} className="transition-colors hover:text-white">{l.label}</button>)}
              <button onClick={onGetStarted} className="transition-colors hover:text-white">Sign in</button>
            </div>
            <p className="text-xs text-zinc-500">© {new Date().getFullYear()} LeadGenius AI · Multi-tenant, private AI</p>
          </div>
          {/* Trust & legal row (Project Bible R14) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/5 pt-6 text-xs text-zinc-500">
            {TRUST_LINKS.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} className="transition-colors hover:text-white">{l.label}</button>
            ))}
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
