import { createServerFn } from "@tanstack/react-start";

import { getAdminSupabaseClient, normalizeEmail } from "../payments/payment-sync.server";
import { createClient } from "./server";

export type EmailLoginResult =
  { ok: true } | { ok: false; reason: "invalid_email" | "account_not_found" | "session_error" };

export const loginCustomerByEmail = createServerFn({ method: "POST" })
  .validator((email: string) => email)
  .handler(async ({ data: rawEmail }): Promise<EmailLoginResult> => {
    const email = normalizeEmail(rawEmail);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) return { ok: false, reason: "invalid_email" };

    const admin = getAdminSupabaseClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id,email")
      .ilike("email", email)
      .maybeSingle();

    if (profileError || !profile) {
      return { ok: false, reason: "account_not_found" };
    }

    const { data: role } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id)
      .maybeSingle();

    // Administrative accounts keep their stronger password-based login flow.
    if (role?.role === "admin") {
      return { ok: false, reason: "account_not_found" };
    }

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = link.properties?.hashed_token;

    if (linkError || !tokenHash) {
      console.error("Unable to generate passwordless customer session", {
        userId: profile.id,
        error: linkError?.message,
      });
      return { ok: false, reason: "session_error" };
    }

    const supabase = createClient();
    const { data: verification, error: verificationError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (verificationError || verification.user?.id !== profile.id || !verification.session) {
      await supabase.auth.signOut();
      console.error("Unable to establish passwordless customer session", {
        userId: profile.id,
        error: verificationError?.message,
      });
      return { ok: false, reason: "session_error" };
    }

    return { ok: true };
  });

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
        (s.status === "active" &&
          (s.expires_at === null || new Date(s.expires_at).getTime() > now)),
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
