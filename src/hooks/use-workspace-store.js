import { useEffect, useMemo, useRef, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { loadAppState, saveAppState, sendHttpRequest } from "@/lib/http-client.js";
import { buildRequestPayload, buildUrlWithParams, serializeHeaders } from "@/lib/http-ui.js";
import {
  cloneRequest,
  createDefaultStore,
  createEmptyResponse,
  createId,
  createRequest,
  createWorkspace,
  formatSavedAt,
  getActiveRequest,
  getActiveWorkspace,
  normalizeRequestRecord,
  orderRequests
} from "@/lib/workspace-store.js";
import { clampSidebarWidth, normalizeStore, parseCookies } from "@/lib/workspace-utils.js";
import { formatResponseBody, isJsonText } from "@/lib/formatters.js";

const SIDEBAR_COLLAPSED_WIDTH = 52;
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_REOPEN_WIDTH = 260;

export function useWorkspaceStore() {
  const [store, setStore] = useState(createDefaultStore());
  const [isSending, setIsSending] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [starCount, setStarCount] = useState(null);
  const saveTimerRef = useRef(null);
  const resizeRef = useRef({ active: false, startX: 0, startWidth: 304 });

  const activeWorkspace = useMemo(() => getActiveWorkspace(store), [store]);
  const activeRequest = useMemo(() => getActiveRequest(store), [store]);
  const requestTabs = useMemo(() => {
    if (!activeWorkspace) {
      return [];
    }

    const openIds = new Set(activeWorkspace.openRequestIds || []);
    return activeWorkspace.requests.filter((request) => openIds.has(request.id));
  }, [activeWorkspace]);
  const response = activeRequest?.lastResponse ?? createEmptyResponse();

  useEffect(() => {
    async function fetchStars() {
      try {
        const res = await fetch("https://api.github.com/repos/dexter-xD/Kivo");
        const data = await res.json();
        if (data.stargazers_count !== undefined) {
          setStarCount(data.stargazers_count);
        }
      } catch (error) {
        console.error("Failed to fetch star count:", error);
      }
    }

    fetchStars();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const persisted = await loadAppState();

        if (!cancelled) {
          setStore(normalizeStore(persisted));
        }
      } catch {
        if (!cancelled) {
          setStore(createDefaultStore());
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleMove(event) {
      if (!resizeRef.current.active) {
        return;
      }

      const rawWidth = resizeRef.current.startWidth + (event.clientX - resizeRef.current.startX);

      setStore((current) => {
        if (rawWidth <= SIDEBAR_MIN_WIDTH) {
          return {
            ...current,
            sidebarCollapsed: true,
            sidebarWidth: Math.max(current.sidebarWidth, SIDEBAR_REOPEN_WIDTH)
          };
        }

        return {
          ...current,
          sidebarCollapsed: false,
          sidebarWidth: clampSidebarWidth(rawWidth)
        };
      });
    }

    function handleUp() {
      resizeRef.current.active = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return undefined;
    }

    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveAppState(store).catch(() => { });
    }, 300);

    return () => {
      window.clearTimeout(saveTimerRef.current);
    };
  }, [isHydrated, store]);

  function updateStore(updater) {
    setStore((current) => normalizeStore(typeof updater === "function" ? updater(current) : updater));
  }

  function handleSidebarTabChange(sidebarTab) {
    updateStore((current) => ({
      ...current,
      sidebarTab,
      sidebarCollapsed: false,
      sidebarWidth: clampSidebarWidth(Math.max(current.sidebarWidth, SIDEBAR_REOPEN_WIDTH))
    }));
  }

  function updateActiveRequest(updater) {
    updateStore((current) => ({
      ...current,
      workspaces: current.workspaces.map((workspace) => {
        if (workspace.id !== current.activeWorkspaceId) {
          return workspace;
        }

        return {
          ...workspace,
          requests: workspace.requests.map((request) => {
            if (request.id !== current.activeRequestId) {
              return request;
            }

            return typeof updater === "function" ? updater(request) : { ...request, ...updater };
          })
        };
      })
    }));
  }

  function handleRequestFieldChange(field, value) {
    updateActiveRequest((request) => ({ ...request, [field]: value }));
  }

  function createWorkspaceRecord(values) {
    const workspace = createWorkspace(values.name, values.description);

    updateStore((current) => ({
      ...current,
      activeWorkspaceId: workspace.id,
      activeRequestId: "",
      sidebarTab: "requests",
      workspaces: [...current.workspaces, workspace]
    }));
  }

  function renameWorkspaceRecord(workspaceId, values) {
    updateStore((current) => ({
      ...current,
      workspaces: current.workspaces.map((workspace) =>
        workspace.id === workspaceId ? { ...workspace, name: values.name, description: values.description } : workspace
      )
    }));
  }

  function deleteWorkspaceRecord(workspaceId) {
    updateStore((current) => {
      const nextWorkspaces = current.workspaces.filter((workspace) => workspace.id !== workspaceId);
      const nextWorkspace = nextWorkspaces.find((workspace) => workspace.id === current.activeWorkspaceId && workspace.id !== workspaceId) ?? nextWorkspaces[0] ?? null;
      const nextRequest = nextWorkspace?.requests?.[0] ?? null;

      return {
        ...current,
        activeWorkspaceId: nextWorkspace?.id ?? "",
        activeRequestId: nextRequest?.id ?? "",
        workspaces: nextWorkspaces
      };
    });
  }

  function createRequestRecord(workspaceId) {
    if (!workspaceId) {
      return;
    }

    const nextRequest = createRequest();

    updateStore((current) => ({
      ...current,
      activeWorkspaceId: workspaceId,
      activeRequestId: nextRequest.id,
      sidebarTab: "requests",
      workspaces: current.workspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
            ...workspace,
            requests: orderRequests([...workspace.requests, nextRequest]),
            openRequestIds: [...(Array.isArray(workspace.openRequestIds) ? workspace.openRequestIds : []), nextRequest.id]
          }
          : workspace
      )
    }));
  }

  function duplicateRequestRecord(workspaceId, requestId) {
    updateStore((current) => {
      let duplicatedRequestId = current.activeRequestId;

      const nextWorkspaces = current.workspaces.map((workspace) => {
        if (workspace.id !== workspaceId) {
          return workspace;
        }

        const sourceRequest = workspace.requests.find((request) => request.id === requestId);

        if (!sourceRequest) {
          return workspace;
        }

        const duplicated = cloneRequest(sourceRequest);
        duplicatedRequestId = duplicated.id;

        return {
          ...workspace,
          requests: orderRequests([...workspace.requests, duplicated]),
          openRequestIds: [...(Array.isArray(workspace.openRequestIds) ? workspace.openRequestIds : []), duplicated.id]
        };
      });

      return {
        ...current,
        activeWorkspaceId: workspaceId,
        activeRequestId: duplicatedRequestId,
        workspaces: nextWorkspaces
      };
    });
  }

  function renameRequestRecord(workspaceId, requestId, name) {
    updateStore((current) => ({
      ...current,
      workspaces: current.workspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
            ...workspace,
            requests: workspace.requests.map((request) =>
              request.id === requestId ? { ...request, name } : request
            ),
            history: workspace.history.map((entry) =>
              entry.requestId === requestId ? { ...entry, requestName: name } : entry
            )
          }
          : workspace
      )
    }));
  }

  function deleteRequestRecord(workspaceId, requestId) {
    updateStore((current) => {
      let nextActiveRequestId = current.activeRequestId;

      const nextWorkspaces = current.workspaces.map((workspace) => {
        if (workspace.id !== workspaceId) {
          return workspace;
        }

        const nextRequests = workspace.requests.filter((request) => request.id !== requestId);
        const nextOpenIds = (workspace.openRequestIds || []).filter((id) => id !== requestId);

        if (current.activeRequestId === requestId) {
          nextActiveRequestId = nextOpenIds[0] ?? "";
        }

        return {
          ...workspace,
          requests: nextRequests,
          openRequestIds: nextOpenIds,
          history: workspace.history.filter((entry) => entry.requestId !== requestId)
        };
      });

      return {
        ...current,
        activeWorkspaceId: workspaceId,
        activeRequestId: nextActiveRequestId,
        workspaces: nextWorkspaces
      };
    });
  }

  function selectWorkspace(workspaceId) {
    updateStore((current) => {
      const workspace = current.workspaces.find((item) => item.id === workspaceId) ?? current.workspaces[0] ?? null;
      const firstRequest = workspace?.requests?.[0] ?? null;
      const openIds = workspace?.openRequestIds || [];
      const nextOpenIds = firstRequest && !openIds.includes(firstRequest.id) ? [...openIds, firstRequest.id] : openIds;

      return {
        ...current,
        activeWorkspaceId: workspace?.id ?? "",
        activeRequestId: firstRequest?.id ?? "",
        sidebarTab: "requests",
        workspaces: current.workspaces.map((ws) =>
          ws.id === workspace?.id ? { ...ws, openRequestIds: nextOpenIds } : ws
        )
      };
    });
  }

  function selectRequest(workspaceId, requestId) {
    updateStore((current) => ({
      ...current,
      activeWorkspaceId: workspaceId,
      activeRequestId: requestId,
      sidebarTab: "requests",
      workspaces: current.workspaces.map((workspace) => {
        if (workspace.id !== workspaceId) {
          return workspace;
        }

        const openIds = Array.isArray(workspace.openRequestIds) ? workspace.openRequestIds : [];

        if (openIds.includes(requestId)) {
          return workspace;
        }

        return {
          ...workspace,
          openRequestIds: [...openIds, requestId]
        };
      })
    }));
  }

  function togglePinRequestRecord(workspaceId, requestId) {
    updateStore((current) => ({
      ...current,
      activeWorkspaceId: workspaceId,
      activeRequestId: requestId,
      sidebarTab: "requests",
      workspaces: current.workspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
            ...workspace,
            requests: orderRequests(
              workspace.requests.map((request) =>
                request.id === requestId ? { ...request, pinned: !request.pinned } : request
              )
            )
          }
          : workspace
      )
    }));
  }

  function closeRequestTab(requestId) {
    if (!activeWorkspace) {
      return;
    }

    updateStore((current) => {
      let nextActiveRequestId = current.activeRequestId;

      const nextWorkspaces = current.workspaces.map((workspace) => {
        if (workspace.id !== activeWorkspace.id) {
          return workspace;
        }

        const nextOpenIds = (workspace.openRequestIds || []).filter((id) => id !== requestId);

        if (current.activeRequestId === requestId) {
          nextActiveRequestId = nextOpenIds[0] ?? "";
        }

        return {
          ...workspace,
          openRequestIds: nextOpenIds
        };
      });

      return {
        ...current,
        activeRequestId: nextActiveRequestId,
        workspaces: nextWorkspaces
      };
    });
  }

  async function handleSend() {
    if (!activeRequest) {
      console.warn("No active request to send");
      return;
    }

    let finalUrl = "";
    try {
      finalUrl = buildUrlWithParams(activeRequest.url, activeRequest.queryParams);
    } catch (error) {
      console.error("Failed to build URL:", error);
    }

    if (!finalUrl) {
      console.warn("No URL provided or URL is invalid");
      return;
    }

    setIsSending(true);

    try {
      const requestPayload = buildRequestPayload(activeRequest);
      const result = await sendHttpRequest(requestPayload);

      const rawBody = result.body || "";
      const formattedBody = formatResponseBody(rawBody);
      const bodySize = new TextEncoder().encode(rawBody).length;
      const responseIsJson = isJsonText(rawBody);
      const savedAt = formatSavedAt();
      const savedResponse = {
        status: result.status,
        badge: `${result.status} ${result.statusText}`,
        statusText: `${result.status} ${result.statusText}`,
        duration: `${result.durationMs} ms`,
        size: `${bodySize} B`,
        headers: result.headers,
        cookies: parseCookies(result.headers),
        body: formattedBody,
        rawBody,
        isJson: responseIsJson,
        meta: {
          url: finalUrl,
          method: activeRequest.method
        },
        savedAt
      };

      updateStore((current) => ({
        ...current,
        workspaces: current.workspaces.map((workspace) => {
          if (workspace.id !== current.activeWorkspaceId) {
            return workspace;
          }

          return {
            ...workspace,
            requests: workspace.requests.map((request) =>
              request.id === activeRequest.id
                ? {
                  ...request,
                  url: normalizeUrl(request.url),
                  responseBodyView: responseIsJson ? "JSON" : "Raw",
                  lastResponse: savedResponse
                }
                : request
            )
          };
        })
      }));
    } catch (error) {
      const message = error?.toString?.() || "Request failed";
      const savedAt = formatSavedAt();
      const requestHeaders = serializeHeaders(activeRequest.headers, activeRequest.auth, activeRequest.bodyType);
      const savedResponse = {
        status: 500,
        badge: "Failed",
        statusText: "Request failed",
        duration: "-",
        size: "0 B",
        headers: {},
        cookies: [],
        body: message,
        rawBody: message,
        isJson: false,
        meta: {
          url: finalUrl,
          method: activeRequest.method
        },
        savedAt
      };

      updateStore((current) => ({
        ...current,
        workspaces: current.workspaces.map((workspace) => {
          if (workspace.id !== current.activeWorkspaceId) {
            return workspace;
          }

          return {
            ...workspace,
            requests: workspace.requests.map((request) =>
              request.id === activeRequest.id
                ? { ...request, responseBodyView: "Raw", lastResponse: savedResponse }
                : request
            )
          };
        })
      }));
    } finally {
      setIsSending(false);
    }
  }

  return {
    store,
    isSending,
    isHydrated,
    starCount,
    saveTimerRef,
    resizeRef,
    activeWorkspace,
    activeRequest,
    requestTabs,
    response,
    SIDEBAR_COLLAPSED_WIDTH,
    SIDEBAR_MIN_WIDTH,
    SIDEBAR_REOPEN_WIDTH,
    updateStore,
    handleSidebarTabChange,
    updateActiveRequest,
    handleRequestFieldChange,
    createWorkspaceRecord,
    renameWorkspaceRecord,
    deleteWorkspaceRecord,
    createRequestRecord,
    duplicateRequestRecord,
    renameRequestRecord,
    deleteRequestRecord,
    selectWorkspace,
    selectRequest,
    togglePinRequestRecord,
    closeRequestTab,
    handleSend,
  };
}
