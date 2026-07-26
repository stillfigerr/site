import { supabase } from "@/integrations/supabase/client";
import type { Episode, Season, Show, SiteData } from "./site-types";

export async function fetchSiteData(): Promise<SiteData> {
  const [settingsRes, showsRes, seasonsRes, episodesRes] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("shows").select("*").order("sort_order").order("created_at"),
    supabase.from("seasons").select("*").order("number"),
    supabase.from("episodes").select("*").order("number"),
  ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRes.data ?? []) settings[row.key] = row.value;

  // Merge settings saved via file store (server-side admin writes)
  try {
    const { getSiteSettings } = await import("./site-store.server");
    Object.assign(settings, getSiteSettings());
  } catch {
    // Not running on server — file store not available
  }

  const episodes = (episodesRes.data ?? []) as Episode[];
  const seasons = ((seasonsRes.data ?? []) as Omit<Season, "episodes">[]).map((season) => ({
    ...season,
    episodes: episodes
      .filter((e) => e.season_id === season.id)
      .sort((a, b) => a.number - b.number),
  }));

  const shows = ((showsRes.data ?? []) as Omit<Show, "seasons">[]).map((show) => ({
    ...show,
    seasons: seasons.filter((s) => s.show_id === show.id).sort((a, b) => a.number - b.number),
  }));

  return { settings, shows };
}

export const siteQueryOptions = {
  queryKey: ["site-data"],
  queryFn: fetchSiteData,
};
