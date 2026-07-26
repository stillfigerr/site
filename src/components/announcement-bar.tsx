import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  announcementSignature,
  parseAnnouncement,
  type Announcement,
} from "@/lib/announcement";

const STORAGE_KEY = "ic-announcement-dismissed";

export function AnnouncementBar({ raw }: { raw?: string }) {
  const announcement = parseAnnouncement(raw);
  const signature = announcementSignature(announcement);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === signature);
  }, [signature]);

  if (!announcement.enabled || dismissed) return null;
  if (announcement.type === "text" && !announcement.text.trim()) return null;
  if (
    announcement.type === "banner" &&
    !announcement.desktop_image_url &&
    !announcement.mobile_image_url
  )
    return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, signature);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative z-50 w-full">
      {announcement.type === "text" ? (
        <TextAnnouncement announcement={announcement} />
      ) : (
        <BannerAnnouncement announcement={announcement} />
      )}
      {announcement.dismissible && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/70"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function Wrapper({
  href,
  children,
  className,
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (href) {
    return (
      <a href={href} className={className} style={style} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

function TextAnnouncement({ announcement }: { announcement: Announcement }) {
  return (
    <Wrapper
      href={announcement.link_url}
      className="block px-10 py-2.5 text-center"
      style={{ backgroundColor: announcement.bg_color, color: announcement.text_color }}
    >
      <span className="label-mono text-[0.7rem] tracking-[0.18em] md:text-xs">
        {announcement.text}
      </span>
    </Wrapper>
  );
}

function BannerAnnouncement({ announcement }: { announcement: Announcement }) {
  const desktop = announcement.desktop_image_url || announcement.mobile_image_url;
  const mobile = announcement.mobile_image_url || announcement.desktop_image_url;
  return (
    <Wrapper href={announcement.link_url} className="block bg-background">
      <img
        src={mobile}
        alt={announcement.alt_text || announcement.text || "Announcement"}
        className="block w-full md:hidden"
      />
      <img
        src={desktop}
        alt={announcement.alt_text || announcement.text || "Announcement"}
        className="hidden w-full md:block"
      />
    </Wrapper>
  );
}
