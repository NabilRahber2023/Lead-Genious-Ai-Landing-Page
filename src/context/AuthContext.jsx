
import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, getToken, UNAUTHORIZED_EVENT } from "@/lib/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Single source of truth for what each role may do on the frontend. The backend
// enforces the same rules independently — this only drives showing/hiding UI.
const PERMISSIONS = {
  viewLeads:       ["owner", "manager", "marketing", "sales", "readonly"],
  createLeads:     ["owner", "manager", "marketing", "sales"],
  editLeads:       ["owner", "manager", "marketing", "sales"],
  deleteLeads:     ["owner", "manager", "sales"],
  logInteraction:  ["owner", "manager", "sales"],
  viewCampaigns:   ["owner", "manager", "marketing", "sales", "readonly"],
  manageCampaigns: ["owner", "manager", "marketing"],
  viewAgents:      ["owner", "manager", "marketing", "sales", "readonly"],
  runAgents:       ["manager", "marketing", "sales"],     // owner governs agents, team runs them
  toggleAgents:    ["owner", "manager"],
  viewSettings:    ["owner", "manager"],
  editSettings:    ["owner"],
  manageTeam:      ["owner"],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On load, if we have a token, fetch the current user to validate the session.
  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          setUser(await authApi.me());
        } catch {
          authApi.logout();
        }
      }
      setLoading(false);
    })();
  }, []);

  // When any API call comes back 401 (expired/invalid token), sign out so the
  // app cleanly returns to the login screen instead of erroring on every action.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = async (email, password) => {
    await authApi.login(email, password);
    setUser(await authApi.me());
  };

  // Role-card sign-in (email + password + optional company domain).
  const signIn = async ({ email, password, domain }) => {
    await authApi.roleLogin({ email, password, domain });
    setUser(await authApi.me());
  };

  const register = async (payload) => {
    await authApi.register(payload);
    setUser(await authApi.me());
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const role = user?.role ?? null;
  const can = (action) => PERMISSIONS[action]?.includes(role) ?? false;

  // Per-tenant feature flags set by the super admin. `null`/`undefined` means
  // all features are enabled (backward-compatible default for older tenants).
  const featureFlags = user?.feature_flags ?? null;

  // True if a module is enabled for this tenant. Pass the bare feature name
  // (e.g. "leads", "ai_agents"); the "_enabled" suffix is added here.
  const featureEnabled = (featureKey) => {
    if (!featureFlags) return true;          // no flags set → everything on
    return featureFlags[`${featureKey}_enabled`] !== false; // missing key → on
  };

  // AI agents the platform super admin has switched off for this tenant. These
  // appear as "Unavailable" and can't be run or toggled by the tenant's users.
  const disabledAgents = featureFlags?.disabled_agents ?? [];
  const agentDisabled = (agentKey) => disabledAgents.includes(agentKey);

  // Per-role module overrides set by the super admin, e.g.
  // { sales: { reports: false } }. `null` means no overrides (everything the
  // role normally sees stays visible). Used by Header to filter nav per role.
  const roleAccess = featureFlags?.role_access ?? null;

  // True if a nav module (by its nav id: leads/campaigns/agents/reports/team/
  // settings) is allowed for the current role in this tenant. Defaults to on.
  const roleCanAccess = (moduleId) => {
    const overrides = roleAccess?.[role];
    if (!overrides) return true;
    return overrides[moduleId] !== false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signIn,
        register,
        logout,
        role,
        can,
        featureFlags,
        featureEnabled,
        disabledAgents,
        agentDisabled,
        roleAccess,
        roleCanAccess,
        isSuperAdmin: role === "super_admin",
        isAdmin: role === "owner",
        isUser: ["manager", "marketing", "sales", "readonly"].includes(role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
