import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { siteQueryOptions } from "@/lib/site-data";
import { SiteLayout } from "@/components/site-layout";
import { YouTubePlayer } from "@/components/youtube-player";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shows")({
  head: () => ({
    meta: [
      { title: "Shows — Infinite Corridor" },
      {
        name: "description",
        content:
          "Browse every Infinite Corridor series by season and stream full episodes directly on the site.",
      },
      { property: "og:title", content: "Shows — Infinite Corridor" },
      {
        property: "og:description",
        content: "Browse every series by season and stream full episodes on the site.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions),
  component: Shows,
});

function Shows() {
  const { data } = useSuspenseQuery(siteQueryOptions);
  const shows = data.shows;
  const [showId, setShowId] = useState<string | null>(shows[0]?.id ?? null);
  const activeShow = shows.find((show) => show.id === showId) ?? shows[0];
  const [seasonId, setSeasonId] = useState<string | null>(activeShow?.seasons[0]?.id ?? null);
  const activeSeason = activeShow?.seasons.find((s) => s.id === seasonId) ?? activeShow?.seasons[0];
  const [episodeId, setEpisodeId] = useState<string | null>(activeSeason?.episodes[0]?.id ?? null);
  const activeEpisode =
    activeSeason?.episodes.find((e) => e.id === episodeId) ?? activeSeason?.episodes[0];

  useEffect(() => {
    setSeasonId(activeShow?.seasons[0]?.id ?? null);
  }, [activeShow?.id]);

  useEffect(() => {
    setEpisodeId(activeSeason?.episodes[0]?.id ?? null);
  }, [activeSeason?.id]);

  return (
    <SiteLayout footerNote={data.settings.footer_note}>
      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-8 md:py-20">
        <p className="label-mono text-signal">Catalogue</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
          {data.settings.shows_title ?? "Our shows"}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{data.settings.shows_intro}</p>

        {shows.length === 0 ? (
          <p className="mt-12 border border-dashed border-border p-10 text-center text-muted-foreground">
            No shows published yet. Check back soon.
          </p>
        ) : (
          <div className="mt-10 space-y-8">
            <div className="flex flex-wrap gap-2">
              {shows.map((show) => (
                <Button
                  key={show.id}
                  variant={show.id === activeShow?.id ? "default" : "outline"}
                  className="label-mono"
                  onClick={() => setShowId(show.id)}
                >
                  {show.title}
                </Button>
              ))}
            </div>

            {activeShow && (
              <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-4">
                  <div className="border border-border">
                    <YouTubePlayer
                      url={activeEpisode?.youtube_url}
                      title={
                        activeEpisode
                          ? `${activeShow.title} — ${activeEpisode.title}`
                          : activeShow.title
                      }
                    />
                  </div>
                  {activeEpisode ? (
                    <div>
                      <p className="label-mono text-muted-foreground">
                        Season {activeSeason?.number} · Episode {activeEpisode.number}
                        {activeEpisode.duration ? ` · ${activeEpisode.duration}` : ""}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold">{activeEpisode.title}</h2>
                      {activeEpisode.description && (
                        <p className="mt-2 text-muted-foreground">{activeEpisode.description}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No episodes in this season yet.</p>
                  )}
                  {activeShow.description && (
                    <div className="border-t border-border pt-4">
                      <p className="label-mono text-muted-foreground">About the show</p>
                      <p className="mt-2 text-muted-foreground">{activeShow.description}</p>
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {activeShow.seasons.map((season) => (
                      <button
                        key={season.id}
                        onClick={() => setSeasonId(season.id)}
                        className={cn(
                          "label-mono border border-border px-3 py-2 transition-colors",
                          season.id === activeSeason?.id
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        S{season.number}
                      </button>
                    ))}
                  </div>
                  <ul className="divide-y divide-border border border-border">
                    {(activeSeason?.episodes ?? []).map((episode) => (
                      <li key={episode.id}>
                        <button
                          onClick={() => setEpisodeId(episode.id)}
                          className={cn(
                            "flex w-full items-baseline gap-3 p-4 text-left transition-colors hover:bg-surface",
                            episode.id === activeEpisode?.id && "bg-surface",
                          )}
                        >
                          <span className="label-mono text-signal">
                            {String(episode.number).padStart(2, "0")}
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-medium">{episode.title}</span>
                            {episode.duration && (
                              <span className="label-mono text-muted-foreground">
                                {episode.duration}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                    {(activeSeason?.episodes.length ?? 0) === 0 && (
                      <li className="p-4 text-sm text-muted-foreground">No episodes yet.</li>
                    )}
                  </ul>
                </aside>
              </div>
            )}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
