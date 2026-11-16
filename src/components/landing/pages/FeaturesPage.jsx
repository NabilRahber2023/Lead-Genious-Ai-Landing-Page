import React from "react";
import {
  ArrowRight, Check, CircleDot, Sparkles,
  Users, Bot, MessageSquare, BarChart3, ShieldCheck, Building2,
  Gauge, Upload, UserCog, Lock, Zap, Star,
} from "lucide-react";
import { agentTypes } from "@/lib/data";
import {
  PageShell, PageHero, SectionHeader, Reveal, CountUp, MagneticButton, spotlight,
  FEATURES, STEPS, ROLES,
} from "../shared";

/* Every module of the platform — the "one platform, every tool" grid. */
const MODULES = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Lead CRM & Scoring",
    body: "Capture leads from 9 channels and let a deterministic 0–100 score rank them, so your team always knows who to call first.",
    points: ["9 acquisition channels", "Auto 0–100 priority score", "Full interaction history"],
    tint: "text-blue-400", ring: "border-blue-500/40",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "9 AI Agents",
    body: "A workforce of specialist agents — each on its own local model — reads your live pipeline and returns ready-to-act recommendations.",
    points: ["Prospecting to retention", "Runs on your machine", "Clear bullet actions"],
    tint: "text-violet-400", ring: "border-violet-500/40",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Campaign Management",
    body: "Plan, launch, and track multi-channel campaigns, then measure the ROI of every dollar and every channel in one place.",
    points: ["Multi-channel campaigns", "Budget & ROI tracking", "Performance insights"],
    tint: "text-emerald-400", ring: "border-emerald-500/40",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Real-time Analytics",
    body: "Live dashboards tailored to each role — pipeline funnels, channel conversion, AI ROI, and hot-lead lists that update as you work.",
    points: ["Role-based dashboards", "Pipeline funnel & KPIs", "Exportable reports"],
    tint: "text-orange-400", ring: "border-orange-500/40",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Role-based Access",
    body: "Six roles, each with a purpose-built portal, enforced on every backend endpoint — not just hidden in the interface.",
    points: ["6 distinct roles", "Enforced server-side", "Per-role portals"],
    tint: "text-rose-400", ring: "border-rose-500/40",
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: "Multi-Tenancy",
    body: "Every workspace is isolated at the data layer. Run one business — or a whole agency of clients — from a single platform.",
    points: ["Data-layer isolation", "Unlimited workspaces", "Per-tenant controls"],
    tint: "text-sky-400", ring: "border-sky-500/40",
  },
  {
    icon: <Upload className="h-5 w-5" />,
    title: "CSV Import",
    body: "Bring your existing book of business in seconds. Import leads in bulk and they're scored and pipeline-ready instantly.",
    points: ["Bulk lead import", "Instant scoring", "Zero setup"],
    tint: "text-teal-400", ring: "border-teal-500/40",
  },
  {
    icon: <UserCog className="h-5 w-5" />,
    title: "Team Management",
    body: "Invite teammates, assign roles, and manage access from one screen — with secure temporary passwords for new members.",
    points: ["Invite & assign roles", "Secure onboarding", "Owner controls"],
    tint: "text-amber-400", ring: "border-amber-500/40",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Private by Design",
    body: "All AI runs locally through Ollama. Your leads, prompts, and business insights never leave your own infrastructure.",
    points: ["100% local AI", "No third-party cloud", "You own your data"],
    tint: "text-indigo-400", ring: "border-indigo-500/40",
  },
];

const STATS = [
  { to: 9, suffix: "", label: "AI agents" },
  { to: 6, suffix: "", label: "Team roles" },
  { to: 9, suffix: "", label: "Lead channels" },
  { to: 100, suffix: "%", label: "Private & local" },
];

