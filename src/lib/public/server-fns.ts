import { createServerFn } from "@tanstack/react-start";

import { createClient } from "../supabase/server";
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
