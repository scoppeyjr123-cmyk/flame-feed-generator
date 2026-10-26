import { createServerFn } from "@tanstack/react-start";

import { createClient } from "./server";

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authenticated: false, isAdmin: false, user: null } as const;
  }

  const { data: role, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    authenticated: true,
    isAdmin: !error && role?.role === "admin",
    user: {
      id: user.id,
      email: user.email ?? "",
      name: typeof user.user_metadata?.["name"] === "string" ? user.user_metadata["name"] : null,
    },
  } as const;
});

export const getCustomerSession = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authenticated: false, user: null } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,name,email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email ?? profile?.email ?? "",
      name:
        profile?.name ??
        (typeof user.user_metadata?.["name"] === "string" ? user.user_metadata["name"] : null),
    },
  } as const;
});

export type CustomerAccessStatus = {
  authenticated: boolean;
  hasActiveSubscription: boolean;
  status: "active" | "expired" | "pending" | "none";
  planName: string | null;
  expiresAt: string | null;
  email: string;
};

export const getCustomerAccessStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<CustomerAccessStatus> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        authenticated: false,
        hasActiveSubscription: false,
        status: "none",
        planName: null,
        expiresAt: null,
        email: "",
      };
    }

    const email = user.email ?? "";

    const { data: rows } = await supabase
      .from("subscriptions")
      .select("id, status, starts_at, expires_at, renews_at, plans(name, billing_interval)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const now = Date.now();
    const subscriptionList = rows ?? [];

    const activeSub = subscriptionList.find(
      (s) =>
        s.status === "lifetime" ||
        (s.status === "active" && (s.expires_at === null || new Date(s.expires_at).getTime() > now)),
    );

    if (activeSub) {
      const planInfo = activeSub.plans as unknown as { name: string } | null;
      return {
        authenticated: true,
        hasActiveSubscription: true,
        status: "active",
        planName: planInfo?.name ?? "Assinatura Ativa",
        expiresAt: activeSub.expires_at,
        email,
      };
    }

    const expiredSub = subscriptionList.find(
      (s) =>
        s.status === "expired" ||
        (s.status === "active" && s.expires_at !== null && new Date(s.expires_at).getTime() <= now),
    );

    if (expiredSub) {
      const planInfo = expiredSub.plans as unknown as { name: string } | null;
      return {
        authenticated: true,
        hasActiveSubscription: false,
        status: "expired",
        planName: planInfo?.name ?? null,
        expiresAt: expiredSub.expires_at,
        email,
      };
    }

    const pendingSub = subscriptionList.find((s) => s.status === "pending");
    if (pendingSub) {
      const planInfo = pendingSub.plans as unknown as { name: string } | null;
      return {
        authenticated: true,
        hasActiveSubscription: false,
        status: "pending",
        planName: planInfo?.name ?? null,
        expiresAt: null,
        email,
      };
    }

    return {
      authenticated: true,
      hasActiveSubscription: false,
      status: "none",
      planName: null,
      expiresAt: null,
      email,
    };
  },
);

