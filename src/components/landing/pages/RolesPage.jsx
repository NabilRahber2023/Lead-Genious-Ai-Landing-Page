import React from "react";
import { ArrowRight } from "lucide-react";
import { PageShell, PageHero, SectionHeader, Reveal, MagneticButton, spotlight, ROLES } from "../shared";

const RolesPage = (props) => (
  <PageShell current="roles" {...props}>
    <PageHero
      badge="For your team"
      title="A purpose-built portal for"
      accent="every role."
      subtitle="Everyone gets exactly the tools they need — enforced on every endpoint, not just hidden in the UI."
      onGetStarted={props.onGetStarted}
    />

    <section className="px-6 pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeader eyebrow="Role-based access" title="Six roles, six experiences" />
        <div className="lp-group grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r, i) => (
            <Reveal key={r.label} delay={(i % 3) * 0.05}>
              <button onClick={props.onGetStarted} onMouseMove={spotlight} className="lp-card lp-glass group h-full w-full p-6 text-left">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${r.grad} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>{r.icon}</div>
                <h3 className="mt-4 text-base font-semibold text-white">{r.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{r.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors group-hover:text-white">Open portal <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 px-8 py-12">
            <div className="pointer-events-none absolute inset-0 -z-10 lp-glow opacity-90" />
            <h3 className="text-2xl font-bold text-white sm:text-3xl">Give every teammate the right view</h3>
            <p className="mx-auto mt-3 max-w-md text-zinc-400">Set up your team in minutes — access is enforced server-side, automatically.</p>
            <div className="mt-7 flex justify-center"><MagneticButton onClick={props.onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton></div>
          </div>
        </Reveal>
      </div>
    </section>
  </PageShell>
);

export default RolesPage;
