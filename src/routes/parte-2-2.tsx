import { createFileRoute } from "@tanstack/react-router";
import { PartTwoPage } from "./parte-2";
import {
  getPublicPartTwoVariantSettings,
  getPublicPlans,
  getPublishedCatalog,
} from "../lib/public/server-fns";
import conversionCss from "../conversion.css?url";

const PartTwoCopy2Page = () => {
  const data = Route.useLoaderData();
  return <PartTwoPage plans={data.plans} series={data.series} partTwo={data.partTwo} />;
};

export const Route = createFileRoute("/parte-2-2")({
  loader: async () => {
    const [plans, catalog, partTwo] = await Promise.all([
      getPublicPlans(),
      getPublishedCatalog(),
      getPublicPartTwoVariantSettings({ data: "partTwoCopy2" }),
    ]);
    return { plans: plans.plans, series: catalog.series, partTwo };
  },
  head: () => ({
    meta: [{ title: "Parte 2 — versão 2 | Feed Loves" }],
    links: [
      { rel: "stylesheet", href: conversionCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Anton&display=swap" },
    ],
  }),
  component: PartTwoCopy2Page,
});
