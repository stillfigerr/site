import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { adminLock, adminStatus, adminUnlock } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminContextValue = {
  unlocked: boolean;
  openGate: () => void;
  lock: () => void;
  registerSecretClick: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

const SECRET_WORD = "corridor";

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const status = useServerFn(adminStatus);
  const unlockFn = useServerFn(adminUnlock);
  const lockFn = useServerFn(adminLock);

  const [gateOpen, setGateOpen] = useState(false);
  const [password, setPassword] = useState("");
  const clicks = useRef<number[]>([]);
  const typed = useRef("");

  const { data } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => status(),
    staleTime: 30_000,
  });
  const unlocked = data?.unlocked ?? false;

  const unlockMutation = useMutation({
    mutationFn: (value: string) => unlockFn({ data: { password: value } }),
    onSuccess: (result) => {
      if (result.ok) {
        setGateOpen(false);
        setPassword("");
        queryClient.invalidateQueries({ queryKey: ["admin-status"] });
        toast.success("Admin unlocked");
      } else {
        toast.error("Wrong password");
      }
    },
    onError: () => toast.error("Could not unlock right now"),
  });

  const lockMutation = useMutation({
    mutationFn: () => lockFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-status"] });
      toast.success("Admin locked");
    },
  });

  // Secret keyboard entry: type "corridor" anywhere, or press Ctrl/Cmd + Shift + K.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setGateOpen(true);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key.length !== 1) return;
      typed.current = (typed.current + event.key.toLowerCase()).slice(-SECRET_WORD.length);
      if (typed.current === SECRET_WORD) {
        typed.current = "";
        setGateOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({
      unlocked,
      openGate: () => setGateOpen(true),
      lock: () => lockMutation.mutate(),
      // Secret click entry: 5 taps on the footer infinity mark within 3 seconds.
      registerSecretClick: () => {
        const now = Date.now();
        clicks.current = [...clicks.current.filter((t) => now - t < 3000), now];
        if (clicks.current.length >= 5) {
          clicks.current = [];
          setGateOpen(true);
        }
      },
    }),
    [unlocked, lockMutation],
  );

  return (
    <AdminContext.Provider value={value}>
      {children}
      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Admin access
            </DialogTitle>
            <DialogDescription>Enter the label passcode to edit the site.</DialogDescription>
          </DialogHeader>
          {unlocked ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">You are already unlocked.</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  lockMutation.mutate();
                  setGateOpen(false);
                }}
              >
                Lock admin
              </Button>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (password.trim()) unlockMutation.mutate(password);
              }}
            >
              <Input
                type="password"
                autoFocus
                placeholder="Passcode"
                value={password}
                maxLength={200}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button type="submit" className="w-full" disabled={unlockMutation.isPending}>
                {unlockMutation.isPending ? "Checking…" : "Unlock"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminContext.Provider>
  );
}
