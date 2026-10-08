insert into public.plans (slug, name, description, price, currency, billing_interval, benefits, featured, sort_order, active)
values
  ('weekly', 'Semanal', '7 dias de acesso ilimitado', 9.90, 'BRL', 'week', '["Acesso completo ao catálogo", "Doramas, séries turcas e novelinhas", "Dublado e legendado", "Sem anúncios", "Dispositivos compatíveis", "Liberação imediata"]'::jsonb, false, 1, true),
  ('annual', 'Anual', '12 meses de acesso ilimitado', 99.90, 'BRL', 'year', '["Acesso completo ao catálogo", "Doramas, séries turcas e novelinhas", "Dublado e legendado", "Sem anúncios", "Dispositivos compatíveis", "Liberação imediata"]'::jsonb, true, 2, true),
  ('monthly', 'Mensal', '30 dias de acesso ilimitado', 19.90, 'BRL', 'month', '["Acesso completo ao catálogo", "Doramas, séries turcas e novelinhas", "Dublado e legendado", "Sem anúncios", "Dispositivos compatíveis", "Liberação imediata"]'::jsonb, false, 3, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  currency = excluded.currency,
  billing_interval = excluded.billing_interval,
  benefits = excluded.benefits,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.checkout_settings (plan_id, provider, primary_url, primary_enabled)
select id, 'wiapy', checkout_url, true
from public.plans
join (values
  ('weekly', 'https://pay.wiapy.com/D1rAjQcO8bo_'),
  ('annual', 'https://pay.wiapy.com/JQcBx7Tif3vh'),
  ('monthly', 'https://pay.wiapy.com/KaF1EsAXWGPC')
) as links(slug, checkout_url) using (slug)
on conflict (plan_id) do update set
  provider = excluded.provider,
  primary_url = excluded.primary_url,
  primary_enabled = excluded.primary_enabled;
