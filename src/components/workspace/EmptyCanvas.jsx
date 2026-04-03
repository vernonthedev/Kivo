import { Button } from "@/components/ui/button.jsx";

export function EmptyCanvas({ hasWorkspace, onCreateRequest, onCreateWorkspace }) {
  return (
    <div className="grid min-h-0 place-items-center bg-card/20 p-6">
      <div className="max-w-[420px] text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {hasWorkspace ? "No requests yet" : "No workspace yet"}
        </div>
        <h2 className="mt-3 text-[20px] font-semibold tracking-tight text-foreground lg:text-[24px]">
          {hasWorkspace ? "Create your first request in this workspace" : "Create a workspace to get started"}
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground lg:text-[14px]">
          {hasWorkspace
            ? "Kivo is ready, but this workspace is empty right now. Add a request from the sidebar or here."
            : "Start with your own workspace and build it the way you want."}
        </p>
        <div className="mt-5">
          {hasWorkspace ? (
            <Button type="button" className="h-9 px-4 text-[12px] lg:h-10 lg:px-5 lg:text-[13px]" onClick={onCreateRequest}>
              New request
            </Button>
          ) : (
            <Button type="button" className="h-9 px-4 text-[12px] lg:h-10 lg:px-5 lg:text-[13px]" onClick={onCreateWorkspace}>
              Create workspace
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}