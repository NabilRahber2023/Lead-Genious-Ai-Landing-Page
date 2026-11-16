import React from "react";
import { Check, ArrowRight, CircleDot } from "lucide-react";
import { agentTypes } from "@/lib/data";
import { PageShell, PageHero, SectionHeader, Reveal, MagneticButton, spotlight } from "../shared";

const AgentsPage = (props) => (
  <PageShell current="agents" {...props}>
    <PageHero
      badge="AI Agents"
      title="Nine specialists,"
      accent="around the clock."
      subtitle="Each agent runs on a dedicated local LLM and reads your live pipeline to deliver recommendations you can act on instantly — all on your own infrastructure."
      onGetStarted={props.onGetStarted}
    />

    <section className="px-6 pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader eyebrow="Your AI workforce" title="Meet every agent" subtitle="From finding net-new prospects to keeping your best customers, there's a specialist for every stage of the journey." />
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
                {a.capabilities?.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {a.capabilities.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 px-8 py-12">
            <div className="pointer-events-none absolute inset-0 -z-10 lp-glow opacity-90" />
            <h3 className="text-2xl font-bold text-white sm:text-3xl">Put all 9 agents to work today</h3>
            <p className="mx-auto mt-3 max-w-md text-zinc-400">Spin up your workspace and activate any agent in seconds — no cloud, no data leaving your machine.</p>
            <div className="mt-7 flex justify-center"><MagneticButton onClick={props.onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton></div>
          </div>
        </Reveal>
      </div>
    </section>
  </PageShell>
);

export default AgentsPage;
