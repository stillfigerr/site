import { useSuspenseQuery } from "@tanstack/react-query";
import { siteQueryOptions } from "@/lib/site-data";
import { SiteLayout } from "@/components/site-layout";
import { RichText } from "@/components/rich-text";

export function LegalPage({ settingKey, fallbackTitle }: { settingKey: string; fallbackTitle: string }) {
  const { data } = useSuspenseQuery(siteQueryOptions);
  const body = data.settings[settingKey] ?? "";

  return (
    <SiteLayout footerNote={data.settings.footer_note}>
      <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <p className="label-mono text-signal">Legal</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{fallbackTitle}</h1>
        <div className="mt-8">
          {body ? <RichText text={body} /> : <p className="text-muted-foreground">Coming soon.</p>}
        </div>
      </article>
    </SiteLayout>
  );
}
