import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const showSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  icon_url: z.string().trim().max(2000).nullable().optional(),
  status: z.string().trim().max(60).optional(),
  featured: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

const seasonSchema = z.object({
  id: z.string().uuid().optional(),
  show_id: z.string().uuid(),
  number: z.number().int().min(0).max(999),
  title: z.string().trim().max(160).nullable().optional(),
});

const episodeSchema = z.object({
  id: z.string().uuid().optional(),
  season_id: z.string().uuid(),
  number: z.number().int().min(0).max(9999),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullable().optional(),
  youtube_url: z.string().trim().max(500).nullable().optional(),
  duration: z.string().trim().max(30).nullable().optional(),
});

const settingsSchema = z.object({
  entries: z
    .array(z.object({ key: z.string().trim().min(1).max(64), value: z.string().max(20000) }))
    .min(1)
    .max(40),
});

const deleteSchema = z.object({
  table: z.enum(["shows", "seasons", "episodes"]),
  id: z.string().uuid(),
});

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isAdminUnlocked } = await import("./admin-session.server");
  return { unlocked: await isAdminUnlocked() };
});

export const adminUnlock = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ password: z.string().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { getAdminSession, passwordMatches } = await import("./admin-session.server");
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) throw new Error("ADMIN_PASSWORD is not configured");
    if (!passwordMatches(data.password, expected)) return { ok: false as const };
    const session = await getAdminSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLock = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin-session.server");
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((data) => settingsSchema.parse(data))
  .handler(async ({ data }) => {
    const { saveSettingsRows } = await import("./admin-content.server");
    return saveSettingsRows(data.entries);
  });

export const saveShow = createServerFn({ method: "POST" })
  .inputValidator((data) => showSchema.parse(data))
  .handler(async ({ data }) => {
    const { saveShowRow } = await import("./admin-content.server");
    return saveShowRow(data);
  });

export const saveSeason = createServerFn({ method: "POST" })
  .inputValidator((data) => seasonSchema.parse(data))
  .handler(async ({ data }) => {
    const { saveSeasonRow } = await import("./admin-content.server");
    return saveSeasonRow(data);
  });

export const saveEpisode = createServerFn({ method: "POST" })
  .inputValidator((data) => episodeSchema.parse(data))
  .handler(async ({ data }) => {
    const { saveEpisodeRow } = await import("./admin-content.server");
    return saveEpisodeRow(data);
  });

export const deleteItem = createServerFn({ method: "POST" })
  .inputValidator((data) => deleteSchema.parse(data))
  .handler(async ({ data }) => {
    const { deleteRow } = await import("./admin-content.server");
    return deleteRow(data.table, data.id);
  });
