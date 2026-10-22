import { createServerFn } from "@tanstack/react-start";

import { createClient } from "../supabase/server";
import { createBunnySignedEmbedUrl } from "../bunny/stream.server";
import { getCustomerSession } from "../supabase/auth-server-fns";
import type { Json } from "../supabase/database.types";

export type PublicPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing_interval: "week" | "month" | "year" | "lifetime";
  benefits: Json;
  featured: boolean;
  sort_order: number;
  checkout_url: string | null;
};

export type PlayerSettings = {
  accentColor: string;
  backgroundColor: string;
  borderRadius: number;
  logoUrl: string;
  showBrand: boolean;
};

export type PartTwoSettings = {
  headline: string;
  offerHeadline?: string;
  catalogSubtitle?: string;
  subheadline: string;
  videoUrl: string;
  posterUrl: string;
  videoProvider: "url" | "bunny";
  ctaText: string;
  eyebrow: string;
  checkoutWeeklyUrl?: string;
  checkoutMonthlyUrl?: string;
  checkoutAnnualUrl?: string;
  priceWeekly?: number | string;
  priceMonthly?: number | string;
  priceAnnual?: number | string;
  currency?: string;
};

const partTwoFallback: PartTwoSettings = {
  headline: "Parte 2 — a história continua",
  offerHeadline: "ASSISTA MAIS DE\n7.000 DRAMAS\nSEM LIMITES",
  catalogSubtitle: "7.000 títulos publicados para você descobrir.",
  subheadline: "Você chegou até aqui. Agora descubra o que acontece depois.",
  videoUrl: "https://player.vimeo.com/video/1231112345",
  posterUrl: "",
  videoProvider: "url",
  ctaText: "CONTINUE ASSISTINDO",
  eyebrow: "CONTINUAÇÃO EXCLUSIVA",
  checkoutWeeklyUrl: "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=XTSUYU1",
  checkoutMonthlyUrl: "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=ZVZ9FV7",
  checkoutAnnualUrl: "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=WH555VJ",
  priceWeekly: 4.9,
  priceMonthly: 9.9,
  priceAnnual: 39.9,
  currency: "EUR",
};

async function readPartTwoSettings(key: string): Promise<PartTwoSettings> {
  const { data } = await createClient()
    .from("site_settings")
    .select("content_settings")
    .eq("id", true)
    .maybeSingle();
  const content =
    data?.content_settings &&
    typeof data.content_settings === "object" &&
    !Array.isArray(data.content_settings)
      ? (data.content_settings as Record<string, unknown>)
      : {};
  // Until the offer gets its own saved video, keep showing the previously shared
  // Part 2 video. Saving either page then makes its video independent.
  const value =
    content[key] ??
    (key === "offer"
      ? content["partTwo"]
      : key === "offer2"
        ? (content["offer"] ?? content["partTwo"])
        : key === "offer3"
          ? (content["offer2"] ?? content["offer"] ?? content["partTwo"])
          : null);
  const settings = {
    ...partTwoFallback,
    ...(value && typeof value === "object" ? value : {}),
  } as PartTwoSettings;

  if (settings.videoProvider === "bunny") {
    const match = settings.videoUrl.match(
      /(?:iframe|player)\.mediadelivery\.net\/embed\/\d+\/([^/?#]+)/i,
    );
    if (match?.[1]) {
      try {
        settings.videoUrl = createBunnySignedEmbedUrl(decodeURIComponent(match[1])).url;
      } catch {
        // Keep the configured URL when the Bunny token key is unavailable.
      }
    }
  }
  return settings;
}

export const getPublicPartTwoSettings = createServerFn({ method: "GET" }).handler(async () => {
  return readPartTwoSettings("partTwo");
});

export const getPublicOfferSettings = createServerFn({ method: "GET" }).handler(async () => {
  return readPartTwoSettings("offer");
});

export const getPublicOffer2Settings = createServerFn({ method: "GET" }).handler(async () => {
  return readPartTwoSettings("offer2");
});

export const getPublicOffer3Settings = createServerFn({ method: "GET" }).handler(async () => {
  return readPartTwoSettings("offer3");
});

export const getPublicOffer2Plans = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await readPartTwoSettings("offer2");
  const currency = settings.currency || "EUR";
  const defaultBenefits = [
    "Acesso completo ao catálogo",
    "Doramas, séries turcas e novelinhas",
    "Dublado e legendado",
    "Sem anúncios",
    "Dispositivos compatíveis",
    "Liberação imediata",
  ];

  const plans: PublicPlan[] = [
    {
      id: "offer2-weekly",
      slug: "weekly",
      name: "Semanal",
      description: "7 dias de acesso ilimitado",
      price: Number(settings.priceWeekly) || 4.9,
      currency,
      billing_interval: "week",
      benefits: defaultBenefits,
      featured: false,
      sort_order: 1,
      checkout_url:
        settings.checkoutWeeklyUrl ||
        "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=XTSUYU1",
    },
    {
      id: "offer2-annual",
      slug: "annual",
      name: "Anual",
      description: "12 meses de acesso ilimitado",
      price: Number(settings.priceAnnual) || 39.9,
      currency,
      billing_interval: "year",
      benefits: defaultBenefits,
      featured: true,
      sort_order: 2,
      checkout_url:
        settings.checkoutAnnualUrl ||
        "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=WH555VJ",
    },
    {
      id: "offer2-monthly",
      slug: "monthly",
      name: "Mensal",
      description: "30 dias de acesso ilimitado",
      price: Number(settings.priceMonthly) || 9.9,
      currency,
      billing_interval: "month",
      benefits: defaultBenefits,
      featured: false,
      sort_order: 3,
      checkout_url:
        settings.checkoutMonthlyUrl ||
        "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=ZVZ9FV7",
    },
  ];

  return { plans, error: null };
});

