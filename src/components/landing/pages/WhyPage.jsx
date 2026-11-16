import React from "react";
import { ArrowRight } from "lucide-react";
import { PageShell, PageHero, SectionHeader, Reveal, CountUp, MagneticButton, spotlight, FEATURES, STATS } from "../shared";

const WhyPage = (props) => (
  <PageShell current="why" {...props}>
    <PageHero
      badge="Why LeadGenius"
      title="Performance, privacy,"
      accent="and trust."
      subtitle="A complete sales & marketing platform — without the privacy trade-offs of cloud AI."
      onGetStarted={props.onGetStarted}
    />

    <section className="px-6 pb-20">
      <div className="mx-auto w-full max-w-5xl">
        <SectionHeader eyebrow="Built different" title="What sets us apart" />
        <div className="lp-group grid auto-rows-fr gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 0.06}>
              <div onMouseMove={spotlight} className="lp-card group h-full p-7">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${f.tint}`}>{f.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-3xl font-bold text-transparent md:text-4xl"><CountUp to={s.to} suffix={s.suffix} /></p>
              <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    <section className="px-6 pb-24">
      <Reveal className="text-center">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 px-8 py-12">
          <div className="pointer-events-none absolute inset-0 -z-10 lp-glow opacity-90" />
          <h3 className="text-2xl font-bold text-white sm:text-3xl">Privacy-first, by design</h3>
          <p className="mx-auto mt-3 max-w-md text-zinc-400">Run powerful AI without sending a single byte of customer data to the cloud.</p>
          <div className="mt-7 flex justify-center"><MagneticButton onClick={props.onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton></div>
        </div>
      </Reveal>
    </section>
  </PageShell>
);

export default WhyPage;
