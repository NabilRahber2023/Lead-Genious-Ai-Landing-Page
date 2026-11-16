import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { Search, Users, Megaphone, ArrowRight } from "lucide-react";
import { useLeadsAll, useCampaignsQuery } from "@/lib/queries";
import { useAuth } from "@/context/AuthContext";

/**
 * CommandPalette — Ctrl/Cmd+K quick actions (Project Bible R10).
 * Navigate to any page you can access, or jump straight to a lead or campaign
 * by name. Data comes from the shared query cache and is only fetched while
 * the palette is open.
 */
const CommandPalette = ({ pages = [] }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { can } = useAuth();

  // Only hit the API while the palette is open (and only for permitted data).
  const { data: leads = [] } = useLeadsAll({ enabled: open && can("viewLeads") });
  const { data: campaigns = [] } = useCampaignsQuery({ enabled: open && can("viewCampaigns") });

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed left-1/2 top-24 z-50 w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl"
      overlayClassName="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 border-b px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Command.Input
          placeholder="Search pages, leads, campaigns…"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Esc</kbd>
      </div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
          No results found.
        </Command.Empty>

        <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
          {pages.map((p) => (
            <Command.Item
              key={p.to}
              value={`page ${p.label}`}
              onSelect={() => go(p.to)}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm aria-selected:bg-muted"
            >
              <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {p.label}
            </Command.Item>
          ))}
        </Command.Group>

        {can("viewLeads") && leads.length > 0 && (
          <Command.Group heading="Leads" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
            {leads.slice(0, 50).map((l) => (
              <Command.Item
                key={l.id}
                value={`lead ${l.name} ${l.company || ""}`}
                onSelect={() => go("/app/leads")}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm aria-selected:bg-muted"
              >
                <Users className="h-4 w-4 text-sky-500" aria-hidden="true" />
                <span className="truncate">{l.name}</span>
                {l.company && <span className="truncate text-xs text-muted-foreground">· {l.company}</span>}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {can("viewCampaigns") && campaigns.length > 0 && (
          <Command.Group heading="Campaigns" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
            {campaigns.map((c) => (
              <Command.Item
                key={c.id}
                value={`campaign ${c.name}`}
                onSelect={() => go("/app/campaigns")}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm aria-selected:bg-muted"
              >
                <Megaphone className="h-4 w-4 text-violet-500" aria-hidden="true" />
                <span className="truncate">{c.name}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
      <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">
        Press <kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 font-medium">Ctrl</kbd>+<kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 font-medium">K</kbd> anywhere to open this palette.
      </div>
    </Command.Dialog>
  );
};

export default CommandPalette;