export const getPublicOffer3Plans = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await readPartTwoSettings("offer3");
  const currency = settings.currency || "EUR";
  const defaultBenefits = [
    "Acesso completo ao catálogo",
    "Doramas, séries turcas e novelinhas",
    "Dublado e legendado",
    "Sem anúncios",
    "Dispositivos compatíveis",
    "Liberação imediata",
  ];

  const plans: PublicPlan[] = [
    {
      id: "offer3-weekly",
      slug: "weekly",
      name: "Semanal",
      description: "7 dias de acesso ilimitado",
      price: Number(settings.priceWeekly) || 4.9,
      currency,
      billing_interval: "week",
      benefits: defaultBenefits,
      featured: false,
      sort_order: 1,
      checkout_url:
        settings.checkoutWeeklyUrl ||
        "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=XTSUYU1",
    },
    {
      id: "offer3-annual",
      slug: "annual",
      name: "Anual",
      description: "12 meses de acesso ilimitado",
      price: Number(settings.priceAnnual) || 39.9,
      currency,
      billing_interval: "year",
      benefits: defaultBenefits,
      featured: true,
      sort_order: 2,
      checkout_url:
        settings.checkoutAnnualUrl ||
        "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=WH555VJ",
    },
    {
      id: "offer3-monthly",
      slug: "monthly",
      name: "Mensal",
      description: "30 dias de acesso ilimitado",
      price: Number(settings.priceMonthly) || 9.9,
      currency,
      billing_interval: "month",
      benefits: defaultBenefits,
      featured: false,
      sort_order: 3,
      checkout_url:
        settings.checkoutMonthlyUrl ||
        "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=ZVZ9FV7",
    },
  ];

  return { plans, error: null };
});

export const getPublicPartTwoVariantSettings = createServerFn({ method: "GET" })
  .validator((key: string) => key)
  .handler(async ({ data }) => readPartTwoSettings(data));

export const getPublicPlayerSettings = createServerFn({ method: "GET" }).handler(async () => {
  const fallback: PlayerSettings = {
    accentColor: "#ff3ca8",
    backgroundColor: "#080508",
    borderRadius: 16,
    logoUrl: "",
    showBrand: true,
  };
  const { data } = await createClient()
    .from("site_settings")
    .select("media_settings")
    .eq("id", true)
    .maybeSingle();
  const player =
    data?.media_settings &&
    typeof data.media_settings === "object" &&
    !Array.isArray(data.media_settings)
      ? (data.media_settings as Record<string, unknown>)["player"]
      : null;
  return { ...fallback, ...(player && typeof player === "object" ? player : {}) } as PlayerSettings;
});

