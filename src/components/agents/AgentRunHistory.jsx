import React from "react";
import { History, Loader2 } from "lucide-react";
import { useAgentLogsQuery } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/data";

/**
 * AgentRunHistory — the agent's recent runs, straight from agent_logs (the
 * data was recorded since day one; this finally surfaces it). Rendered lazily:
 * mounted only while the panel is open, so history is fetched on demand.
 */
const AgentRunHistory = ({ agentKey }) => {
  const { data: logs = [], isLoading } = useAgentLogsQuery(agentKey);

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />Loading run history…
      </p>
    );
  }
  if (logs.length === 0) {
    return <p className="py-3 text-xs italic text-muted-foreground">No runs recorded yet.</p>;
  }

  return (
    <ol className="max-h-56 space-y-2 overflow-y-auto pr-1" aria-label="Recent runs">
      {logs.map((log) => (
        <li key={log.id} className="rounded-lg border border-border/40 bg-muted/30 p-2.5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <History className="h-3 w-3" aria-hidden="true" />
              {formatRelativeTime(log.createdAt)}
            </span>
            {log.status !== "success" && (
              <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                {log.status}
              </span>
            )}
          </div>
          <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/80">
            {log.output || "(no output)"}
          </p>
        </li>
      ))}
    </ol>
  );
};

export default AgentRunHistory;
