export type Episode = {
  id: string;
  season_id: string;
  number: number;
  title: string;
  description: string | null;
  youtube_url: string | null;
  duration: string | null;
  sort_order: number;
};

export type Season = {
  id: string;
  show_id: string;
  number: number;
  title: string | null;
  sort_order: number;
  episodes: Episode[];
};

export type Show = {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  icon_url: string | null;
  status: string;
  featured: boolean;
  sort_order: number;
  seasons: Season[];
};

export type SiteData = {
  settings: Record<string, string>;
  shows: Show[];
};

export const SETTING_FIELDS: {
  key: string;
  label: string;
  multiline?: boolean;
  group: "Home" | "Shows" | "Contact" | "Legal";
}[] = [
  { key: "brand_name", label: "Brand name", group: "Home" },
  { key: "hero_kicker", label: "Hero kicker", group: "Home" },
  { key: "hero_title", label: "Hero title", group: "Home" },
  { key: "hero_subtitle", label: "Hero subtitle", multiline: true, group: "Home" },
  { key: "hero_cta", label: "Hero button label", group: "Home" },
  { key: "about_title", label: "About title", group: "Home" },
  { key: "about_body", label: "About body", multiline: true, group: "Home" },
  { key: "footer_note", label: "Footer note", multiline: true, group: "Home" },
  { key: "shows_title", label: "Shows page title", group: "Shows" },
  { key: "shows_intro", label: "Shows page intro", multiline: true, group: "Shows" },
  { key: "contact_title", label: "Contact title", group: "Contact" },
  { key: "contact_body", label: "Contact body", multiline: true, group: "Contact" },
  { key: "contact_email", label: "Contact email", group: "Contact" },
  { key: "contact_instagram", label: "Instagram URL", group: "Contact" },
  { key: "contact_youtube", label: "YouTube URL", group: "Contact" },
  { key: "tos_body", label: "Terms of service", multiline: true, group: "Legal" },
  { key: "privacy_body", label: "Privacy policy", multiline: true, group: "Legal" },
  { key: "cookies_body", label: "Cookie policy", multiline: true, group: "Legal" },
];

export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}
