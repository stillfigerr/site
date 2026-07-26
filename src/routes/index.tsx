import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { siteQueryOptions } from "@/lib/site-data";
import { SiteLayout } from "@/components/site-layout";
import { ShowCard } from "@/components/show-card";
import { YouTubePlayer } from "@/components/youtube-player";
import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Infinite Corridor — Independent Show Production Label" },
      {
        name: "description",
        content:
          "Original series produced in-house by Infinite Corridor. Watch full episodes free, season by season.",
      },
      { property: "og:title", content: "Infinite Corridor — Show Production Label" },
      {
        property: "og:description",
        content: "Original series produced in-house. Watch full episodes free on the site.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(siteQueryOptions);
  const settings = data.settings;
  const featured = data.shows.find((show) => show.featured) ?? data.shows[0];
  const firstEpisode = featured?.seasons.flatMap((season) => season.episodes)[0];

  return (
    <SiteLayout footerNote={settings.footer_note}>
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:py-24">
          <div>
            <p className="label-mono text-signal">{settings.hero_kicker}</p>
            <h1 className="mt-4 text-4xl leading-[1.05] font-semibold md:text-6xl">
              {settings.hero_title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {settings.hero_subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="label-mono gap-2">
                <Link to="/shows">
                  {settings.hero_cta || "Watch the shows"} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="label-mono">
                <Link to="/contact">Work with us</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center border border-border bg-background p-8">
            <img
              src="/logo.jpg"
              alt="Infinite Corridor logo"
              width={640}
              height={416}
              className="w-full max-w-sm invert dark:invert-0"
            />
          </div>
        </div>
      </section>

      {featured && (
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label-mono text-muted-foreground">Now playing</p>
                <h2 className="mt-2 text-3xl font-semibold md:text-4xl">{featured.title}</h2>
                {featured.tagline && (
                  <p className="mt-2 max-w-xl text-muted-foreground">{featured.tagline}</p>
                )}
              </div>
              <Button asChild variant="secondary" className="label-mono">
                <Link to="/shows">All episodes</Link>
              </Button>
            </div>
            <div className="mt-8 border border-border">
              <YouTubePlayer
                url={firstEpisode?.youtube_url}
                title={firstEpisode ? `${featured.title} — ${firstEpisode.title}` : featured.title}
              />
            </div>
            {firstEpisode && (
              <p className="label-mono mt-4 text-muted-foreground">
                Ep {firstEpisode.number} · {firstEpisode.title}
                {firstEpisode.duration ? ` · ${firstEpisode.duration}` : ""}
              </p>
            )}
          </div>
        </section>
      )}

      {data.shows.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-20">
            <h2 className="text-3xl font-semibold md:text-4xl">{settings.shows_title}</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{settings.shows_intro}</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.shows.slice(0, 6).map((show) => (
                <ShowCard key={show.id} show={show} to="/shows" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-20">
          <h2 className="text-3xl font-semibold md:text-4xl">{settings.about_title}</h2>
          <RichText text={settings.about_body ?? ""} />
        </div>
      </section>
    </SiteLayout>
  );
}
