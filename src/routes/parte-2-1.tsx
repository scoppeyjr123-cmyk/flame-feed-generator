import { createFileRoute } from "@tanstack/react-router";
import { PartTwoPage } from "./parte-2";
import { getPublicPartTwoVariantSettings, getPublicPlans } from "../lib/public/server-fns";

export const Route = createFileRoute("/parte-2-1")({
  loader: async () => { const [plans, partTwo] = await Promise.all([getPublicPlans(), getPublicPartTwoVariantSettings({ data: "partTwoCopy1" })]); return { plans: plans.plans, partTwo }; },
  head: () => ({ meta: [{ title: "Parte 2 — versão 1 | Feed Loves" }] }),
  component: () => { const data = Route.useLoaderData(); return <PartTwoPage plans={data.plans} partTwo={data.partTwo} />; },
});
