import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, ArrowDown, Check, ChevronDown, Lock, Cpu,
  BarChart3, Users, Bot, Megaphone, Menu, X,
  Search, Bell, CircleDot, Rocket, Boxes, Flame, Wind, Sparkles, Atom,
} from "lucide-react";
import { agentTypes } from "@/lib/data";
import {
  useLandingTheme, ThemeToggle, EASE, spotlight, Reveal, CountUp, MagneticButton,
  MouseLight, JourneyBackground, NAV_LINKS, TRUST_LINKS, CONTACT_EMAIL,
  FEATURES, STEPS, ROLES, PRICING, FAQS, STATS, TRUST_PILLARS, PRICING_NOTE,
} from "./shared";

/**
 * Public marketing landing page — native scroll-snap slideshow.
 *
 * Each section is a normal-flow, full-screen "slide". CSS `scroll-snap` makes
 * the browser snap one slide at a time — butter-smooth (GPU-native, nothing in
 * JS drives the scroll) and slides can never overlap (they're sequential, not
 * stacked). Content reveals once when its slide enters view. The starfield/
 * aurora background drifts via GPU transforms. Committed dark theme + indigo.
 */

/* Reveal, CountUp, MagneticButton, MouseLight, spotlight, EASE and all shared
   marketing content now live in ./shared.jsx — one source for the home page
   and every dedicated topic page (Project Bible R17: no duplicated primitives). */

/* A full-screen slide that the browser snaps to. Normal flow → never overlaps. */
const Slide = ({ id, children, className = "" }) => (
  <section id={id} className={`relative flex min-h-screen w-full snap-start items-center justify-center px-6 py-24 ${className}`}>
    <div className="mx-auto w-full max-w-6xl">{children}</div>
  </section>
);

const SceneHeader = ({ step, title, subtitle }) => (
  <Reveal className="mb-8 text-center">
    {step && <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-zinc-500">{step}</p>}
    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h2>
    {subtitle && <p className="mx-auto mt-3 max-w-2xl text-zinc-400">{subtitle}</p>}
  </Reveal>
);

const MODELS = ["Ollama", "Llama 3.1 8B", "Mistral 7B", "Qwen2.5 7B", "Phi-3.5", "Llama 3.2"];
const MODEL_ICONS = [Boxes, Flame, Wind, Sparkles, Atom, Cpu];

/* Respects the OS "reduce motion" setting so decorative animation can opt out. */
const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);
  return reduced;
};

/* A monospace line that types itself out once (instant under reduced motion). */
const TypedLine = ({ text, startDelay = 0 }) => {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) { setN(text.length); return; }
    setN(0);
    let i = 0, tick;
    const start = setTimeout(() => {
      tick = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) clearInterval(tick);
      }, 32);
    }, startDelay * 1000);
    return () => { clearTimeout(start); clearInterval(tick); };
  }, [text, reduced, startDelay]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-indigo-400" aria-hidden="true" />}
    </>
  );
};

/* Bento spans for the WHY grid — layout concern kept local; content in shared. */
const FEATURE_SPANS = ["sm:col-span-2", "", "", "sm:col-span-2"];

/* ───────────── right-to-left brand/model logo marquee ───────────── */
/* A seamless "powered by" strip: the track holds two identical copies of the
   model list and slides left to -50%, looping invisibly. Pauses on hover. */
