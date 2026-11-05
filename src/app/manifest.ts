import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — все AI-модели по одному ключу`,
    short_name: SITE.name,
    description: SITE.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ec",
    theme_color: "#0b1f16",
    lang: "ru",
    categories: ["developer tools", "productivity", "utilities"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
