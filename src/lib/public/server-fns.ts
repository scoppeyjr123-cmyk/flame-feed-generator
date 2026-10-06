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
          { id: "fallback-weekly", slug: "weekly", name: "Semanal", description: "7 dias de acesso ilimitado", price: 9.9, currency: "BRL", billing_interval: "week", benefits: ["Acesso completo ao catálogo", "Doramas, séries turcas e novelinhas", "Dublado e legendado", "Sem anúncios", "Dispositivos compatíveis", "Liberação imediata"], featured: false, sort_order: 1, checkout_url: "https://pay.wiapy.com/D1rAjQcO8bo_" },
          { id: "fallback-annual", slug: "annual", name: "Anual", description: "12 meses de acesso ilimitado", price: 99.9, currency: "BRL", billing_interval: "year", benefits: ["Acesso completo ao catálogo", "Doramas, séries turcas e novelinhas", "Dublado e legendado", "Sem anúncios", "Dispositivos compatíveis", "Liberação imediata"], featured: true, sort_order: 2, checkout_url: "https://pay.wiapy.com/JQcBx7Tif3vh" },
          { id: "fallback-monthly", slug: "monthly", name: "Mensal", description: "30 dias de acesso ilimitado", price: 19.9, currency: "BRL", billing_interval: "month", benefits: ["Acesso completo ao catálogo", "Doramas, séries turcas e novelinhas", "Dublado e legendado", "Sem anúncios", "Dispositivos compatíveis", "Liberação imediata"], featured: false, sort_order: 3, checkout_url: "https://pay.wiapy.com/KaF1EsAXWGPC" },
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
      "id,title,slug,short_description,description,category,genre,cover_url,banner_url,thumbnail_url,featured,sort_order,published_at,episodes(id,episode_number,title,description,thumbnail_url,duration_seconds,status,access_type,sort_order)",
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) return { series: [], error: "Não foi possível carregar o catálogo." };

  return {
    series: (data ?? []).map((item) => ({
      ...item,
      episodes: (item.episodes ?? [])
        .filter((episode) => episode.status === "published")
        .sort((a, b) => a.sort_order - b.sort_order || a.episode_number - b.episode_number),
    })),
    error: null,
  };
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
    const { data: episodes, error: episodesError } = await supabase.rpc("get_published_episode_catalog", {
      target_series_id: data.id,
    });
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

    let allowed = data.access_type === "free";
    if (!allowed) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_id,status")
        .eq("user_id", session.user.id)
        .in("status", ["active", "lifetime"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      allowed = Boolean(
        subscription &&
          (data.access_type === "subscriber" ||
            (data.access_type === "specific_plan" && data.plan_id === subscription.plan_id)),
      );
    }

    if (!allowed) {
      return {
        episode: null,
        error: "Este episódio exige uma assinatura ou plano compatível.",
      };
    }

    if (data.video_provider === "bunny") {
      if (!data.bunny_video_id || data.video_processing_status !== "ready") {
        return {
          episode: null,
          error: "O vídeo deste episódio ainda está sendo processado.",
        };
      }
      const signed = createBunnySignedEmbedUrl(data.bunny_video_id);
      return {
        episode: { ...data, video_url: signed.url, playback_expires_at: signed.expires },
        error: null,
      };
    }

    return { episode: data, error: null };
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
  const [{ data }, { data: history }, { data: watchHistory }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan_id,status,starts_at,expires_at,renews_at,plans(name,billing_interval)")
      .eq("user_id", session.user.id)
      .in("status", ["active", "lifetime"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
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
  ]);
  return {
    session,
    subscription: data ?? null,
    history: history ?? [],
    watchHistory: watchHistory ?? [],
  };
});
