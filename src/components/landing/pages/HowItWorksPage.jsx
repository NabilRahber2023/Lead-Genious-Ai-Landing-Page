import React from "react";
import { ArrowRight } from "lucide-react";
import { PageShell, PageHero, SectionHeader, Reveal, MagneticButton, spotlight, STEPS } from "../shared";

const HowItWorksPage = (props) => (
  <PageShell current="how" {...props}>
    <PageHero
      badge="How it works"
      title="From lead to closed deal in"
      accent="three moves."
      subtitle="LeadGenius keeps the workflow simple: capture and score, deploy your agents, then convert and grow — backed by dashboards that prove the ROI."
      onGetStarted={props.onGetStarted}
    />

    <section className="px-6 pb-24">
      <div className="mx-auto w-full max-w-5xl">
        <SectionHeader eyebrow="The workflow" title="Three steps, end to end" />
        <div className="space-y-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.08}>
              <div onMouseMove={spotlight} className="lp-card group flex flex-col gap-5 p-7 sm:flex-row sm:items-center">
                <div className="flex items-center gap-5">
                  <span className="text-5xl font-bold text-white/10">{s.num}</span>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${s.tint}`}>{s.icon}</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 px-8 py-12">
            <div className="pointer-events-none absolute inset-0 -z-10 lp-glow opacity-90" />
            <h3 className="text-2xl font-bold text-white sm:text-3xl">See the workflow in action</h3>
            <p className="mx-auto mt-3 max-w-md text-zinc-400">Start free and watch leads move from captured to closed.</p>
            <div className="mt-7 flex justify-center"><MagneticButton onClick={props.onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton></div>
          </div>
        </Reveal>
      </div>
    </section>
  </PageShell>
);

export default HowItWorksPage;
