import { createFileRoute } from "@tanstack/react-router";
import { siteQueryOptions } from "@/lib/site-data";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Infinite Corridor" },
      {
        name: "description",
        content: "Which cookies and local preferences Infinite Corridor uses on this site.",
      },
      { property: "og:title", content: "Cookie Policy — Infinite Corridor" },
      { property: "og:description", content: "Cookies and local preferences used on this site." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions),
  component: () => <LegalPage settingKey="cookies_body" fallbackTitle="Cookie Policy" />,
});
