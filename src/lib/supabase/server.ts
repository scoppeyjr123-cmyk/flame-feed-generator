import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

export function createClient() {
  return createServerClient<Database>(
    process.env["VITE_SUPABASE_URL"] ?? "",
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "",
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
        },
        setAll(cookies, headers) {
          cookies.forEach(({ name, value, options }) => setCookie(name, value, options));
          Object.entries(headers).forEach(([name, value]) => setResponseHeader(name, value));
        },
      },
    },
  );
}

export type ServerSupabaseClient = SupabaseClient<Database>;
