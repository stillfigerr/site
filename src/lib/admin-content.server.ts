import { requireAdmin } from "./admin-session.server";
import {
  saveLocalShow,
  deleteLocalRow,
  saveLocalSeason,
  saveLocalEpisode,
} from "./site-store.server";

export type ShowInput = {
  id?: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  icon_url?: string | null;
  status?: string;
  featured?: boolean;
  sort_order?: number;
};

export type SeasonInput = {
  id?: string;
  show_id: string;
  number: number;
  title?: string | null;
};

export type EpisodeInput = {
  id?: string;
  season_id: string;
  number: number;
  title: string;
  description?: string | null;
  youtube_url?: string | null;
  duration?: string | null;
};

export async function saveSettingsRows(entries: { key: string; value: string }[]) {
  await requireAdmin();
  const { saveSiteSettings } = await import("./site-store.server");
  return saveSiteSettings(entries);
}

export async function saveShowRow(input: ShowInput) {
  await requireAdmin();
  return saveLocalShow(input);
}

export async function deleteRow(table: "shows" | "seasons" | "episodes", id: string) {
  await requireAdmin();
  return deleteLocalRow(table, id);
}

export async function saveSeasonRow(input: SeasonInput) {
  await requireAdmin();
  return saveLocalSeason(input);
}

export async function saveEpisodeRow(input: EpisodeInput) {
  await requireAdmin();
  return saveLocalEpisode(input);
}