export const getPublicPlans = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = createClient();
    const [{ data: plans, error }, { data: checkout, error: checkoutError }] = await Promise.all([
      supabase
        .from("plans")
        .select(
          "id,slug,name,description,price,currency,billing_interval,benefits,featured,sort_order",
        )
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("checkout_settings")
        .select("plan_id,primary_url,primary_enabled")
        .eq("primary_enabled", true),
    ]);

    if (error || checkoutError)
      return {
        plans: [],
        error: (error ?? checkoutError)?.message ?? "Não foi possível carregar os planos.",
      };
    const checkoutMap = new Map((checkout ?? []).map((item) => [item.plan_id, item.primary_url]));
    if (!plans?.length) {
      return {
        plans: [
          {
            id: "fallback-weekly",
            slug: "weekly",
            name: "Semanal",
            description: "7 dias de acesso ilimitado",
            price: 9.9,
            currency: "BRL",
            billing_interval: "week",
            benefits: [
              "Acesso completo ao catálogo",
              "Doramas, séries turcas e novelinhas",
              "Dublado e legendado",
              "Sem anúncios",
              "Dispositivos compatíveis",
              "Liberação imediata",
            ],
            featured: false,
            sort_order: 1,
            checkout_url: "https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=UDRLIC7",
          },
          {
            id: "fallback-annual",
            slug: "annual",
            name: "Anual",
            description: "12 meses de acesso ilimitado",
            price: 99.9,
            currency: "BRL",
            billing_interval: "year",
            benefits: [
              "Acesso completo ao catálogo",
              "Doramas, séries turcas e novelinhas",
              "Dublado e legendado",
              "Sem anúncios",
              "Dispositivos compatíveis",
              "Liberação imediata",
            ],
            featured: true,
            sort_order: 2,
            checkout_url: "https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=84LM9WZ",
          },
          {
            id: "fallback-monthly",
            slug: "monthly",
            name: "Mensal",
            description: "30 dias de acesso ilimitado",
            price: 19.9,
            currency: "BRL",
            billing_interval: "month",
            benefits: [
              "Acesso completo ao catálogo",
              "Doramas, séries turcas e novelinhas",
              "Dublado e legendado",
              "Sem anúncios",
              "Dispositivos compatíveis",
              "Liberação imediata",
            ],
            featured: false,
            sort_order: 3,
            checkout_url: "https://checkout.wiven.com.br/checkout/cmvhph805123801pwk9wex6k2?offer=G2M4G7C",
          },
        ] as PublicPlan[],
        error: null,
      };
    }
    return {
      plans: (plans ?? []).map((plan) => ({
        ...plan,
        checkout_url: checkoutMap.get(plan.id) ?? null,
      })) as PublicPlan[],
      error: null,
    };
  } catch (error) {
    return {
      plans: [],
      error: error instanceof Error ? error.message : "Não foi possível carregar os planos.",
    };
  }
});

export const getPublishedCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("series")
    .select(
      "id,title,slug,short_description,description,category,genre,cover_url,banner_url,thumbnail_url,featured,sort_order,published_at",
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) return { series: [], error: "Não foi possível carregar o catálogo." };

  return { series: data ?? [], error: null };
});

export const getPublishedSeriesBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("series")
      .select(
        "id,title,slug,short_description,description,category,genre,cover_url,banner_url,thumbnail_url,featured",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return { series: null, error: "Novela não encontrada." };
    const { data: episodes, error: episodesError } = await supabase.rpc(
      "get_published_episode_catalog",
      {
        target_series_id: data.id,
      },
    );
    if (episodesError) return { series: null, error: "Não foi possível carregar os episódios." };
    return {
      series: { ...data, episodes: episodes ?? [] },
      error: null,
    };
  });

