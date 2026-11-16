import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Flame, UserPlus, Bot, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationsApi } from "@/lib/api";
import { useNotificationsQuery, queryClient, QK } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/data";
import { cn } from "@/lib/utils";

const TYPE_META = {
  hot_lead: { icon: Flame, accent: "acc-amber" },
  member_joined: { icon: UserPlus, accent: "acc-emerald" },
  agent_run: { icon: Bot, accent: "acc-cyan" },
};

/**
 * NotificationsBell — the real workspace event feed (Project Bible R12),
 * replacing the fake bell removed in the honesty pass. Polls every 30s;
 * events: hot leads crossing 70, teammates joining, finished agent runs.
 * Clicking an item marks it read and follows its deep link.
 */
const NotificationsBell = () => {
  const navigate = useNavigate();
  const { data } = useNotificationsQuery();
  const items = data?.items ?? [];
  const unread = data?.unread ?? 0;

  const refresh = () => queryClient.invalidateQueries({ queryKey: QK.notifications });

  const open = async (n) => {
    try {
      if (!n.isRead) await notificationsApi.read(n.id);
    } finally {
      refresh();
      if (n.link) navigate(n.link);
    }
  };

  const markAll = async () => {
    try {
      await notificationsApi.readAll();
    } finally {
      refresh();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost" size="icon" className="relative"
          aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge variant="default" className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs tabular-nums">
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 max-w-[92vw] p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={markAll}>
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
              <p className="text-xs text-muted-foreground/70">Hot leads, new teammates, and finished agent runs will show up here.</p>
            </div>
          ) : (
            <ul>
              {items.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.agent_run;
                const Icon = meta.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => open(n)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50",
                        !n.isRead && "bg-primary/5"
                      )}
                    >
                      <span className={cn("acc-tile mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg", meta.accent)}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-sm", !n.isRead ? "font-semibold" : "font-medium")}>
                          {n.title}
                        </span>
                        {n.body && <span className="block truncate text-xs text-muted-foreground">{n.body}</span>}
                        <span className="mt-0.5 block text-[11px] text-muted-foreground/70">{formatRelativeTime(n.createdAt)}</span>
                      </span>
                      {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsBell;
