import { requireAdmin } from "./admin-session.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert(entries.map((e) => ({ key: e.key, value: e.value })), { onConflict: "key" });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function saveShowRow(input: ShowInput) {
  await requireAdmin();
  const payload = {
    title: input.title,
    tagline: input.tagline ?? null,
    description: input.description ?? null,
    icon_url: input.icon_url ?? null,
    status: input.status ?? "Streaming now",
    featured: input.featured ?? false,
    sort_order: input.sort_order ?? 0,
  };
  if (input.id) {
    const { error } = await supabaseAdmin.from("shows").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
    return { ok: true as const, id: input.id };
  }
  const { data, error } = await supabaseAdmin.from("shows").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return { ok: true as const, id: data.id };
}

export async function deleteRow(table: "shows" | "seasons" | "episodes", id: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function saveSeasonRow(input: SeasonInput) {
  await requireAdmin();
  const payload = {
    show_id: input.show_id,
    number: input.number,
    title: input.title ?? null,
    sort_order: input.number,
  };
  if (input.id) {
    const { error } = await supabaseAdmin.from("seasons").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
    return { ok: true as const, id: input.id };
  }
  const { data, error } = await supabaseAdmin.from("seasons").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return { ok: true as const, id: data.id };
}

export async function saveEpisodeRow(input: EpisodeInput) {
  await requireAdmin();
  const payload = {
    season_id: input.season_id,
    number: input.number,
    title: input.title,
    description: input.description ?? null,
    youtube_url: input.youtube_url ?? null,
    duration: input.duration ?? null,
    sort_order: input.number,
  };
  if (input.id) {
    const { error } = await supabaseAdmin.from("episodes").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
    return { ok: true as const, id: input.id };
  }
  const { data, error } = await supabaseAdmin.from("episodes").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return { ok: true as const, id: data.id };
}
