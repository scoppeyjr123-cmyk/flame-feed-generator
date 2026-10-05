import { createServerFn } from "@tanstack/react-start";

import { createClient } from "../supabase/server";

async function assertAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");

  const { data: role, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || role?.role !== "admin") throw new Error("FORBIDDEN");
  return { supabase, user };
}

async function countRows(
  supabase: ReturnType<typeof createClient>,
  table: "profiles" | "subscriptions" | "series" | "episodes" | "plans",
) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await assertAdmin();
  const [customers, subscriptions, series, episodes, plans] = await Promise.all([
    countRows(supabase, "profiles"),
    countRows(supabase, "subscriptions"),
    countRows(supabase, "series"),
    countRows(supabase, "episodes"),
    countRows(supabase, "plans"),
  ]);

  const [
    { count: activeSubscriptions },
    { count: pendingSubscriptions },
    { count: publishedSeries },
  ] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "lifetime"]),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("series").select("*", { count: "exact", head: true }).eq("status", "published"),
  ]);

  const [{ data: recentCustomers }, { data: recentSeries }, { data: recentAudit }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id,name,email,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("series")
        .select("id,title,status,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("audit_logs")
        .select("id,action,entity_type,entity_id,created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  return {
    metrics: {
      customers,
      subscriptions,
      activeSubscriptions: activeSubscriptions ?? 0,
      pendingSubscriptions: pendingSubscriptions ?? 0,
      series,
      publishedSeries: publishedSeries ?? 0,
      episodes,
      plans,
    },
    recentCustomers: recentCustomers ?? [],
    recentSeries: recentSeries ?? [],
    recentAudit: recentAudit ?? [],
  };
});

export const getAdminCustomers = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await assertAdmin();
  const [{ data: customers, error }, { data: subscriptions, error: subscriptionsError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id,name,email,created_at,last_login_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("id,user_id,status,starts_at,expires_at,renews_at,origin,plan_id,plans(name)")
        .order("created_at", { ascending: false }),
    ]);

  if (error) throw new Error(error.message);
  if (subscriptionsError) throw new Error(subscriptionsError.message);
  return { customers: customers ?? [], subscriptions: subscriptions ?? [] };
});

export const getAdminPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await assertAdmin();
  const [{ data: plans, error }, { data: checkout, error: checkoutError }] = await Promise.all([
    supabase.from("plans").select("*").order("sort_order", { ascending: true }),
    supabase.from("checkout_settings").select("*").order("created_at", { ascending: true }),
  ]);
  if (error) throw new Error(error.message);
  if (checkoutError) throw new Error(checkoutError.message);
  return { plans: plans ?? [], checkout: checkout ?? [] };
});

export const getAdminSeries = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await assertAdmin();
  const [{ data: series, error }, { data: episodes, error: episodesError }] = await Promise.all([
    supabase
      .from("series")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("episodes")
      .select(
        "id,series_id,episode_number,title,description,status,access_type,plan_id,thumbnail_url,video_url,video_provider,duration_seconds,scheduled_at",
      )
      .order("series_id")
      .order("sort_order"),
  ]);
  if (error) throw new Error(error.message);
  if (episodesError) throw new Error(episodesError.message);
  return { series: series ?? [], episodes: episodes ?? [] };
});

export const getAdminAuditLogs = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await assertAdmin();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,admin_id,action,entity_type,entity_id,created_at,before_data,after_data")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return { logs: data ?? [] };
});

export const getAdminSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await assertAdmin();
  const [{ data: settings, error }, { data: sections, error: sectionsError }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", true).maybeSingle(),
    supabase.from("home_sections").select("*").order("sort_order", { ascending: true }),
  ]);
  if (error) throw new Error(error.message);
  if (sectionsError) throw new Error(sectionsError.message);
  return { settings, sections: sections ?? [] };
});

export const getAdminMedia = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await assertAdmin();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { media: data ?? [] };
});
