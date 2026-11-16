// Central API client for the LeadGenius backend.
//
// Handles the base URL, the auth token (stored in localStorage), JSON fetching,
// and exposes a typed-ish surface per resource (auth, leads, campaigns, agents,
// analytics, settings). All authenticated calls go through `apiFetch`, which
// attaches the Bearer token and surfaces backend error messages.

// Backend base URL. In production set VITE_API_BASE_URL at build time (e.g.
// https://api.yourdomain.com) — falls back to localhost for local dev.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "lg_token";

// Fired whenever the backend rejects our token (401). AuthContext listens and
// signs the user out so the app returns to the login screen instead of leaving
// every subsequent action erroring with a stale session.
export const UNAUTHORIZED_EVENT = "lg:unauthorized";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function readError(res, fallback) {
  try {
    const err = await res.json();
    if (err.detail) {
      return typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
    }
  } catch {
    /* no JSON body */
  }
  return fallback;
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    throw new Error(await readError(res, `Request failed (${res.status})`));
  }
  if (res.status === 204) return null;
  return res.json();
}

export const authApi = {
  async login(email, password) {
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(await readError(res, "Login failed"));
    const data = await res.json();
    setToken(data.access_token);
    return data;
  },
  // JSON login used by the role-card forms; supports an optional company domain.
  async roleLogin({ email, password, domain }) {
    const res = await fetch(`${BASE_URL}/auth/role-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, domain: domain || null }),
    });
    if (!res.ok) throw new Error(await readError(res, "Login failed"));
    const data = await res.json();
    setToken(data.access_token);
    return data;
  },
  async register(payload) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await readError(res, "Registration failed"));
    const data = await res.json();
    setToken(data.access_token);
    return data;
  },
  me: () => apiFetch("/auth/me"),
  // Change the signed-in user's own password (also clears the temp-password flag).
  changePassword: ({ currentPassword, newPassword }) =>
    apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  logout: () => clearToken(),
};

export const leadsApi = {
  list: () => apiFetch("/leads"),
  // Server-side paginated + sorted + filtered listing → { items, total, page, pageSize }.
  page: ({ page = 1, pageSize = 25, search, status, channel, sort, order } = {}) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) params.set("search", search);
    if (status) params.set("status_filter", status);
    if (channel) params.set("channel", channel);
    if (sort) params.set("sort", sort);
    if (order) params.set("order", order);
    return apiFetch(`/leads?${params.toString()}`);
  },
  bulkDelete: (ids) =>
    apiFetch("/leads/bulk-delete", { method: "POST", body: JSON.stringify({ ids }) }),
  create: (lead) => apiFetch("/leads", { method: "POST", body: JSON.stringify(lead) }),
  update: (id, lead) => apiFetch(`/leads/${id}`, { method: "PUT", body: JSON.stringify(lead) }),
  remove: (id) => apiFetch(`/leads/${id}`, { method: "DELETE" }),
  addInteraction: (id, interaction) =>
    apiFetch(`/leads/${id}/interactions`, { method: "POST", body: JSON.stringify(interaction) }),
  // Bulk-create leads (CSV import). Returns { created, skipped, errors }.
  import: (leads) => apiFetch("/leads/import", { method: "POST", body: JSON.stringify({ leads }) }),
};

export const campaignsApi = {
  list: () => apiFetch("/campaigns"),
  create: (c) => apiFetch("/campaigns", { method: "POST", body: JSON.stringify(c) }),
  update: (id, c) => apiFetch(`/campaigns/${id}`, { method: "PUT", body: JSON.stringify(c) }),
  remove: (id) => apiFetch(`/campaigns/${id}`, { method: "DELETE" }),
};

export const agentsApi = {
  list: () => apiFetch("/agents"),
  toggle: (key) => apiFetch(`/agents/${key}/toggle`, { method: "POST" }),
  // Optional steering instruction typed by the user (e.g. "focus on referrals").
  run: (key, instruction) =>
    apiFetch(`/agents/${key}/run`, {
      method: "POST",
      body: JSON.stringify({ instruction: instruction || null }),
    }),
  // The agent's recent runs (newest first) — powers the Run History panel.
  logs: (key, limit = 10) => apiFetch(`/agents/${key}/logs?limit=${limit}`),
};

// Workspace notifications (bell dropdown). Poll-based.
export const notificationsApi = {
  list: (limit = 30) => apiFetch(`/notifications?limit=${limit}`),
  read: (id) => apiFetch(`/notifications/${id}/read`, { method: "POST" }),
  readAll: () => apiFetch("/notifications/read-all", { method: "POST" }),
};

// Tenant data management — owner only.
export const dataApi = {
  reset: () => apiFetch("/data/reset", { method: "POST" }),
  // First-run helper: load a realistic sample dataset into this workspace.
  sample: () => apiFetch("/data/sample", { method: "POST" }),
};

/**
 * Download an authenticated file (e.g. CSV export) and save it via a temporary
 * object URL. Non-JSON path, so it doesn't go through apiFetch.
 */
export async function downloadFile(path, filename) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) throw new Error(await readError(res, `Download failed (${res.status})`));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const analyticsApi = {
  dashboard: () => apiFetch("/analytics/dashboard"),
  reports: () => apiFetch("/analytics/reports"),
};

export const settingsApi = {
  get: () => apiFetch("/settings"),
  update: (data) => apiFetch("/settings", { method: "PUT", body: JSON.stringify(data) }),
};

// Team management — owner only.
export const teamApi = {
  list: () => apiFetch("/team"),
  invite: (member) => apiFetch("/team/invite", { method: "POST", body: JSON.stringify(member) }),
  updateRole: (id, role) =>
    apiFetch(`/team/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  // Owner resets a member's password → returns a fresh one-time temp password.
  resetPassword: (id) => apiFetch(`/team/${id}/reset-password`, { method: "POST" }),
  deactivate: (id) => apiFetch(`/team/${id}`, { method: "DELETE" }),
};

// Super admin platform management.
export const adminApi = {
  bootstrap: (payload) =>
    apiFetch("/admin/bootstrap", { method: "POST", body: JSON.stringify(payload) }),
  stats: () => apiFetch("/admin/stats"),
  tenants: (search) => apiFetch(`/admin/tenants${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  tenant: (id) => apiFetch(`/admin/tenants/${id}`),
  // Create a new company (tenant) + its first owner.
  createTenant: (payload) => apiFetch("/admin/tenants", { method: "POST", body: JSON.stringify(payload) }),
  // Add a user (default role: owner) to an existing company.
  createTenantUser: (tenantId, payload) =>
    apiFetch(`/admin/tenants/${tenantId}/users`, { method: "POST", body: JSON.stringify(payload) }),
  updateTenant: (id, data) =>
    apiFetch(`/admin/tenants/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTenant: (id) =>
    apiFetch(`/admin/tenants/${id}`, { method: "DELETE" }),
  updateTenantFeatures: (id, flags) =>
    apiFetch(`/admin/tenants/${id}/features`, { method: "PUT", body: JSON.stringify(flags) }),
  users: (search) => apiFetch(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  updateUser: (id, data) =>
    apiFetch(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateUserRole: (id, role) =>
    apiFetch(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  systemHealth: () => apiFetch("/admin/system/health"),
};

export { apiFetch, BASE_URL };
