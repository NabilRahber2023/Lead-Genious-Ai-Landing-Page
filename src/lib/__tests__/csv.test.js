import { describe, it, expect } from "vitest";
import { parseCSV, csvToLeads } from "@/lib/csv";

describe("parseCSV", () => {
  it("parses simple rows", () => {
    expect(parseCSV("a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
  });

  it("handles quoted fields with commas and escaped quotes", () => {
    const rows = parseCSV('name,notes\n"Doe, Jane","said ""hi"" twice"');
    expect(rows[1]).toEqual(["Doe, Jane", 'said "hi" twice']);
  });

  it("handles newlines inside quotes and CRLF endings", () => {
    const rows = parseCSV('name,notes\r\n"A","line1\nline2"\r\n');
    expect(rows).toEqual([["name", "notes"], ["A", "line1\nline2"]]);
  });

  it("drops fully empty rows", () => {
    expect(parseCSV("a,b\n,\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
  });
});

describe("csvToLeads", () => {
  it("maps header synonyms to canonical fields", () => {
    const { leads } = csvToLeads(
      "Full Name,Organization,E-mail,Source,Stage\nJane,Acme,j@a.com,Referral,NEW"
    );
    expect(leads).toEqual([
      { name: "Jane", company: "Acme", email: "j@a.com", channel: "referral", status: "new" },
    ]);
  });

  it("skips rows without a name and counts them", () => {
    const { leads, skipped } = csvToLeads("name,email\n,noname@x.com\nJane,j@x.com");
    expect(leads).toHaveLength(1);
    expect(skipped).toBe(1);
  });

  it("returns empty for a header-only file", () => {
    expect(csvToLeads("name,email")).toEqual({ leads: [], skipped: 0 });
  });
});
