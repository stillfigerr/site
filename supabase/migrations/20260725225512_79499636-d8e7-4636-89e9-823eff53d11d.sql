CREATE TABLE public.shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tagline text,
  description text,
  icon_url text,
  status text NOT NULL DEFAULT 'Streaming now',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shows TO anon, authenticated;
GRANT ALL ON public.shows TO service_role;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shows are publicly readable" ON public.shows FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  number integer NOT NULL DEFAULT 1,
  title text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seasons TO anon, authenticated;
GRANT ALL ON public.seasons TO service_role;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seasons are publicly readable" ON public.seasons FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  description text,
  youtube_url text,
  duration text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.episodes TO anon, authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Episodes are publicly readable" ON public.episodes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are publicly readable" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.site_settings (key, value) VALUES
  ('brand_name', 'Infinite Corridor'),
  ('hero_kicker', 'Show production label'),
  ('hero_title', 'Stories that never stop unfolding'),
  ('hero_subtitle', 'Infinite Corridor is an independent show production label. We write, shoot and cut original series — and you can watch every episode right here.'),
  ('hero_cta', 'Watch the shows'),
  ('about_title', 'About the label'),
  ('about_body', 'We are a small crew of writers, directors and editors building serialized stories with no corridor left unexplored. Every season is produced in-house and released free on this site.'),
  ('shows_title', 'Our shows'),
  ('shows_intro', 'Pick a show, choose a season, and press play.'),
  ('contact_title', 'Contact'),
  ('contact_body', 'Press, partnerships, casting or just fan mail — we read everything.'),
  ('contact_email', 'hello@infinitecorridor.tv'),
  ('contact_instagram', ''),
  ('contact_youtube', ''),
  ('footer_note', 'Infinite Corridor™ — all shows and artwork are property of the label.'),
  ('tos_body', E'## Terms of Service\n\nBy using this site you agree to these terms. All series, artwork, audio and video published here are the property of Infinite Corridor and may not be re-uploaded, resold or redistributed without written permission.\n\nEpisodes are streamed through embedded third-party players. Availability may change at any time.\n\nYou agree not to misuse the site, attempt to gain unauthorised access, or interfere with playback for other viewers.'),
  ('privacy_body', E'## Privacy Policy\n\nWe keep data collection to a minimum. We do not sell personal information.\n\nWhen you email us, we store that message only to reply to you. Embedded video players may collect their own viewing data under their own privacy policies.\n\nTo request deletion of anything you have sent us, email the address on our contact page.'),
  ('cookies_body', E'## Cookie Policy\n\nWe use a single local preference to remember whether you chose light or dark mode.\n\nEmbedded video players may set their own cookies once you press play. You can block or clear cookies in your browser settings at any time.');

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER shows_touch BEFORE UPDATE ON public.shows FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();