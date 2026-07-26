import { createFileRoute } from "@tanstack/react-router";
import { siteQueryOptions } from "@/lib/site-data";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Infinite Corridor" },
      {
        name: "description",
        content: "How Infinite Corridor handles the small amount of data collected on this site.",
      },
      { property: "og:title", content: "Privacy Policy — Infinite Corridor" },
      { property: "og:description", content: "How we handle data collected on this site." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions),
  component: () => <LegalPage settingKey="privacy_body" fallbackTitle="Privacy Policy" />,
});
