/// <reference types="vite/client" />

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      import.meta.env["VITE_SUPABASE_URL"],
      import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
    );
  }

  return browserClient;
}
