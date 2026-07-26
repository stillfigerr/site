import { createFileRoute } from "@tanstack/react-router";
import { siteQueryOptions } from "@/lib/site-data";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Infinite Corridor" },
      {
        name: "description",
        content: "The terms that apply when you watch Infinite Corridor series on this site.",
      },
      { property: "og:title", content: "Terms of Service — Infinite Corridor" },
      { property: "og:description", content: "Terms that apply when using this site." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions),
  component: () => <LegalPage settingKey="tos_body" fallbackTitle="Terms of Service" />,
});
