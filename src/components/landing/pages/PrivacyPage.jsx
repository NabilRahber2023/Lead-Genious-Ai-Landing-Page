import React from "react";
import LegalShell from "./LegalShell";
import { CONTACT_EMAIL } from "../shared";

const SECTIONS = [
  {
    heading: "The short version",
    paragraphs: [
      "LeadGenius AI is a self-hosted platform. Your workspace's data — leads, campaigns, interactions, and AI prompts — lives in the PostgreSQL database run by whoever operates your installation, and AI processing happens on that installation's own hardware via Ollama. No lead data is sent to third-party AI providers.",
    ],
  },
  {
    heading: "What we store",
    bullets: [
      "Account data: your name, email address, role, and a salted hash of your password (never the password itself).",
      "Workspace data: the leads, campaigns, interactions, notes, and settings your team creates.",
      "AI activity: each agent run's input context and generated output, logged for auditability.",
      "Operational events: workspace notifications such as hot-lead alerts and completed agent runs.",
    ],
  },
  {
    heading: "What we don't do",
    bullets: [
      "We don't send your business data to external AI or analytics services — the 9 agents run on local models through Ollama.",
      "We don't sell or share personal data.",
      "We don't track you across other sites; the app sets no third-party cookies. Session state is a token in your browser's local storage.",
    ],
  },
  {
    heading: "Data isolation",
    paragraphs: [
      "Every workspace (tenant) is isolated at the database layer. Users in one workspace can never read another workspace's data; every API request is scoped server-side to the authenticated user's tenant.",
    ],
  },
  {
    heading: "Your controls",
    bullets: [
      "Workspace owners can export all leads as CSV at any time (Settings → Data Management).",
      "Workspace owners can permanently delete all leads, campaigns, and AI logs (Reset Workspace Data).",
      "Platform administrators can deactivate accounts and entire workspaces.",
    ],
  },
  {
    heading: "Questions",
    paragraphs: [`Email ${CONTACT_EMAIL} with any privacy question or request.`],
  },
];

const PrivacyPage = (props) => (
  <LegalShell
    current="privacy"
    eyebrow="Trust"
    title="Privacy Policy"
    subtitle="Private by architecture: your data stays on your own infrastructure."
    updated="July 2026"
    sections={SECTIONS}
    {...props}
  />
);

export default PrivacyPage;
