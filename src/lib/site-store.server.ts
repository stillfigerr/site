import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), ".data");
const SETTINGS_PATH = join(DATA_DIR, "settings.json");

interface Store {
  settings: Record<string, string>;
}

function readStore(): Store {
  try {
    if (!existsSync(SETTINGS_PATH)) return { settings: {} };
    const raw = readFileSync(SETTINGS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { settings: {} };
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