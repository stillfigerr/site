import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeId } from "@/lib/site-types";

export function YouTubePlayer({
  url,
  title,
  autoplayOnClick = true,
}: {
  url: string | null | undefined;
  title: string;
  autoplayOnClick?: boolean;
}) {
  const id = youtubeId(url);
  const [playing, setPlaying] = useState(false);

  if (!id) {
    return (
      <div className="flex aspect-video w-full items-center justify-center border border-dashed border-border bg-surface text-sm text-muted-foreground">
        No video link added yet
      </div>
    );
  }

  if (!playing && autoplayOnClick) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play ${title}`}
        className="group relative block aspect-video w-full overflow-hidden bg-black"
      >
        <img
          src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
          alt={`${title} thumbnail`}
          loading="lazy"
          className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-signal text-signal-foreground shadow-lift transition group-hover:scale-110">
            <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="aspect-video w-full bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
