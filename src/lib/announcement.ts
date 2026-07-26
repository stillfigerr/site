export type Announcement = {
  enabled: boolean;
  type: "text" | "banner";
  text: string;
  bg_color: string;
  text_color: string;
  link_url: string;
  dismissible: boolean;
  desktop_image_url: string;
  mobile_image_url: string;
  alt_text: string;
};

export const ANNOUNCEMENT_KEY = "announcement";

export const BANNER_DIMENSIONS = {
  desktop: "1600 × 240 px (recommended, ratio 20:3)",
  mobile: "800 × 400 px (recommended, ratio 2:1)",
};

export const emptyAnnouncement: Announcement = {
  enabled: false,
  type: "text",
  text: "",
  bg_color: "#e85d3a",
  text_color: "#000000",
  link_url: "",
  dismissible: true,
  desktop_image_url: "",
  mobile_image_url: "",
  alt_text: "",
};

export function parseAnnouncement(raw: string | undefined): Announcement {
  if (!raw) return emptyAnnouncement;
  try {
    const parsed = JSON.parse(raw) as Partial<Announcement>;
    return { ...emptyAnnouncement, ...parsed };
  } catch {
    return emptyAnnouncement;
  }
}

export function announcementSignature(a: Announcement) {
  return [a.type, a.text, a.desktop_image_url, a.mobile_image_url, a.link_url].join("|");
}
