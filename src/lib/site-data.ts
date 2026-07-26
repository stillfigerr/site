import { createServerFn } from "@tanstack/react-start";
import type { Episode, Season, Show, SiteData } from "./site-types";
import type { StoredShow, StoredSeason, StoredEpisode } from "./site-store.server";

export const fetchSiteData = createServerFn({ method: "GET" }).handler(async (): Promise<SiteData> => {
  const { supabase } = await import("@/integrations/supabase/client");
  const { getSiteSettings, getLocalShows } = await import("./site-store.server");

  // Fetch Supabase data (read-only — writes go to file store)
  const [settingsRes, showsRes, seasonsRes, episodesRes] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("shows").select("*").order("sort_order").order("created_at"),
    supabase.from("seasons").select("*").order("number"),
    supabase.from("episodes").select("*").order("number"),
  ]);

  // Settings: Supabase base + file store overlay
  const settings: Record<string, string> = {};
  for (const row of settingsRes.data ?? []) settings[row.key] = row.value;
  Object.assign(settings, getSiteSettings());

  // Shows: Supabase base + file store overlay (local shows take precedence)
  const supabaseShows = (showsRes.data ?? []) as Omit<Show, "seasons">[];
  const supabaseSeasons = (seasonsRes.data ?? []) as Omit<Season, "episodes">[];
  const supabaseEpisodes = (episodesRes.data ?? []) as Episode[];

  // Build Supabase shows with nested seasons/episodes
  const shows: Show[] = supabaseShows.map((show) => ({
    ...show,
    seasons: supabaseSeasons
      .filter((s) => s.show_id === show.id)
      .map((season) => ({
        ...season,
        episodes: supabaseEpisodes
          .filter((e) => e.season_id === season.id)
          .sort((a, b) => a.number - b.number),
      }))
      .sort((a, b) => a.number - b.number),
  }));

  // Overlay local shows (admin writes) — merge or replace by id
  const localShows = getLocalShows();
  for (const local of localShows) {
    const existingIdx = shows.findIndex((s) => s.id === local.id);
    const seasons: Season[] = local.seasons.map((ls: StoredSeason) => ({
      id: ls.id,
      show_id: ls.show_id,
      number: ls.number,
      title: ls.title,
      sort_order: ls.number,
      episodes: ls.episodes.map((le: StoredEpisode) => ({
        id: le.id,
        season_id: le.season_id,
        number: le.number,
        title: le.title,
        description: le.description,
        youtube_url: le.youtube_url,
        duration: le.duration,
        sort_order: le.number,
      })),
    }));

    const showEntry: Show = {
      id: local.id,
      title: local.title,
      tagline: local.tagline,
      description: local.description,
      icon_url: local.icon_url,
      status: local.status,
      featured: local.featured,
      sort_order: local.sort_order,
      seasons,
    };

    if (existingIdx >= 0) {
      shows[existingIdx] = showEntry;
    } else {
      shows.push(showEntry);
    }
  }

  // Sort shows by sort_order then title
  shows.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.title.localeCompare(b.title));

  return { settings, shows };
});

export const siteQueryOptions = {
  queryKey: ["site-data"],
  queryFn: () => fetchSiteData(),
  staleTime: 30_000,
};