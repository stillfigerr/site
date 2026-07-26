import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Infinity as InfinityIcon, Menu, Moon, Settings, Sun, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAdmin } from "@/components/admin-provider";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AnnouncementBar } from "@/components/announcement-bar";
import { siteQueryOptions } from "@/lib/site-data";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shows", label: "Shows" },
  { to: "/contact", label: "Contact" },
  { to: "/terms", label: "ToS" },
  { to: "/privacy", label: "Privacy" },
  { to: "/cookies", label: "Cookies" },
] as const;

export function SiteLayout({ children, footerNote }: { children: ReactNode; footerNote?: string }) {
  const { theme, toggle } = useTheme();
  const { unlocked, registerSecretClick, lock } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const { data: siteData } = useQuery(siteQueryOptions);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar raw={siteData?.settings?.announcement} />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center gap-4 px-4 md:px-8">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Infinite Corridor home">
            <img
              src="/logo.jpg"
              alt="Infinite Corridor"
              className="h-full max-h-20 w-auto py-1 invert dark:invert-0"
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "label-mono px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
                  pathname === item.to && "text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {unlocked && (
              <Button
                size="sm"
                variant="secondary"
                className="label-mono h-9 gap-2"
                onClick={() => setPanelOpen(true)}
              >
                <Settings className="h-4 w-4" /> Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle light and dark mode"
              onClick={toggle}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav className="grid gap-1 border-t border-border px-4 py-3 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "label-mono py-2 text-muted-foreground",
                  pathname === item.to && "text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={registerSecretClick}
              aria-label="Infinite Corridor mark"
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              <InfinityIcon className="h-6 w-6" />
            </button>
            <p className="max-w-md text-sm text-muted-foreground">
              {footerNote ?? "Infinite Corridor™"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {NAV.slice(3).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="label-mono text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            {unlocked && (
              <button className="label-mono text-muted-foreground hover:text-foreground" onClick={lock}>
                Lock
              </button>
            )}
          </div>
        </div>
      </footer>

      {unlocked && <AdminPanel open={panelOpen} onOpenChange={setPanelOpen} />}
    </div>
  );
}
