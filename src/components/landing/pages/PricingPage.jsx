import React from "react";
import { Check } from "lucide-react";
import { PageShell, PageHero, SectionHeader, Reveal, spotlight, PRICING, PRICING_NOTE } from "../shared";

const PricingPage = (props) => (
  <PageShell current="pricing" {...props}>
    <PageHero
      badge="Pricing"
      title="Simple, transparent"
      accent="pricing."
      subtitle="Start free. Upgrade when your pipeline does — no hidden fees, no cloud lock-in."
    />

    <section className="px-6 pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader eyebrow="Choose your plan" title="Plans that grow with you" />
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
                  <a href={p.href} className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg border border-white/15 bg-white/5 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10">{p.cta}</a>
                ) : (
                  <button onClick={props.onGetStarted} className={`mt-7 h-11 w-full rounded-lg text-sm font-semibold transition-all ${p.highlight ? "lp-shimmer bg-white text-zinc-900 hover:bg-zinc-200" : "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"}`}>{p.cta}</button>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-sm text-zinc-500">All plans include all 9 AI agents running locally. Cancel anytime · No credit card required to start.</p>
        </Reveal>
      </div>
    </section>
  </PageShell>
);

export default PricingPage;
