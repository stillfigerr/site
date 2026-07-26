import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { siteQueryOptions } from "@/lib/site-data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Infinite Corridor" },
      { name: "description", content: "Frequently asked questions about Infinite Corridor." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQueryOptions),
  component: FAQPage,
});

function FAQPage() {
  const { data } = useSuspenseQuery(siteQueryOptions);
  const faqs = data.settings.faqs ? JSON.parse(data.settings.faqs) as { id: string; question: string; answer: string }[] : [];

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <h1 className="text-4xl font-semibold md:text-5xl">FAQ</h1>
          <p className="mt-3 text-muted-foreground">
            Frequently asked questions about Infinite Corridor and our shows.
          </p>

          {faqs.length === 0 ? (
            <p className="mt-10 text-muted-foreground">No questions yet. Check back soon!</p>
          ) : (
            <div className="mt-10 space-y-6">
              {faqs.map((faq) => (
                <details key={faq.id} className="group border-b border-border pb-4">
                  <summary className="cursor-pointer text-lg font-medium text-foreground group-open:text-signal transition-colors">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}