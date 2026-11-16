import React from "react";
import { ArrowRight } from "lucide-react";
import LegalShell from "./LegalShell";
import { Reveal, TRUST_PILLARS, CONTACT_EMAIL, spotlight } from "../shared";

const SECTIONS = [
  {
    heading: "Authentication & sessions",
    bullets: [
      "Passwords are hashed with PBKDF2-HMAC-SHA256 (200,000 iterations, per-user salt) — never stored in plaintext.",
      "Sessions use signed JWTs; expired or invalid tokens sign you out immediately.",
      "Login endpoints are rate-limited to slow down credential-stuffing attempts.",
      "Invited teammates start on a one-time temporary password and are prompted to set their own.",
    ],
  },
  {
    heading: "Authorization (RBAC)",
    bullets: [
      "Six roles — Super Admin, Owner, Manager, Marketing, Sales, Read-only — each with a defined permission tier.",
      "Every API endpoint enforces roles server-side: a wrong role receives HTTP 403 regardless of what the UI shows.",
      "Platform administrators can additionally disable modules and specific AI agents per workspace.",
    ],
  },
  {
    heading: "Tenant isolation",
    bullets: [
      "Every query is scoped to the authenticated user's workspace at the database layer.",
      "Workspace deactivation immediately blocks sign-in for all of its members.",
    ],
  },
  {
    heading: "AI data path",
    paragraphs: [
      "Agent runs read your live workspace data, build a context summary on your backend, and send it to Ollama running on your own hardware. The request never leaves your infrastructure, and every run is logged (input and output) for audit.",
    ],
  },
  {
    heading: "Responsible disclosure",
    paragraphs: [
      `Found a vulnerability? Email ${CONTACT_EMAIL} — we'll respond as fast as we can and credit good-faith reports.`,
    ],
  },
];

const SecurityPage = (props) => (
  <LegalShell
    current="security"
    eyebrow="Trust"
    title="Security"
    subtitle="How LeadGenius AI is engineered to keep your pipeline private."
    updated="July 2026"
    sections={SECTIONS}
    {...props}
  >
    {/* Architecture-of-trust pillars, shared with the landing page. */}
    <Reveal>
      <div className="lp-group mt-4 grid gap-4 md:grid-cols-3">
        {TRUST_PILLARS.map((t) => (
          <div key={t.title} onMouseMove={spotlight} className="lp-card flex h-full flex-col p-6">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.tint}`}>{t.icon}</div>
            <h3 className="mt-3 text-base font-semibold text-white">{t.title}</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-400">{t.body}</p>
            {t.flow && (
              <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                {t.flow.map((step, s) => (
                  <React.Fragment key={step.label}>
                    {s > 0 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden="true" />}
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                      {step.icon}{step.label}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Reveal>
  </LegalShell>
);

export default SecurityPage;
