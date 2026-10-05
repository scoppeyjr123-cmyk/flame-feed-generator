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
