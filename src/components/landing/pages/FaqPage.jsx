import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell, PageHero, SectionHeader, Reveal, MagneticButton, EASE, FAQS } from "../shared";

const FaqPage = (props) => {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <PageShell current="faq" {...props}>
      <PageHero
        badge="FAQ"
        title="Questions,"
        accent="answered."
        subtitle="Everything you need to know about how LeadGenius keeps your data private and your team productive."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto w-full max-w-3xl">
          <SectionHeader eyebrow="Before you go" title="Frequently asked questions" />
          <div className="space-y-3">
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

          <Reveal className="mt-12 text-center">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 px-8 py-12">
              <div className="pointer-events-none absolute inset-0 -z-10 lp-glow opacity-90" />
              <h3 className="text-2xl font-bold text-white sm:text-3xl">Still have questions?</h3>
              <p className="mx-auto mt-3 max-w-md text-zinc-400">The fastest way to learn LeadGenius is to try it — spin up a workspace in seconds.</p>
              <div className="mt-7 flex justify-center"><MagneticButton onClick={props.onGetStarted}>Get started free <ArrowRight className="ml-2 h-4 w-4" /></MagneticButton></div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
};

export default FaqPage;