const LogoMarquee = () => {
  const track = [...MODELS, ...MODELS];
  return (
    <div className="lp-marquee-mask relative overflow-hidden py-1">
      <div className="lp-marquee gap-3">
        {track.map((m, i) => {
          const Icon = MODEL_ICONS[i % MODELS.length];
          return (
            <div
              key={i}
              aria-hidden={i >= MODELS.length ? "true" : undefined}
              className="group flex shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 transition-colors hover:border-white/20"
            >
              <Icon className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-indigo-400" />
              <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-zinc-400 transition-colors group-hover:text-white">{m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────── product mockup ───────────── */
const ProductMock = () => {
  const sideNav = [
    { icon: <BarChart3 className="h-4 w-4" />, label: "Command Center", active: true },
    { icon: <Users className="h-4 w-4" />, label: "Leads" },
    { icon: <Megaphone className="h-4 w-4" />, label: "Campaigns" },
    { icon: <Bot className="h-4 w-4" />, label: "AI Agents" },
  ];
  const kpis = [
    { k: "Total Leads", v: 1284, s: "", c: "text-sky-400" },
    { k: "Hot Leads", v: 192, s: "", c: "text-pink-400" },
    { k: "Conversion", v: 23, s: "%", c: "text-emerald-400" },
    { k: "Agents", v: 9, s: "/9", c: "text-violet-400" },
  ];
  // Mirrors the app's real "Pipeline by stage" chart (leadStatuses order).
  const pipeline = [
    { k: "New", v: 46 }, { k: "Contacted", v: 88 }, { k: "Qualified", v: 64 },
    { k: "Proposal", v: 51 }, { k: "Negotiat.", v: 38 }, { k: "Won", v: 72 },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0c11]/90 backdrop-blur">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
        <span className="h-3 w-3 rounded-full bg-green-400/80" />
        <span className="ml-3 flex items-center gap-1.5 text-xs text-zinc-500"><Lock className="h-3 w-3" /> app.leadgenius.ai</span>
      </div>
      <div className="flex">
        <aside className="hidden w-44 shrink-0 border-r border-white/10 p-3 sm:block">
          <div className="flex items-center gap-2 px-2 pb-3">
            <Zap className="h-5 w-5 lp-accent" />
            <span className="text-sm font-semibold text-white">LeadGenius</span>
          </div>
          {sideNav.map((n) => (
            <div key={n.label} className={`mb-1 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs ${n.active ? "bg-indigo-500/15 text-white" : "text-zinc-400"}`}>
              {n.icon}<span>{n.label}</span>
            </div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Command Center</p>
              <p className="text-[11px] text-zinc-500">Welcome back, Jane</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-zinc-400"><Search className="h-3.5 w-3.5" /></span>
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-zinc-400"><Bell className="h-3.5 w-3.5" /></span>
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {kpis.map((s) => (
              <div key={s.k} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">{s.k}</p>
                <p className={`mt-1 font-mono text-lg font-bold tabular-nums ${s.c}`}><CountUp to={s.v} suffix={s.s} /></p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 lg:col-span-3">
              <p className="mb-2 text-[11px] text-zinc-400">Pipeline by stage</p>
              <div className="flex items-end gap-2">
                {pipeline.map((s, i) => (
                  <div key={s.k} className="flex min-w-0 flex-1 flex-col items-center">
                    <div className="flex h-20 w-full items-end">
                      <motion.div initial={{ height: 0 }} whileInView={{ height: `${s.v}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: EASE }} className="w-full rounded-t bg-indigo-500" />
                    </div>
                    <span className="mt-1.5 w-full truncate text-center text-[9px] text-zinc-500">{s.k}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 lg:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-blue-500 bg-blue-500/10"><Users className="h-3 w-3 text-blue-400" /></span>
                <p className="text-[11px] font-medium text-white">Prospector AI</p>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400"><CircleDot className="h-2.5 w-2.5" /> live</span>
              </div>
              <ul className="space-y-1.5">
                {["22 high-intent prospects found", "7 engaged a competitor recently", "Drafted an outreach sequence"].map((t) => (
                  <li key={t} className="flex items-start gap-1.5 text-[11px] text-zinc-400"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* runtime status footer — real stack, not decoration */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 px-4 py-2 font-mono text-[10px] text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ollama: connected</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> postgres: healthy</span>
        <span className="ml-auto text-zinc-400">9/9 agents active</span>
      </div>
    </div>
  );
};

/* ───────────── cinematic intro (slideshow entrance) ───────────── */
const Intro = ({ onScrollNext }) => {
  const TITLE = ["LeadGenius", "AI"];
  const reduced = usePrefersReducedMotion();
  return (
    <Slide>
      <div className="relative text-center">
        {/* logo — a single calm fade + rise, no spin */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: EASE }}
          className="mb-7 inline-flex"
        >
          <span className="relative inline-flex">
            <span className="absolute -inset-6 rounded-full bg-indigo-500/20 blur-2xl" />
            <Zap className="relative h-14 w-14 lp-accent sm:h-16 sm:w-16" strokeWidth={2.25} />
          </span>
        </motion.div>

        {/* title — words rise from behind a mask; static accent (no flow gradient) */}
        <h1 className="flex flex-wrap items-baseline justify-center gap-x-4 text-6xl font-extrabold tracking-[-0.045em] sm:text-8xl">
          {TITLE.map((word, i) => (
            <span key={word} className="inline-block overflow-hidden pb-[0.12em]">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.35 + i * 0.14, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className={`inline-block ${i === 1
                  ? "lp-accent"
                  : "bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent"}`}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* system line — typed monospace status, then a fixed micro-label */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7, ease: EASE }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <p className="font-mono text-sm text-zinc-400 sm:text-base">
            <span className="lp-accent">▸ </span>
            <TypedLine text="9 agents · 5 local models · 0 external calls" startDelay={1.1} />
          </p>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-600">For sales &amp; marketing teams</p>
        </motion.div>

        {/* scroll cue */}
        <motion.button
          onClick={onScrollNext}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute -bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 transition-colors hover:text-white sm:-bottom-28"
        >
          <span className="text-[11px] uppercase tracking-[0.25em]">Begin</span>
          <motion.span animate={reduced ? undefined : { y: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}><ArrowDown className="h-5 w-5 lp-accent" /></motion.span>
        </motion.button>
      </div>
    </Slide>
  );
};

/* ──────────────────────────────────────────────────────────── */
const LandingPage = ({ onGetStarted, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { light, toggle } = useLandingTheme();

  // Cosmetic top progress bar only (no scroll-linked content animation).
  const { scrollYProgress } = useScroll();
  const barScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  // Enable scroll-snap only while the landing page is mounted.
  useEffect(() => {
    document.documentElement.classList.add("lp-snap");
    return () => document.documentElement.classList.remove("lp-snap");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Nav-bar options open a dedicated landing page for that topic. Falls back to
  // in-page scrolling if no router is wired up.
  const goPage = (id) => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id);
    else scrollTo(id);
  };

  return (
    <div className={`lp relative ${light ? "lp-light" : ""}`}>
      <JourneyBackground />
      <MouseLight />

      <motion.div style={{ scaleX: barScale }} className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-gradient-to-r from-indigo-500 to-violet-400" />

      {/* ─── NAV ─── */}
      <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-[#08080b]/70 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <nav className="container flex h-16 items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group flex items-center gap-2">
            <Zap className="h-6 w-6 lp-accent transition-transform group-hover:scale-110" />
            <span className="text-lg font-semibold text-white">LeadGenius AI</span>
          </button>
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => <button key={l.id} onClick={() => goPage(l.id)} className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white">{l.label}</button>)}
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
                {NAV_LINKS.map((l) => <button key={l.id} onClick={() => goPage(l.id)} className="rounded-md px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white">{l.label}</button>)}
                <button onClick={onGetStarted} className="mt-2 flex h-10 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-semibold text-white ring-1 ring-white/20 shadow-lg shadow-purple-600/30">Get started<ArrowRight className="h-4 w-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════ SLIDES ═══════════ */}
      <main className="relative z-10">
        <Intro onScrollNext={() => scrollTo("hero")} />

        {/* HERO */}
        <Slide id="hero">
          <div className="text-center">
            <Reveal>
              <button onClick={() => scrollTo("agents")} className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs backdrop-blur transition-colors hover:border-white/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-zinc-300">All systems local — v2.0</span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mx-auto mt-7 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                <span className="lp-title">Your revenue engine.</span>{" "}
                <span className="block sm:inline">
                  <span className="lp-title">Entirely</span> <span className="lp-accent">private.</span>
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
                Lead scoring, campaigns, and nine autonomous AI agents — running on open models on your own infrastructure. No cloud AI, no data egress, no per-token bills.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <MagneticButton onClick={onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton>
                <MagneticButton variant="glass" onClick={() => scrollTo("agents")}>Meet the agents</MagneticButton>
              </div>
              <p className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs text-zinc-500">
                {["self-hosted", "multi-tenant", "RBAC on every endpoint", "open local models"].map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && <span className="text-zinc-700" aria-hidden="true">·</span>}
                    <span>{t}</span>
                  </React.Fragment>
                ))}
              </p>
            </Reveal>
          </div>
        </Slide>

        {/* POWERED BY — right-to-left logo marquee (not a snap slide; a compact band) */}
        <section className="relative px-6 py-20">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal className="mb-8 text-center">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">Runs on</p>
              <h3 className="mx-auto mt-3 max-w-xl text-xl font-semibold text-white sm:text-2xl">
                Open models, on <span className="lp-accent">your</span> hardware
              </h3>
            </Reveal>
            <Reveal delay={0.05}>
              <LogoMarquee />
            </Reveal>
          </div>
        </section>

        {/* PLATFORM */}
        <Slide>
          <SceneHeader step="The platform" title="Your whole business, at a glance" subtitle="A fast, beautiful Command Center that turns live data into decisions." />
          <Reveal delay={0.05} className="mx-auto max-w-5xl">
            <div className="lp-frame p-[1px] shadow-[0_30px_120px_-20px_rgba(99,102,241,0.4)]"><ProductMock /></div>
          </Reveal>
          <Reveal delay={0.1} className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-3xl font-bold text-transparent md:text-4xl"><CountUp to={s.to} suffix={s.suffix} /></p>
                <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </Slide>

        {/* AGENTS */}
        <Slide id="agents">
          <SceneHeader step="01 · Your AI workforce" title="Nine specialists, around the clock" subtitle="Each agent runs on a dedicated local LLM and reads your live data to deliver recommendations you can act on instantly." />
          <div className="lp-group grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agentTypes.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 0.05}>
                <div onMouseMove={spotlight} className="lp-card group h-full p-5">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${a.color}`}>{a.icon}</div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-zinc-400">{a.effectiveness}%</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">{a.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{a.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Slide>

        {/* WHY */}
        <Slide id="why">
          <SceneHeader step="02 · Why LeadGenius" title="Performance, privacy, and trust" subtitle="A complete sales & marketing platform — without the privacy trade-offs of cloud AI." />
          <div className="lp-group grid auto-rows-fr gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 0.06} className={FEATURE_SPANS[i]}>
                <div onMouseMove={spotlight} className="lp-card group h-full p-7">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${f.tint}`}>{f.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Slide>

        {/* ROLES */}
        <Slide id="roles">
          <SceneHeader step="03 · For your team" title="A purpose-built portal for every role" subtitle="Everyone gets exactly the tools they need — enforced on every endpoint, not just hidden." />
          <div className="lp-group grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r, i) => (
              <Reveal key={r.label} delay={(i % 3) * 0.05}>
                <button onClick={onGetStarted} onMouseMove={spotlight} className="lp-card lp-glass group h-full w-full p-6 text-left">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${r.grad} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>{r.icon}</div>
                  <h3 className="mt-4 text-base font-semibold text-white">{r.label}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{r.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors group-hover:text-white">Open portal <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </button>
              </Reveal>
            ))}
          </div>
        </Slide>

        {/* HOW IT WORKS */}
        <Slide id="how">
          <SceneHeader step="04 · The workflow" title="From lead to closed deal in three moves" />
          <div className="lp-group grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1}>
                <div onMouseMove={spotlight} className="lp-card group h-full p-7">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${s.tint}`}>{s.icon}</div>
                    <span className="font-mono text-4xl font-bold text-white/10">{s.num}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Slide>

        {/* PROOF — the trust story is the architecture itself, told honestly.
            (Replaced fictional testimonials — Project Bible §22.1-4.) */}
        <Slide>
          <SceneHeader step="05 · Proof" title="Built to be trusted"
            subtitle="No borrowed quotes — verifiable properties of how LeadGenius is engineered." />
          <div className="lp-group grid gap-4 md:grid-cols-3">
            {TRUST_PILLARS.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.08}>
                <div onMouseMove={spotlight} className="lp-card group flex h-full flex-col p-7">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${t.tint}`}>{t.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{t.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{t.body}</p>
                  {t.flow && (
                    <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4" aria-label="Data flow: your browser, your server, your GPU">
                      {t.flow.map((step, s) => (
                        <React.Fragment key={step.label}>
                          {s > 0 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden="true" />}
                          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300">
                            {step.icon}{step.label}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Slide>

        {/* PRICING */}
        <Slide id="pricing">
          <SceneHeader step="06 · Choose your plan" title="Simple, transparent pricing" subtitle="Start free. Upgrade when your pipeline does." />
          <Reveal className="mb-8 flex justify-center">
            <p className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs text-zinc-300">
              {PRICING_NOTE}
            </p>
          </Reveal>
          <div className="lp-group grid items-stretch gap-4 lg:grid-cols-3">
            {PRICING.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div onMouseMove={spotlight} className={`lp-card group relative flex h-full flex-col p-7 ${p.highlight ? "!border-indigo-500/40 !bg-indigo-500/[0.05] lg:-translate-y-2" : ""}`}>
                  {p.highlight && <span className="lp-beam" aria-hidden="true" />}
                  {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">Most popular</span>}
                  <h3 className="text-base font-semibold text-white">{p.name}</h3>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">{p.price}</span>
                    {p.period && <span className="pb-1 text-sm text-zinc-500">{p.period}</span>}
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">{p.blurb}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15"><Check className="h-3 w-3 text-emerald-400" /></span>{f}
                      </li>
                    ))}
                  </ul>
                  {p.href ? (
                    <a href={p.href} className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-all border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10`}>{p.cta}</a>
                  ) : (
                    <button onClick={onGetStarted} className={`mt-7 h-11 w-full rounded-lg text-sm font-semibold transition-all ${p.highlight ? "lp-shimmer bg-white text-zinc-900 hover:bg-zinc-200" : "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"}`}>{p.cta}</button>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Slide>

        {/* FAQ */}
        <Slide id="faq">
          <SceneHeader step="07 · Before you go" title="Questions, answered" />
          <div className="mx-auto max-w-3xl space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={i} delay={i * 0.04}>
                  <div className={`overflow-hidden rounded-xl border bg-white/[0.02] transition-colors ${open ? "border-indigo-500/40" : "border-white/10"}`}>
                    <button onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                      <span className="font-medium text-white">{f.q}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 ${open ? "rotate-180 lp-accent" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden">
                          <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400">{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Slide>

        {/* CTA + FOOTER */}
        <Slide className="flex-col justify-between">
          <div className="flex flex-1 items-center">
            <Reveal className="w-full">
              <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 px-8 py-16 text-center">
                <div className="pointer-events-none absolute inset-0 -z-10 lp-glow opacity-90" />
                <div className="lp-float mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur"><Rocket className="h-7 w-7 lp-accent" /></div>
                <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Deploy your nine-agent revenue engine.</h2>
                <p className="mx-auto mt-4 max-w-xl text-zinc-400">Spin up your workspace in seconds. No credit card, no cloud lock-in, no data leaving your machine.</p>
                <div className="mt-8 flex justify-center"><MagneticButton onClick={onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton></div>
              </div>
            </Reveal>
          </div>
          <footer className="mt-16 w-full border-t border-white/10 pt-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2"><Zap className="h-5 w-5 lp-accent" /><span className="font-semibold text-white">LeadGenius AI</span></div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
                {NAV_LINKS.map((l) => <button key={l.id} onClick={() => goPage(l.id)} className="transition-colors hover:text-white">{l.label}</button>)}
                <button onClick={onGetStarted} className="transition-colors hover:text-white">Sign in</button>
              </div>
              <p className="text-xs text-zinc-500">© {new Date().getFullYear()} LeadGenius AI · Multi-tenant, private AI</p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/5 pt-6 pb-2 text-xs text-zinc-500">
              {TRUST_LINKS.map((l) => (
                <button key={l.id} onClick={() => goPage(l.id)} className="transition-colors hover:text-white">{l.label}</button>
              ))}
              <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-white">Contact</a>
            </div>
          </footer>
        </Slide>
      </main>
    </div>
  );
};

export default LandingPage;
