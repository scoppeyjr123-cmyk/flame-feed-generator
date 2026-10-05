import { createServerFn } from "@tanstack/react-start";

import { createClient } from "../supabase/server";
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
        "id,title,slug,short_description,description,category,genre,cover_url,banner_url,thumbnail_url,featured,episodes(id,episode_number,title,description,video_url,thumbnail_url,duration_seconds,status,access_type,sort_order)",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return { series: null, error: "Novela não encontrada." };
    return {
      series: {
        ...data,
        episodes: (data.episodes ?? [])
          .filter((episode) => episode.status === "published")
          .sort((a, b) => a.sort_order - b.sort_order || a.episode_number - b.episode_number),
      },
      error: null,
    };
  });

export const getPublishedEpisode = createServerFn({ method: "GET" })
  .validator((episodeId: string) => episodeId)
  .handler(async ({ data: episodeId }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("episodes")
      .select(
        "id,episode_number,title,description,video_url,video_provider,thumbnail_url,duration_seconds,status,access_type,plan_id,series(id,title,slug)",
      )
      .eq("id", episodeId)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return { episode: null, error: "Episódio não encontrado ou sem acesso." };
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
