import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BT - Blindtest",
    short_name: "BT",
    description: "Web app mobile-first de blindtest musical.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050611",
    theme_color: "#050611",
    orientation: "portrait",
    categories: ["music", "games", "entertainment"],
    icons: [
      {
        src: "/icons/bt-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/bt-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/bt-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
