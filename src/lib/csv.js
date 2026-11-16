// Minimal, dependency-free CSV → lead-objects parser for the import feature.
// Handles quoted fields, escaped quotes ("") and commas/newlines inside quotes.

export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } // escaped quote
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\r") {
      // ignore — handled by \n
    } else if (ch === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// Header synonyms → canonical lead field (camelCase, matching the API).
const HEADER_MAP = {
  name: "name", "full name": "name", "lead name": "name", contact: "name", "contact name": "name",
  company: "company", "company name": "company", organization: "company", org: "company",
  email: "email", "e-mail": "email", "email address": "email",
  phone: "phone", "phone number": "phone", mobile: "phone", "contact number": "phone",
  channel: "channel", source: "channel",
  status: "status", stage: "status",
  interest: "interest",
  "interested product": "interestedProduct", product: "interestedProduct", interestedproduct: "interestedProduct",
  notes: "notes", note: "notes", comment: "notes", comments: "notes",
};

/**
 * Turn raw CSV text into an array of lead objects ready for the import API.
 * - Auto-maps columns by header name (case-insensitive, common synonyms).
 * - Requires a non-empty `name`; rows without one are dropped.
 * - Lowercases channel/status so they line up with the app's id values.
 * Returns { leads, skipped } where skipped = rows ignored (no name).
 */
export function csvToLeads(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return { leads: [], skipped: 0 };

  const headers = rows[0].map((h) => HEADER_MAP[h.trim().toLowerCase()] || null);
  const leads = [];
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const lead = {};
    rows[r].forEach((val, c) => {
      const key = headers[c];
      const v = (val || "").trim();
      if (key && v) lead[key] = v;
    });
    if (!lead.name) { skipped++; continue; }
    if (lead.channel) lead.channel = lead.channel.toLowerCase();
    if (lead.status) lead.status = lead.status.toLowerCase();
    leads.push(lead);
  }
  return { leads, skipped };
}
