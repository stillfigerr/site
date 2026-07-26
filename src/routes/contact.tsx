import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Instagram, Mail, Youtube } from "lucide-react";
import { siteQueryOptions } from "@/lib/site-data";
import { SiteLayout } from "@/components/site-layout";
import { RichText } from "@/components/rich-text";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Infinite Corridor" },
      {
        name: "description",
        content:
          "Reach Infinite Corridor for press, partnerships, casting or distribution enquiries about our original series.",
      },
      { property: "og:title", content: "Contact — Infinite Corridor" },
      {
        property: "og:description",
        content: "Press, partnerships, casting and distribution enquiries.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions),
  component: Contact,
});

function Contact() {
  const { data } = useSuspenseQuery(siteQueryOptions);
  const s = data.settings;

  return (
    <SiteLayout footerNote={s.footer_note}>
      <section className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <p className="label-mono text-signal">Say hello</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{s.contact_title ?? "Contact"}</h1>
        <div className="mt-6">
          <RichText text={s.contact_body ?? ""} />
        </div>

        <div className="mt-10 divide-y divide-border border border-border">
          {s.contact_email && (
            <a
              href={`mailto:${s.contact_email}`}
              className="flex items-center gap-3 p-5 transition-colors hover:bg-surface"
            >
              <Mail className="h-4 w-4 text-signal" />
              <span className="text-sm">{s.contact_email}</span>
            </a>
          )}
          {s.contact_instagram && (
            <a
              href={s.contact_instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 p-5 transition-colors hover:bg-surface"
            >
              <Instagram className="h-4 w-4 text-signal" />
              <span className="text-sm">Instagram</span>
            </a>
          )}
          {s.contact_youtube && (
            <a
              href={s.contact_youtube}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 p-5 transition-colors hover:bg-surface"
            >
              <Youtube className="h-4 w-4 text-signal" />
              <span className="text-sm">YouTube channel</span>
            </a>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
