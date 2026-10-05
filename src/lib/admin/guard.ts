import { redirect } from "@tanstack/react-router";

import { getAdminSession } from "../supabase/auth-server-fns";

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session.isAdmin) {
    throw redirect({ to: "/admin/login" });
  }

  return { admin: session.user };
}
