// TanStack Query layer — one place for query keys, shared read hooks, and the
// client. Gives every data screen caching, request deduping, background
// refetch, and retry, replacing the scattered useEffect+useState fetches.
import { QueryClient, useQuery } from "@tanstack/react-query";
import {
  leadsApi, campaignsApi, agentsApi, teamApi, analyticsApi, settingsApi,
  notificationsApi,
} from "@/lib/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // data stays fresh for 30s → dedupes bursty mounts
      retry: 1,                 // one retry on transient failure, then surface it
      refetchOnWindowFocus: false,
    },
  },
});

// ── Query keys (single source, used by invalidations everywhere) ──
export const QK = {
  leads: ["leads"],                       // full array (dashboards aggregate)
  leadsPage: (params) => ["leads", "page", params],
  campaigns: ["campaigns"],
  agents: ["agents"],
  agentLogs: (key) => ["agents", key, "logs"],
  team: ["team"],
  dashboard: ["analytics", "dashboard"],
  reports: ["analytics", "reports"],
  settings: ["settings"],
  notifications: ["notifications"],
};

// Invalidate everything derived from lead data (leads, analytics, notifications).
export const invalidateLeadData = () => {
  queryClient.invalidateQueries({ queryKey: ["leads"] });
  queryClient.invalidateQueries({ queryKey: ["analytics"] });
  queryClient.invalidateQueries({ queryKey: QK.notifications });
};

// ── Shared read hooks ──
export const useLeadsAll = (options = {}) =>
  useQuery({ queryKey: QK.leads, queryFn: leadsApi.list, ...options });

export const useLeadsPage = (params) =>
  useQuery({
    queryKey: QK.leadsPage(params),
    queryFn: () => leadsApi.page(params),
    placeholderData: (prev) => prev, // keep old page visible while the next loads
  });

export const useCampaignsQuery = (options = {}) =>
  useQuery({ queryKey: QK.campaigns, queryFn: campaignsApi.list, ...options });

export const useAgentsQuery = (options = {}) =>
  useQuery({ queryKey: QK.agents, queryFn: agentsApi.list, ...options });

export const useAgentLogsQuery = (agentKey, options = {}) =>
  useQuery({
    queryKey: QK.agentLogs(agentKey),
    queryFn: () => agentsApi.logs(agentKey),
    ...options,
  });

export const useTeamQuery = (options = {}) =>
  useQuery({ queryKey: QK.team, queryFn: teamApi.list, ...options });

export const useDashboardQuery = () =>
  useQuery({ queryKey: QK.dashboard, queryFn: analyticsApi.dashboard });

export const useReportsQuery = () =>
  useQuery({ queryKey: QK.reports, queryFn: analyticsApi.reports });

export const useSettingsQuery = (options = {}) =>
  useQuery({ queryKey: QK.settings, queryFn: settingsApi.get, ...options });

// Poll the workspace event feed so the bell badge stays current.
export const useNotificationsQuery = () =>
  useQuery({
    queryKey: QK.notifications,
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30_000,
  });
