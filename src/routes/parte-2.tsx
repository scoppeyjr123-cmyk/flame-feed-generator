import { createFileRoute } from "@tanstack/react-router";
import { ConversionPage } from "./oferta";
import {
  getPublicPartTwoSettings,
  getPublicPlans,
  getPublishedCatalog,
  type PartTwoSettings,
  type PublicPlan,
} from "../lib/public/server-fns";
import conversionCss from "../conversion.css?url";

export const Route = createFileRoute("/parte-2")({
  loader: async () => {
    const [plans, catalog, partTwo] = await Promise.all([
      getPublicPlans(),
      getPublishedCatalog(),
      getPublicPartTwoSettings(),
    ]);
    return { plans: plans.plans, series: catalog.series, partTwo };
  },
  head: () => ({
    meta: [
      { title: "Parte 2 — a história continua | Feed Loves" },
      {
        name: "description",
        content: "Continue a história no Feed Loves e conheça os planos para assistir mais.",
      },
    ],
    links: [
      { rel: "stylesheet", href: conversionCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Anton&display=swap" },
    ],
  }),
  component: PartTwoRoute,
});

export function PartTwoPage({
  plans,
  series,
  partTwo,
}: {
  plans: PublicPlan[];
  series: Awaited<ReturnType<typeof getPublishedCatalog>>["series"];
  partTwo: PartTwoSettings;
}) {
  return <ConversionPage plans={plans} series={series} video={partTwo} isPartTwo />;
}

function PartTwoRoute() {
  const data = Route.useLoaderData();
  return <PartTwoPage plans={data.plans} series={data.series} partTwo={data.partTwo} />;
}
