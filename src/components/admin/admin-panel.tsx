import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  deleteItem,
  saveEpisode,
  saveSeason,
  saveSettings,
  saveShow,
} from "@/lib/admin.functions";
import { siteQueryOptions } from "@/lib/site-data";
import { AnnouncementAdmin } from "@/components/admin/announcement-admin";
import { AdminFAQ } from "@/components/admin/admin-faq";
import { SETTING_FIELDS, type Show } from "@/lib/site-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useQuery(siteQueryOptions);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="label-mono">Admin studio</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="shows" className="mt-4 px-4 pb-10">
          <TabsList className="w-full">
            <TabsTrigger value="shows" className="flex-1">
              Shows
            </TabsTrigger>
            <TabsTrigger value="announcement" className="flex-1">
              Announcement
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-1">
              Site text
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex-1">
              FAQ
            </TabsTrigger>
          </TabsList>
          <TabsContent value="shows" className="mt-6">
            <ShowsAdmin shows={data?.shows ?? []} />
          </TabsContent>
          <TabsContent value="announcement" className="mt-6">
            <AnnouncementAdmin settings={data?.settings ?? {}} />
          </TabsContent>
          <TabsContent value="text" className="mt-6">
            <SettingsAdmin settings={data?.settings ?? {}} />
          </TabsContent>
          <TabsContent value="faq" className="mt-6">
            <AdminFAQ />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function useRefreshSite() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["site-data"] });
}

function SettingsAdmin({ settings }: { settings: Record<string, string> }) {
  const save = useServerFn(saveSettings);
  const refresh = useRefreshSite();
  const [draft, setDraft] = useState(settings);

  useEffect(() => setDraft(settings), [settings]);

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          entries: SETTING_FIELDS.map((field) => ({
            key: field.key,
            value: draft[field.key] ?? "",
          })),
        },
      }),
    onSuccess: () => {
      refresh();
      toast.success("Site text saved");
    },
    onError: () => toast.error("Could not save the text"),
  });

  const groups = ["Home", "Shows", "Contact", "Legal"] as const;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group} className="space-y-4">
          <h3 className="label-mono text-muted-foreground">{group}</h3>
          {SETTING_FIELDS.filter((field) => field.group === group).map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.multiline ? (
                <Textarea
                  id={field.key}
                  rows={field.key.endsWith("_body") ? 6 : 3}
                  value={draft[field.key] ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              ) : (
                <Input
                  id={field.key}
                  value={draft[field.key] ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </section>
      ))}
      <Button className="w-full gap-2" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        <Save className="h-4 w-4" /> {mutation.isPending ? "Saving…" : "Save site text"}
      </Button>
    </div>
  );
}

const emptyShow = {
  title: "",
  tagline: "",
  description: "",
  icon_url: "",
  status: "Streaming now",
  featured: false,
  sort_order: 0,
};

