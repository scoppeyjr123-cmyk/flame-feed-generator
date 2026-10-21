-- Move existing plan checkouts to Wiven without changing local plan IDs.
update public.checkout_settings as checkout
set provider = links.provider,
    primary_url = links.primary_url,
    provider_checkout_id = links.provider_checkout_id,
    primary_enabled = true,
    updated_at = now()
from (
  values
    ('weekly', 'wiven', 'https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=UDRLIC7', 'UDRLIC7'),
    ('monthly', 'wiven', 'https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=G2M4G7C', 'G2M4G7C'),
    ('annual', 'wiven', 'https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=84LM9WZ', '84LM9WZ')
) as links(slug, provider, primary_url, provider_checkout_id)
join public.plans on plans.slug = links.slug
where checkout.plan_id = plans.id;

insert into public.checkout_settings (plan_id, provider, primary_url, provider_checkout_id, primary_enabled)
select plans.id, links.provider, links.primary_url, links.provider_checkout_id, true
from (
  values
    ('weekly', 'wiven', 'https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=UDRLIC7', 'UDRLIC7'),
    ('monthly', 'wiven', 'https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=G2M4G7C', 'G2M4G7C'),
    ('annual', 'wiven', 'https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=84LM9WZ', '84LM9WZ')
) as links(slug, provider, primary_url, provider_checkout_id)
join public.plans on plans.slug = links.slug
where not exists (
  select 1 from public.checkout_settings existing where existing.plan_id = plans.id
);
