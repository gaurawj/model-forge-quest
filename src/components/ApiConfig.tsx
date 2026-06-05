import { useState } from "react";
import { useApiConfigStore } from "@/stores/apiConfig";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plug, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ApiConfig() {
  const { baseUrl, status, mixedContentBlocked, mixedContentReason, setBaseUrl, testConnection } =
    useApiConfigStore();
  const [draft, setDraft] = useState(baseUrl);
  const [open, setOpen] = useState(false);

  const handleConnect = async () => {
    setBaseUrl(draft);
    await testConnection();
  };

  const dotClass =
    status === "connected"
      ? "bg-emerald-500"
      : status === "connecting"
      ? "bg-amber-500 animate-pulse"
      : status === "error"
      ? "bg-destructive"
      : "bg-muted-foreground/50";

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(baseUrl); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          <Plug className="h-3.5 w-3.5" />
          API
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold">API configuration</div>
            <p className="text-xs text-muted-foreground">
              Base URL for the recommendation backend.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Base URL</Label>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="http://localhost:8000"
              className="h-9 bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleConnect} disabled={status === "connecting"}>
              {status === "connecting" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Connecting…
                </>
              ) : (
                "Connect & test"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft("http://localhost:8000");
              }}
            >
              Reset
            </Button>
          </div>
          {status === "connected" && (
            <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5" />
              <span>Connected — endpoints reachable.</span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
              <span>Connection failed. Check the URL and CORS settings.</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
