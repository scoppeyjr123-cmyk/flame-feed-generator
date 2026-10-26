import { createServerFn } from "@tanstack/react-start";

import { findOrCreateUser, getAdminSupabaseClient, normalizeEmail } from "../payments/payment-sync.server";
import type { Json } from "../supabase/database.types";
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
  const [
    { data: customers, error },
    { data: subscriptions, error: subscriptionsError },
    { data: roles, error: rolesError },
    { data: plans, error: plansError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,name,email,created_at,last_login_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("id,user_id,status,starts_at,expires_at,renews_at,origin,plan_id,plans(name)")
      .order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id,role"),
    supabase
      .from("plans")
      .select("id,name,slug,billing_interval,price,active")
      .order("sort_order", { ascending: true }),
  ]);

  if (error) throw new Error(error.message);
  if (subscriptionsError) throw new Error(subscriptionsError.message);
  if (rolesError) throw new Error(rolesError.message);
  if (plansError) throw new Error(plansError.message);
  return {
    customers: customers ?? [],
    subscriptions: subscriptions ?? [],
    roles: roles ?? [],
    plans: plans ?? [],
  };
});

export type CreateAdminCustomerAccountInput = {
  name?: string | null | undefined;
  email: string;
  password?: string | null | undefined;
  grantAccess?: boolean | undefined;
  planId?: string | null | undefined;
  status?: "active" | "lifetime" | "pending" | "paused" | "cancelled" | "expired" | undefined;
  startsAt?: string | null | undefined;
  expiresAt?: string | null | undefined;
  notes?: string | null | undefined;
};

export const createAdminCustomerAccount = createServerFn({ method: "POST" })
  .validator((input: CreateAdminCustomerAccountInput) => input)
  .handler(async ({ data: input }) => {
    const { user: adminUser } = await assertAdmin();
    const email = normalizeEmail(input.email || "");
    if (!email || !email.includes("@")) {
      throw new Error("Informe um endereço de e-mail válido.");
    }

    const adminClient = getAdminSupabaseClient();
    const { userId, isNew } = await findOrCreateUser(
      adminClient,
      email,
      input.name,
      input.password,
    );

    if (!userId) {
      throw new Error("Não foi possível criar ou localizar a conta de usuário no Supabase.");
    }

    let subscriptionId: string | null = null;
    const shouldGrantAccess = input.grantAccess !== false;

    if (shouldGrantAccess) {
      const status = input.status || (input.planId ? "active" : "lifetime");
      const startsAt = input.startsAt
        ? new Date(`${input.startsAt}T12:00:00`).toISOString()
        : new Date().toISOString();

      let expiresAt: string | null = null;
      if (status === "lifetime") {
        expiresAt = null;
      } else if (input.expiresAt) {
        expiresAt = new Date(`${input.expiresAt}T23:59:59`).toISOString();
      } else if (input.planId) {
        const { data: plan } = await adminClient
          .from("plans")
          .select("id, billing_interval")
          .eq("id", input.planId)
          .maybeSingle();

        const start = new Date(startsAt);
        if (plan?.billing_interval === "week") {
          expiresAt = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        } else if (plan?.billing_interval === "year") {
          expiresAt = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        } else if (plan?.billing_interval === "lifetime") {
          expiresAt = null;
        } else {
          // month or default
          expiresAt = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
      } else {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data: subscription, error: subError } = await adminClient
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: status === "lifetime" ? null : (input.planId || null),
          status: status,
          starts_at: startsAt,
          expires_at: expiresAt,
          renews_at: null,
          origin: "manual",
          notes: input.notes?.trim() || "Conta e acesso criados manualmente pelo administrador",
          created_by: adminUser.id,
          updated_by: adminUser.id,
        })
        .select()
        .single();

      if (subError || !subscription) {
        throw new Error(`Erro ao conceder acesso: ${subError?.message ?? "Falha ao registrar assinatura."}`);
      }

      subscriptionId = subscription.id;

      await adminClient.from("subscription_history").insert({
        subscription_id: subscription.id,
        user_id: userId,
        action: "manual_account_and_access_created",
        before_data: null,
        after_data: subscription as unknown as Json,
        performed_by: adminUser.id,
      });
    }

    await adminClient.from("audit_logs").insert({
      admin_id: adminUser.id,
      action: "admin_manual_customer_created",
      entity_type: "customer",
      entity_id: userId,
      after_data: {
        name: input.name?.trim() || null,
        email,
        grantAccess: shouldGrantAccess,
        planId: input.planId || null,
        status: input.status || null,
        isNewUser: isNew,
        subscriptionId,
      } as unknown as Json,
    });

    return {
      ok: true,
      isNew,
      userId,
      subscriptionId,
      message: isNew
        ? "Conta de cliente criada com sucesso e acesso ao Web App liberado!"
        : "Conta existente identificada e novo acesso ao Web App concedido!",
    };
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
        "id,series_id,episode_number,title,description,status,access_type,plan_id,thumbnail_url,video_url,video_provider,video_source,telegram_chat_id,telegram_message_id,telegram_file_id,telegram_import_status,telegram_import_error,duration_seconds,scheduled_at,bunny_video_id,bunny_library_id,video_processing_status,video_encode_progress,video_storage_bytes,video_error,video_ready_at",
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