export const getPublishedEpisode = createServerFn({ method: "GET" })
  .validator((episodeId: string) => episodeId)
  .handler(async ({ data: episodeId }) => {
    const session = await getCustomerSession();
    if (!session.authenticated) {
      return { episode: null, error: "Faça login para assistir este episódio." };
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("episodes")
      .select(
        "id,episode_number,title,description,video_url,video_provider,thumbnail_url,duration_seconds,status,access_type,plan_id,bunny_video_id,video_processing_status,plans(name,slug,price,currency,billing_interval),series(id,title,slug)",
      )
      .eq("id", episodeId)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return { episode: null, error: "Episódio não encontrado." };

    const { data: subscriptionRows, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("plan_id,status,expires_at")
      .eq("user_id", session.user.id)
      .in("status", ["active", "lifetime"])
      .order("created_at", { ascending: false });

    if (subscriptionError) {
      return {
        episode: null,
        error:
          "Não foi possível confirmar sua assinatura agora. Atualize a página e tente novamente.",
      };
    }

    const now = Date.now();
    const validSubscriptions = (subscriptionRows ?? []).filter(
      (subscription) =>
        subscription.status === "lifetime" ||
        subscription.expires_at === null ||
        new Date(subscription.expires_at).getTime() > now,
    );
    const hasSubscription = validSubscriptions.length > 0;
    const matchingSubscription = validSubscriptions.some(
      (subscription) => subscription.status === "lifetime" || subscription.plan_id === data.plan_id,
    );
    const allowed =
      data.access_type === "free" ||
      (data.access_type === "subscriber" && hasSubscription) ||
      (data.access_type === "specific_plan" && matchingSubscription);

    let freeRemainingSeconds: number | null = null;
    if (data.access_type === "free" && !hasSubscription) {
      const { data: usage, error: usageError } = await supabase.rpc("get_free_watch_usage");
      if (usageError) {
        return {
          episode: null,
          error:
            "Não foi possível confirmar seu acesso gratuito agora. Atualize a página e tente novamente.",
        };
      }
      const used = Number(usage ?? 0);
      freeRemainingSeconds = Math.max(0, 1200 - (Number.isFinite(used) ? used : 0));
      if (freeRemainingSeconds <= 0) {
        return {
          episode: null,
          error:
            "Seu acesso gratuito de 20 minutos foi utilizado. Assine um plano para continuar assistindo.",
        };
      }
    }

    if (!allowed) {
      return {
        episode: null,
        error: "Este episódio exige uma assinatura ou plano compatível.",
      };
    }

    if (data.bunny_video_id) {
      if (!data.bunny_video_id || data.video_processing_status !== "ready") {
        return {
          episode: null,
          error: "O vídeo deste episódio ainda está sendo processado.",
        };
      }
      const signed = createBunnySignedEmbedUrl(data.bunny_video_id);
      return {
        episode: {
          ...data,
          video_url: signed.url,
          playback_expires_at: signed.expires,
          free_remaining_seconds: freeRemainingSeconds,
        },
        error: null,
      };
    }

    return { episode: { ...data, free_remaining_seconds: freeRemainingSeconds }, error: null };
  });

export const getFreeWatchUsage = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getCustomerSession();
  if (!session.authenticated) return { usedSeconds: 0, remainingSeconds: 0 };
  const { data } = await createClient().rpc("get_free_watch_usage");
  const usedSeconds = Math.max(0, Number(data ?? 0));
  return { usedSeconds, remainingSeconds: Math.max(0, 1200 - usedSeconds) };
});

export const getCustomerEpisodeProgress = createServerFn({ method: "GET" })
  .validator((episodeId: string) => episodeId)
  .handler(async ({ data: episodeId }) => {
    const session = await getCustomerSession();
    if (!session.authenticated) return { progress: null };
    const supabase = createClient();
    const { data } = await supabase
      .from("watch_progress")
      .select("position_seconds,duration_seconds,completed")
      .eq("user_id", session.user.id)
      .eq("episode_id", episodeId)
      .maybeSingle();
    return { progress: data ?? null };
  });

export const getCustomerWatchlist = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getCustomerSession();
  if (!session.authenticated) return { items: [], error: "Faça login para acessar sua lista." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("watchlist")
    .select(
      "created_at,series(id,title,slug,short_description,category,genre,cover_url,banner_url)",
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) return { items: [], error: "Não foi possível carregar sua lista." };
  return { items: data ?? [], error: null };
});

export const getCustomerProgress = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getCustomerSession();
  if (!session.authenticated) return { items: [], error: "Faça login para continuar assistindo." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("watch_progress")
    .select(
      "position_seconds,duration_seconds,completed,updated_at,episodes(id,episode_number,title,thumbnail_url,series(id,title,slug,cover_url))",
    )
    .eq("user_id", session.user.id)
    .eq("completed", false)
    .order("updated_at", { ascending: false })
    .limit(8);

  if (error) return { items: [], error: "Não foi possível carregar seu progresso." };
  return { items: data ?? [], error: null };
});

export const getCustomerAccount = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getCustomerSession();
  if (!session.authenticated) return { session, subscription: null };
  const supabase = createClient();
  const [{ data: subscriptionRows }, { data: history }, { data: watchHistory }] = await Promise.all(
    [
      supabase
        .from("subscriptions")
        .select("plan_id,status,starts_at,expires_at,renews_at,plans(name,billing_interval)")
        .eq("user_id", session.user.id)
        .in("status", ["active", "lifetime"])
        .order("created_at", { ascending: false }),
      supabase
        .from("subscription_history")
        .select("action,created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("watch_progress")
        .select(
          "position_seconds,duration_seconds,completed,updated_at,episodes(id,episode_number,title,series(title,slug))",
        )
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false })
        .limit(12),
    ],
  );
  const now = Date.now();
  const subscription =
    (subscriptionRows ?? []).find(
      (row) =>
        row.status === "lifetime" ||
        row.expires_at === null ||
        new Date(row.expires_at).getTime() > now,
    ) ?? null;
  return {
    session,
    subscription,
    subscriptions: (subscriptionRows ?? []).filter(
      (row) =>
        row.status === "lifetime" ||
        row.expires_at === null ||
        new Date(row.expires_at).getTime() > now,
    ),
    history: history ?? [],
    watchHistory: watchHistory ?? [],
  };
});
