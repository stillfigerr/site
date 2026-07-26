import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { saveSettings } from "@/lib/admin.functions";
import {
  ANNOUNCEMENT_KEY,
  BANNER_DIMENSIONS,
  parseAnnouncement,
  type Announcement,
} from "@/lib/announcement";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const PRESET_COLORS = ["#e85d3a", "#000000", "#ffffff", "#1a1a1a", "#facc15", "#22c55e"];

export function AnnouncementAdmin({ settings }: { settings: Record<string, string> }) {
  const save = useServerFn(saveSettings);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Announcement>(() =>
    parseAnnouncement(settings[ANNOUNCEMENT_KEY]),
  );

  useEffect(() => {
    setDraft(parseAnnouncement(settings[ANNOUNCEMENT_KEY]));
  }, [settings]);

  const set = <K extends keyof Announcement>(key: K, value: Announcement[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: () =>
      save({ data: { entries: [{ key: ANNOUNCEMENT_KEY, value: JSON.stringify(draft) }] } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-data"] });
      toast.success("Announcement saved");
    },
    onError: () => toast.error("Could not save the announcement"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border border-border bg-card p-4">
        <div>
          <p className="label-mono">Show announcement</p>
          <p className="text-sm text-muted-foreground">Pinned to the very top of every page.</p>
        </div>
        <Switch
          checked={draft.enabled}
          onCheckedChange={(value) => set("enabled", value)}
          aria-label="Enable announcement"
        />
      </div>

      <div className="space-y-2">
        <Label>Announcement type</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["text", "banner"] as const).map((type) => (
            <Button
              key={type}
              type="button"
              variant={draft.type === type ? "default" : "secondary"}
              className="label-mono"
              onClick={() => set("type", type)}
            >
              {type === "text" ? "Text" : "Banner image"}
            </Button>
          ))}
        </div>
      </div>

      {draft.type === "text" ? (
        <div className="space-y-4 border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="ann-text">Announcement text</Label>
            <Textarea
              id="ann-text"
              rows={2}
              value={draft.text}
              onChange={(event) => set("text", event.target.value)}
              placeholder="New episode drops Friday at midnight"
            />
          </div>
          <ColorField
            id="ann-bg"
            label="Background colour"
            value={draft.bg_color}
            onChange={(value) => set("bg_color", value)}
          />
          <ColorField
            id="ann-fg"
            label="Text colour"
            value={draft.text_color}
            onChange={(value) => set("text_color", value)}
          />
        </div>
      ) : (
        <div className="space-y-4 border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="ann-desktop">Desktop banner URL</Label>
            <Input
              id="ann-desktop"
              value={draft.desktop_image_url}
              onChange={(event) => set("desktop_image_url", event.target.value)}
              placeholder="https://…"
            />
            <p className="text-xs text-muted-foreground">{BANNER_DIMENSIONS.desktop}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ann-mobile">Phone banner URL</Label>
            <Input
              id="ann-mobile"
              value={draft.mobile_image_url}
              onChange={(event) => set("mobile_image_url", event.target.value)}
              placeholder="https://…"
            />
            <p className="text-xs text-muted-foreground">{BANNER_DIMENSIONS.mobile}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ann-alt">Image description (alt text)</Label>
            <Input
              id="ann-alt"
              value={draft.alt_text}
              onChange={(event) => set("alt_text", event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="ann-link">Link URL (optional)</Label>
        <Input
          id="ann-link"
          value={draft.link_url}
          onChange={(event) => set("link_url", event.target.value)}
          placeholder="https://…"
        />
      </div>

      <div className="flex items-center justify-between border border-border p-4">
        <Label htmlFor="ann-dismiss">Visitors can dismiss it</Label>
        <Switch
          id="ann-dismiss"
          checked={draft.dismissible}
          onCheckedChange={(value) => set("dismissible", value)}
        />
      </div>

      <div className="space-y-2">
        <p className="label-mono text-muted-foreground">Preview</p>
        <div className="border border-border">
          <AnnouncementBar raw={JSON.stringify({ ...draft, enabled: true, dismissible: false })} />
        </div>
      </div>

      <Button
        className="w-full gap-2"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        <Save className="h-4 w-4" /> {mutation.isPending ? "Saving…" : "Save announcement"}
      </Button>
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer border border-border bg-transparent"
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} className="flex-1" />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Use ${color}`}
            onClick={() => onChange(color)}
            className="h-6 w-6 border border-border"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
