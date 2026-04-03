import { createDefaultStore, normalizeRequestRecord, orderRequests } from "./workspace-store.js";

export const SIDEBAR_COLLAPSED_WIDTH = 52;
export const SIDEBAR_MIN_WIDTH = 220;
export const SIDEBAR_REOPEN_WIDTH = 260;

export function parseCookies(headers) {
  const cookieHeader = Object.entries(headers).find(([key]) => key.toLowerCase() === "set-cookie");

  if (!cookieHeader) {
    return [];
  }

  return String(cookieHeader[1])
    .split(",")
    .map((cookie) => cookie.trim())
    .filter(Boolean);
}

export function clampSidebarWidth(value) {
  return Math.min(420, Math.max(SIDEBAR_MIN_WIDTH, value));
}

export function normalizeStore(store) {
  const fallback = createDefaultStore();
  const nextStore = store && typeof store === "object" ? store : fallback;
  const workspaces = Array.isArray(nextStore.workspaces)
    ? nextStore.workspaces.map((workspace) => ({
      ...workspace,
      requests: orderRequests((workspace.requests ?? []).map((request) => normalizeRequestRecord(request))),
      openRequestIds: Array.isArray(workspace.openRequestIds) ? workspace.openRequestIds : (workspace.requests ?? []).map((request) => request.id)
    }))
    : [];
  const activeWorkspace = workspaces.find((workspace) => workspace.id === nextStore.activeWorkspaceId) ?? workspaces[0] ?? null;
  const activeRequest = activeWorkspace?.requests?.find((request) => request.id === nextStore.activeRequestId && activeWorkspace.openRequestIds.includes(request.id)) ?? null;

  return {
    version: 1,
    sidebarTab: "requests",
    sidebarCollapsed: Boolean(nextStore.sidebarCollapsed),
    activeWorkspaceId: activeWorkspace?.id ?? "",
    activeRequestId: activeRequest?.id ?? "",
    sidebarWidth: clampSidebarWidth(Number(nextStore.sidebarWidth || fallback.sidebarWidth)),
    workspaces
  };
}
