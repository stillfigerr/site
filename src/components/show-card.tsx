import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";
import type { Show } from "@/lib/site-types";
import { cn } from "@/lib/utils";

export function ShowCard({ show, to }: { show: Show; to?: string }) {
  const episodeCount = show.seasons.reduce((total, season) => total + season.episodes.length, 0);

  const content = (
    <div className="group flex h-full flex-col border border-border bg-card transition-colors hover:border-foreground/40">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        {show.icon_url ? (
          <img
            src={show.icon_url}
            alt={`${show.title} artwork`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Film className="h-8 w-8" />
          </div>
        )}
        <span className="label-mono absolute left-3 top-3 bg-signal px-2 py-1 text-signal-foreground">
          {show.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold">{show.title}</h3>
        {show.tagline && <p className="text-sm text-muted-foreground">{show.tagline}</p>}
        <p className="label-mono mt-auto pt-3 text-muted-foreground">
          {show.seasons.length} season{show.seasons.length === 1 ? "" : "s"} · {episodeCount} ep
          {episodeCount === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );

  if (!to) return content;
  return (
    <Link to={to} className={cn("block h-full")}>
      {content}
    </Link>
  );
}