function ShowsAdmin({ shows }: { shows: Show[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      {creating ? (
        <ShowForm initial={emptyShow} onDone={() => setCreating(false)} />
      ) : (
        <Button className="w-full gap-2" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Add show
        </Button>
      )}

      {shows.length === 0 && !creating && (
        <p className="text-sm text-muted-foreground">No shows yet — add your first one.</p>
      )}

      {shows.map((show) => (
        <ShowEditor key={show.id} show={show} />
      ))}
    </div>
  );
}

type ShowDraft = {
  id?: string;
  title: string;
  tagline: string;
  description: string;
  icon_url: string;
  status: string;
  featured: boolean;
  sort_order: number;
};

function ShowForm({ initial, onDone }: { initial: ShowDraft; onDone: () => void }) {
  const save = useServerFn(saveShow);
  const refresh = useRefreshSite();
  const [draft, setDraft] = useState<ShowDraft>(initial);

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          id: draft.id,
          title: draft.title.trim(),
          tagline: draft.tagline || null,
          description: draft.description || null,
          icon_url: draft.icon_url || null,
          status: draft.status || "Streaming now",
          featured: draft.featured,
          sort_order: Number(draft.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      refresh();
      toast.success(draft.id ? "Show updated" : "Show added");
      onDone();
    },
    onError: () => toast.error("Could not save the show"),
  });

  return (
    <div className="space-y-3 border border-border bg-card p-4">
      <div className="space-y-1.5">
        <Label htmlFor={`show-title-${draft.id ?? "new"}`}>Title</Label>
        <Input
          id={`show-title-${draft.id ?? "new"}`}
          value={draft.title}
          maxLength={120}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`show-tagline-${draft.id ?? "new"}`}>Tagline</Label>
        <Input
          id={`show-tagline-${draft.id ?? "new"}`}
          value={draft.tagline}
          maxLength={200}
          onChange={(event) => setDraft({ ...draft, tagline: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`show-desc-${draft.id ?? "new"}`}>Description</Label>
        <Textarea
          id={`show-desc-${draft.id ?? "new"}`}
          rows={4}
          value={draft.description}
          maxLength={4000}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`show-icon-${draft.id ?? "new"}`}>Icon / poster image URL</Label>
        <Input
          id={`show-icon-${draft.id ?? "new"}`}
          value={draft.icon_url}
          placeholder="https://…"
          maxLength={2000}
          onChange={(event) => setDraft({ ...draft, icon_url: event.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Status badge</Label>
          <Input
            value={draft.status}
            maxLength={60}
            onChange={(event) => setDraft({ ...draft, status: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Order</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id={`featured-${draft.id ?? "new"}`}
          checked={draft.featured}
          onCheckedChange={(checked) => setDraft({ ...draft, featured: checked })}
        />
        <Label htmlFor={`featured-${draft.id ?? "new"}`}>Feature on home page</Label>
      </div>
      <div className="flex gap-2">
        <Button
          className="gap-2"
          disabled={!draft.title.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <Save className="h-4 w-4" /> Save
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ShowEditor({ show }: { show: Show }) {
  const remove = useServerFn(deleteItem);
  const saveSeasonFn = useServerFn(saveSeason);
  const refresh = useRefreshSite();
  const [editing, setEditing] = useState(false);

  const deleteShow = useMutation({
    mutationFn: () => remove({ data: { table: "shows", id: show.id } }),
    onSuccess: () => {
      refresh();
      toast.success("Show deleted");
    },
  });

  const addSeason = useMutation({
    mutationFn: () =>
      saveSeasonFn({
        data: {
          show_id: show.id,
          number: (show.seasons.at(-1)?.number ?? 0) + 1,
          title: null,
        },
      }),
    onSuccess: () => {
      refresh();
      toast.success("Season added");
    },
  });

  return (
    <div className="space-y-3 border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-medium">{show.title}</h4>
          <p className="text-xs text-muted-foreground">
            {show.seasons.length} season{show.seasons.length === 1 ? "" : "s"} ·{" "}
            {show.seasons.reduce((total, season) => total + season.episodes.length, 0)} episodes
          </p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => setEditing((value) => !value)}>
            {editing ? "Close" : "Edit"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Delete ${show.title}`}
            onClick={() => {
              if (confirm(`Delete "${show.title}" and all of its episodes?`)) deleteShow.mutate();
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {editing && (
        <ShowForm
          initial={{
            id: show.id,
            title: show.title,
            tagline: show.tagline ?? "",
            description: show.description ?? "",
            icon_url: show.icon_url ?? "",
            status: show.status,
            featured: show.featured,
            sort_order: show.sort_order,
          }}
          onDone={() => setEditing(false)}
        />
      )}

      <div className="space-y-3">
        {show.seasons.map((season) => (
          <SeasonEditor key={season.id} season={season} />
        ))}
        <Button size="sm" variant="outline" className="gap-2" onClick={() => addSeason.mutate()}>
          <Plus className="h-4 w-4" /> Add season
        </Button>
      </div>
    </div>
  );
}

function SeasonEditor({ season }: { season: Show["seasons"][number] }) {
  const saveSeasonFn = useServerFn(saveSeason);
  const remove = useServerFn(deleteItem);
  const refresh = useRefreshSite();
  const [number, setNumber] = useState(season.number);
  const [title, setTitle] = useState(season.title ?? "");
  const [addingEpisode, setAddingEpisode] = useState(false);

  const update = useMutation({
    mutationFn: () =>
      saveSeasonFn({
        data: { id: season.id, show_id: season.show_id, number: Number(number) || 1, title: title || null },
      }),
    onSuccess: () => {
      refresh();
      toast.success("Season saved");
    },
  });

  const deleteSeason = useMutation({
    mutationFn: () => remove({ data: { table: "seasons", id: season.id } }),
    onSuccess: () => {
      refresh();
      toast.success("Season deleted");
    },
  });

  return (
    <div className="space-y-3 border border-dashed border-border bg-surface/60 p-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-20 space-y-1">
          <Label className="text-xs">Season #</Label>
          <Input type="number" value={number} onChange={(event) => setNumber(Number(event.target.value))} />
        </div>
        <div className="min-w-40 flex-1 space-y-1">
          <Label className="text-xs">Season title</Label>
          <Input value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <Button size="sm" variant="secondary" onClick={() => update.mutate()}>
          Save
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete season"
          onClick={() => {
            if (confirm("Delete this season and its episodes?")) deleteSeason.mutate();
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-2">
        {season.episodes.map((episode) => (
          <EpisodeForm key={episode.id} seasonId={season.id} episode={episode} />
        ))}
        {addingEpisode ? (
          <EpisodeForm
            seasonId={season.id}
            nextNumber={(season.episodes.at(-1)?.number ?? 0) + 1}
            onDone={() => setAddingEpisode(false)}
          />
        ) : (
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setAddingEpisode(true)}>
            <Plus className="h-4 w-4" /> Add episode
          </Button>
        )}
      </div>
    </div>
  );
}

function EpisodeForm({
  seasonId,
  episode,
  nextNumber = 1,
  onDone,
}: {
  seasonId: string;
  episode?: Show["seasons"][number]["episodes"][number];
  nextNumber?: number;
  onDone?: () => void;
}) {
  const saveEpisodeFn = useServerFn(saveEpisode);
  const remove = useServerFn(deleteItem);
  const refresh = useRefreshSite();
  const [draft, setDraft] = useState({
    number: episode?.number ?? nextNumber,
    title: episode?.title ?? "",
    description: episode?.description ?? "",
    youtube_url: episode?.youtube_url ?? "",
    duration: episode?.duration ?? "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      saveEpisodeFn({
        data: {
          id: episode?.id,
          season_id: seasonId,
          number: Number(draft.number) || 1,
          title: draft.title.trim(),
          description: draft.description || null,
          youtube_url: draft.youtube_url || null,
          duration: draft.duration || null,
        },
      }),
    onSuccess: () => {
      refresh();
      toast.success(episode ? "Episode saved" : "Episode added");
      onDone?.();
    },
    onError: () => toast.error("Could not save the episode"),
  });

  const deleteEpisode = useMutation({
    mutationFn: () => remove({ data: { table: "episodes", id: episode!.id } }),
    onSuccess: () => {
      refresh();
      toast.success("Episode deleted");
    },
  });

  return (
    <div className="space-y-2 border border-border bg-card p-3">
      <div className="flex gap-2">
        <div className="w-16 space-y-1">
          <Label className="text-xs">Ep #</Label>
          <Input
            type="number"
            value={draft.number}
            onChange={(event) => setDraft({ ...draft, number: Number(event.target.value) })}
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Title</Label>
          <Input
            value={draft.title}
            maxLength={200}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </div>
        <div className="w-24 space-y-1">
          <Label className="text-xs">Length</Label>
          <Input
            value={draft.duration}
            placeholder="24 min"
            maxLength={30}
            onChange={(event) => setDraft({ ...draft, duration: event.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">YouTube link</Label>
        <Input
          value={draft.youtube_url}
          placeholder="https://youtu.be/…"
          maxLength={500}
          onChange={(event) => setDraft({ ...draft, youtube_url: event.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Textarea
          rows={2}
          value={draft.description}
          maxLength={4000}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="gap-2"
          disabled={!draft.title.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <Save className="h-4 w-4" /> Save
        </Button>
        {episode ? (
          <Button
            size="sm"
            variant="ghost"
            className="gap-2 text-destructive"
            onClick={() => {
              if (confirm("Delete this episode?")) deleteEpisode.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
