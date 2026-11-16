import React from "react";
import { PageShell, PageHero, Reveal } from "../shared";

/**
 * LegalShell — shared layout for the trust & legal pages (Privacy, Terms,
 * Security). A hero + prose sections rendered from a data array so all three
 * pages stay visually identical (Project Bible R14).
 */
const LegalShell = ({ current, eyebrow, title, subtitle, updated, sections, children, ...props }) => (
  <PageShell current={current} {...props}>
    <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
    <section className="container pb-24">
      <div className="mx-auto max-w-3xl">
        {updated && (
          <Reveal>
            <p className="mb-10 text-xs text-zinc-500">Last updated: {updated}</p>
          </Reveal>
        )}
        {sections?.map((s, i) => (
          <Reveal key={s.heading} delay={Math.min(i * 0.04, 0.2)}>
            <div className="mb-10">
              <h2 className="mb-3 text-xl font-semibold text-white">{s.heading}</h2>
              {s.paragraphs?.map((p, j) => (
                <p key={j} className="mb-3 text-sm leading-relaxed text-zinc-400">{p}</p>
              ))}
              {s.bullets && (
                <ul className="mt-2 space-y-2">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-zinc-400">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
        {children}
      </div>
    </section>
  </PageShell>
);

export default LegalShell;
