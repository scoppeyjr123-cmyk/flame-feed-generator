import { createFileRoute } from "@tanstack/react-router";
import { ConversionPage } from "./oferta";
import {
  getPublicOffer2Plans,
  getPublicOffer2Settings,
  getPublishedCatalog,
} from "../lib/public/server-fns";
import conversionCss from "../conversion.css?url";

export const Route = createFileRoute("/oferta-2")({
  loader: async () => {
    const [planResult, catalogResult, video] = await Promise.all([
      getPublicOffer2Plans(),
      getPublishedCatalog(),
      getPublicOffer2Settings(),
    ]);

    return {
      plans: planResult.plans,
      series: catalogResult.series,
      video,
    };
  },
  head: () => ({
    meta: [
      { title: "Assine Feed Loves | Doramas, séries turcas e novelinhas" },
      {
        name: "description",
        content:
          "Escolha seu plano Feed Loves e assista doramas, séries turcas e novelinhas dubladas e legendadas em um só lugar.",
      },
      { property: "og:title", content: "Sua próxima maratona começa no Feed Loves" },
      {
        property: "og:description",
        content: "Conheça o catálogo e escolha seu plano para assistir quando quiser.",
      },
    ],
    links: [
      { rel: "stylesheet", href: conversionCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
      },
    ],
  }),
  component: Offer2Route,
});

function Offer2Route() {
  return <ConversionPage {...Route.useLoaderData()} />;
}
