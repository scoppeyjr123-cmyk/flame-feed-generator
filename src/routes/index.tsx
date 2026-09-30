import { createFileRoute } from "@tanstack/react-router";
import originalMarkup from "../feed-loves-original.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Feed Loves | Doramas, séries e histórias para se apaixonar" },
      { name: "description", content: "Descubra romances, doramas, séries turcas e novelinhas para a sua próxima maratona no Feed Loves." },
      { property: "og:title", content: "Feed Loves | Histórias para se apaixonar" },
      { property: "og:description", content: "Um universo de doramas, séries e histórias para a sua próxima maratona." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <div dangerouslySetInnerHTML={{ __html: originalMarkup }} />;
}
