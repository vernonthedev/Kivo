import { openUrl } from "@tauri-apps/plugin-opener";

import { RequestPane } from "@/components/workspace/RequestPane.jsx";
import { ResponsePane } from "@/components/workspace/ResponsePane.jsx";
import { Sidebar } from "@/components/workspace/Sidebar.jsx";
import { ThemeToggle } from "@/components/workspace/ThemeToggle.jsx";
import { EmptyCanvas } from "@/components/workspace/EmptyCanvas.jsx";
import { AppHeader } from "@/components/workspace/AppHeader.jsx";
import { RequestTabs } from "@/components/workspace/RequestTabs.jsx";
import { SidebarResizer } from "@/components/workspace/SidebarResizer.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { getMethodTone } from "@/lib/http-ui.js";
import { useTheme } from "@/hooks/use-theme.js";
import { cn } from "@/lib/utils.js";
import { useWorkspaceStore } from "@/hooks/use-workspace-store.js";
import { SIDEBAR_COLLAPSED_WIDTH } from "@/lib/workspace-utils.js";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    store,
    isSending,
    starCount,
    resizeRef,
    activeWorkspace,
    activeRequest,
    requestTabs,
    response,
    SIDEBAR_MIN_WIDTH,
    SIDEBAR_REOPEN_WIDTH,
    handleSidebarTabChange,
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
    updateActiveRequest,
  } = useWorkspaceStore();

  const workspaceTitle = activeWorkspace?.name ?? "No workspace selected";
  const workspaceDescription = activeWorkspace?.description?.trim();
  const showEmptyCanvas = !activeWorkspace || !activeRequest;
  const sidebarWidth = store.sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : store.sidebarWidth;

  return (
    <div className="h-full overflow-hidden">
      <div className="flex h-full min-h-0 overflow-hidden border border-border/30 bg-card/35">
        <div style={{ width: `${sidebarWidth}px` }} className="min-h-0 shrink-0 overflow-hidden">
          <Sidebar
            iconSrc="/icon.ico"
            sidebarTab={store.sidebarTab}
            collapsed={store.sidebarCollapsed}
            workspaces={store.workspaces}
            activeWorkspaceId={store.activeWorkspaceId}
            activeRequestId={store.activeRequestId}
            onSidebarTabChange={handleSidebarTabChange}
            onSelectWorkspace={selectWorkspace}
            onSelectRequest={selectRequest}
            onCreateWorkspace={createWorkspaceRecord}
            onCreateRequest={createRequestRecord}
            onRenameWorkspace={renameWorkspaceRecord}
            onDeleteWorkspace={deleteWorkspaceRecord}
            onRenameRequest={renameRequestRecord}
            onDeleteRequest={deleteRequestRecord}
            onDuplicateRequest={duplicateRequestRecord}
            onTogglePinRequest={togglePinRequestRecord}
          />
        </div>

        <SidebarResizer
          onMouseDown={(event, ref) => {
            ref.current = { active: true, startX: event.clientX, startWidth: sidebarWidth };
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
        />

        <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden bg-card/20">
          <AppHeader
            workspaceTitle={workspaceTitle}
            workspaceDescription={workspaceDescription}
            starCount={starCount}
          />

          <RequestTabs
            requestTabs={requestTabs}
            activeWorkspaceId={store.activeWorkspaceId}
            activeRequestId={store.activeRequestId}
            selectRequest={selectRequest}
            closeRequestTab={closeRequestTab}
            createRequestRecord={createRequestRecord}
          />

          {showEmptyCanvas ? (
            <EmptyCanvas
              hasWorkspace={Boolean(activeWorkspace)}
              onCreateRequest={() => createRequestRecord(store.activeWorkspaceId)}
              onCreateWorkspace={() => createWorkspaceRecord({ name: "New Workspace", description: "" })}
            />
          ) : (
            <div className="grid min-h-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_1fr]">
              <RequestPane
                state={activeRequest}
                isSending={isSending}
                onSend={handleSend}
                onChange={handleRequestFieldChange}
                onTabChange={(tab) => updateActiveRequest((request) => ({ ...request, activeEditorTab: tab }))}
                onParamsChange={(queryParams) => updateActiveRequest((request) => ({ ...request, queryParams }))}
                onHeadersChange={(headers) => updateActiveRequest((request) => ({ ...request, headers }))}
                onAuthChange={(auth) => updateActiveRequest((request) => ({ ...request, auth }))}
              />
              <ResponsePane
                response={response}
                activeTab={activeRequest?.activeResponseTab ?? "Body"}
                onTabChange={(tab) => updateActiveRequest((request) => ({ ...request, activeResponseTab: tab }))}
                bodyView={activeRequest?.responseBodyView ?? "Raw"}
                onBodyViewChange={(view) => updateActiveRequest((request) => ({ ...request, responseBodyView: view }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
