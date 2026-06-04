import { Construction } from "lucide-react";

export function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
        <Construction className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Coming next. This tab will ship in the next stage of the build.
      </p>
    </div>
  );
}
