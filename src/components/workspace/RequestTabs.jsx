import { PinIcon, PlusSignIcon, Cancel01Icon } from "hugeicons-react";

import { cn } from "@/lib/utils.js";
import { getMethodTone } from "@/lib/http-ui.js";

export function RequestTabs({
  requestTabs,
  activeWorkspaceName,
  activeCollectionName,
  activeRequestName,
  selectRequest,
  closeRequestTab,
  createRequestRecord,
}) {
  return (
    <div role="tablist" className="tabs tabs-bordered flex h-full items-stretch overflow-x-auto border-b border-border/30 bg-card/28 px-1 thin-scrollbar lg:h-[44px]">
      {requestTabs.map((request) => (
        <button
          key={request.name}
          role="tab"
          type="button"
          onClick={() => selectRequest(activeWorkspaceName, activeCollectionName, request.name)}
          className={cn(
            "tab h-full group relative flex min-w-[140px] items-center gap-2 border-r border-border/25 px-3 text-[12px] transition-colors lg:text-[13px]",
            request.name === activeRequestName
              ? "tab-active bg-primary/5 text-foreground border-b-primary"
              : "text-muted-foreground hover:bg-card/45 hover:text-foreground border-b-transparent"
          )}
        >
          <span className={cn("px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] lg:text-[10px] rounded-sm", getMethodTone(request.method))}>{request.method}</span>
          {request.pinned ? <PinIcon className="h-3 w-3 shrink-0 text-primary" /> : null}
          <span className={cn("truncate max-w-[80px]", request.name === activeRequestName && "font-semibold")}>{request.name}</span>
          <span
            className="ml-auto p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              closeRequestTab(request.name);
            }}
          >
            <Cancel01Icon className="h-3 w-3" />
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => createRequestRecord(activeWorkspaceName, activeCollectionName)}
        className={cn(
          "flex w-10 items-center justify-center text-muted-foreground hover:bg-card/45 hover:text-foreground transition-opacity",
          !activeWorkspaceName && "opacity-0 pointer-events-none"
        )}
        title="New Request"
      >
        <PlusSignIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