const FeaturesPage = (props) => (
  <PageShell current="features" {...props}>
    <PageHero
      badge="Features"
      title="Everything you need to"
      accent="turn leads into revenue."
      subtitle="LeadGenius AI brings your CRM, AI agents, campaigns, and analytics into one private, role-based platform — so every part of your team has exactly the right tools, and none of your data ever leaves your machine."
      onGetStarted={props.onGetStarted}
    />

    {/* ─── Stat band ─── */}
    <section className="px-6 pb-6">
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-bold lp-accent-flow bg-clip-text text-transparent sm:text-5xl">
                  <CountUp to={s.to} suffix={s.suffix} />
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-zinc-400 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>

    {/* ─── Core pillars ─── */}
    <section className="px-6 pb-8 pt-16">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader
          eyebrow="Why LeadGenius"
          title="Built on four promises"
          subtitle="The foundations that make LeadGenius different from every other lead-gen tool."
        />
        <div className="lp-group grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.05}>
              <div onMouseMove={spotlight} className="lp-card group flex h-full flex-col p-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${f.tint}`}>{f.icon}</div>
                <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ─── One platform, every tool ─── */}
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader
          eyebrow="The full toolkit"
          title="One platform, every tool"
          subtitle="From the first captured lead to a loyal, repeat customer — every stage has a dedicated, thoughtfully designed module."
        />
        <div className="lp-group grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <Reveal key={m.title} delay={(i % 3) * 0.05}>
              <div onMouseMove={spotlight} className={`lp-card group flex h-full flex-col p-6 border ${m.ring}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${m.tint}`}>{m.icon}</div>
                <h3 className="mt-4 text-base font-semibold text-white">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{m.body}</p>
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {m.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-zinc-300">
                      <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${m.tint}`} />{p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ─── AI agents preview ─── */}
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader
          eyebrow="Your AI workforce"
          title="Nine specialists, on call 24/7"
          subtitle="Each agent runs on a dedicated local model and reads your live data to deliver recommendations you can act on instantly."
        />
        <div className="lp-group grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agentTypes.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 0.05}>
              <div onMouseMove={spotlight} className="lp-card group flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${a.color}`}>{a.icon}</div>
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
                    <CircleDot className="h-3 w-3 text-emerald-400" />{a.effectiveness}% effective
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{a.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{a.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex justify-center">
          <button
            onClick={() => props.onNavigate("agents")}
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/10"
          >
            Explore every agent in detail
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </Reveal>
      </div>
    </section>

    {/* ─── Role-based portals ─── */}
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader
          eyebrow="Made for every seat"
          title="A purpose-built portal per role"
          subtitle="Six roles, six tailored experiences — each person sees only the tools they need, enforced on every endpoint."
        />
        <div className="lp-group grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r, i) => (
            <Reveal key={r.label} delay={(i % 3) * 0.05}>
              <div onMouseMove={spotlight} className="lp-card group flex h-full items-start gap-4 p-6">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${r.grad} text-white`}>{r.icon}</div>
                <div>
                  <h3 className="text-base font-semibold text-white">{r.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{r.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ─── How it works ─── */}
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <SectionHeader
          eyebrow="How it works"
          title="Live in three simple steps"
          subtitle="No lengthy setup, no data leaving your machine — just results."
        />
        <div className="lp-group grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.06}>
              <div onMouseMove={spotlight} className="lp-card group flex h-full flex-col p-7">
                <span className="text-5xl font-bold lp-accent-flow bg-clip-text text-transparent">{s.num}</span>
                <div className={`mt-4 flex h-11 w-11 items-center justify-center rounded-xl border ${s.tint}`}>{s.icon}</div>
                <h3 className="mt-4 text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ─── CTA ─── */}
    <section className="px-6 pb-28 pt-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 px-8 py-14">
          <div className="pointer-events-none absolute inset-0 -z-10 lp-glow opacity-90" />
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 lp-accent" /> Free forever plan available
          </span>
          <h3 className="mt-5 text-3xl font-bold text-white sm:text-4xl">See every feature in action</h3>
          <p className="mx-auto mt-3 max-w-md text-zinc-400">
            Spin up your private workspace in seconds — all 9 agents, full CRM, and analytics included from day one.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticButton onClick={props.onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton>
            <button
              onClick={() => props.onNavigate("pricing")}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-7 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
            >
              View pricing
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  </PageShell>
);

export default FeaturesPage;
