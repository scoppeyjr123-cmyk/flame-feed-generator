import { redirect } from "@tanstack/react-router";

import { getCustomerSession } from "../supabase/auth-server-fns";

export async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session.authenticated) throw redirect({ to: "/login", search: { redirect: "/app" } });
  return session;
}
