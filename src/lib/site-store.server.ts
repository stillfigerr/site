import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), ".data");
const SETTINGS_PATH = join(DATA_DIR, "settings.json");

export interface StoredShow {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  icon_url: string | null;
  status: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  seasons: StoredSeason[];
}

export interface StoredSeason {
  id: string;
  show_id: string;
  number: number;
  title: string | null;
  episodes: StoredEpisode[];
}

export interface StoredEpisode {
  id: string;
  season_id: string;
  number: number;
  title: string;
  description: string | null;
  youtube_url: string | null;
  duration: string | null;
}

interface Store {
  settings: Record<string, string>;
  shows: StoredShow[];
}

function readStore(): Store {
  try {
    if (!existsSync(SETTINGS_PATH)) return { settings: {}, shows: [] };
    const raw = readFileSync(SETTINGS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return { settings: parsed.settings ?? {}, shows: parsed.shows ?? [] };
  } catch {
    return { settings: {}, shows: [] };
  }
}

function writeStore(store: Store): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(SETTINGS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

// ---- Settings ----

export function getSiteSettings(): Record<string, string> {
  return readStore().settings;
}

export function saveSiteSettings(entries: { key: string; value: string }[]) {
  const store = readStore();
  for (const { key, value } of entries) {
    store.settings[key] = value;
  }
  writeStore(store);
  return { ok: true as const };
}

// ---- Shows ----

export function getLocalShows(): StoredShow[] {
  return readStore().shows;
}

export function saveLocalShow(input: {
  id?: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  icon_url?: string | null;
  status?: string;
  featured?: boolean;
  sort_order?: number;
}) {
  const store = readStore();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = store.shows.findIndex((s) => s.id === input.id);
    if (idx === -1) throw new Error("Show not found");
    store.shows[idx] = {
      ...store.shows[idx],
      title: input.title,
      tagline: input.tagline ?? null,
      description: input.description ?? null,
      icon_url: input.icon_url ?? null,
      status: input.status ?? "Streaming now",
      featured: input.featured ?? false,
      sort_order: input.sort_order ?? 0,
    };
    writeStore(store);
    return { ok: true as const, id: input.id };
  }
  const id = randomUUID();
  store.shows.push({
    id,
    title: input.title,
    tagline: input.tagline ?? null,
    description: input.description ?? null,
    icon_url: input.icon_url ?? null,
    status: input.status ?? "Streaming now",
    featured: input.featured ?? false,
    sort_order: input.sort_order ?? 0,
    created_at: now,
    seasons: [],
  });
  writeStore(store);
  return { ok: true as const, id };
}

export function deleteLocalRow(table: "shows" | "seasons" | "episodes", id: string) {
  const store = readStore();
  if (table === "shows") {
    store.shows = store.shows.filter((s) => s.id !== id);
  } else if (table === "seasons") {
    for (const show of store.shows) {
      show.seasons = show.seasons.filter((s) => s.id !== id);
    }
  } else if (table === "episodes") {
    for (const show of store.shows) {
      for (const season of show.seasons) {
        season.episodes = season.episodes.filter((e) => e.id !== id);
      }
    }
  }
  writeStore(store);
  return { ok: true as const };
}

export function saveLocalSeason(input: {
  id?: string;
  show_id: string;
  number: number;
  title?: string | null;
}) {
  const store = readStore();
  if (input.id) {
    for (const show of store.shows) {
      const idx = show.seasons.findIndex((s) => s.id === input.id);
      if (idx !== -1) {
        show.seasons[idx] = {
          ...show.seasons[idx],
          number: input.number,
          title: input.title ?? null,
        };
        writeStore(store);
        return { ok: true as const, id: input.id };
      }
    }
    throw new Error("Season not found");
  }
  const id = randomUUID();
  const show = store.shows.find((s) => s.id === input.show_id);
  if (!show) throw new Error("Show not found");
  show.seasons.push({ id, show_id: input.show_id, number: input.number, title: input.title ?? null, episodes: [] });
  writeStore(store);
  return { ok: true as const, id };
}

export function saveLocalEpisode(input: {
  id?: string;
  season_id: string;
  number: number;
  title: string;
  description?: string | null;
  youtube_url?: string | null;
  duration?: string | null;
}) {
  const store = readStore();
  if (input.id) {
    for (const show of store.shows) {
      for (const season of show.seasons) {
        const idx = season.episodes.findIndex((e) => e.id === input.id);
        if (idx !== -1) {
          season.episodes[idx] = {
            ...season.episodes[idx],
            number: input.number,
            title: input.title,
            description: input.description ?? null,
            youtube_url: input.youtube_url ?? null,
            duration: input.duration ?? null,
          };
          writeStore(store);
          return { ok: true as const, id: input.id };
        }
      }
    }
    throw new Error("Episode not found");
  }
  const id = randomUUID();
  for (const show of store.shows) {
    for (const season of show.seasons) {
      if (season.id === input.season_id) {
        season.episodes.push({
          id,
          season_id: input.season_id,
          number: input.number,
          title: input.title,
          description: input.description ?? null,
          youtube_url: input.youtube_url ?? null,
          duration: input.duration ?? null,
        });
        writeStore(store);
        return { ok: true as const, id };
      }
    }
  }
  throw new Error("Season not found");
}