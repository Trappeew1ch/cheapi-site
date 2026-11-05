import type { MetadataRoute } from "next";
import { PUBLIC_MODELS } from "@/lib/models";
import { POSTS, BLOG_TAGS } from "@/content/blog";
import { SITE } from "@/lib/site";

const UPDATED = new Date("2026-11-02");
const BASE = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/pricing`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/pricing.txt`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE}/llms.txt`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE}/models`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/benchmarks`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/api-gpt`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/api-claude`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/docs`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/codex`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/claude-code`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/integrations`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/editorial`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/status`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE}/contacts`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/offer`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refund`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/security`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];

  const modelPages: MetadataRoute.Sitemap = PUBLIC_MODELS.map((model) => ({
    url: `${BASE}/models/${model.id}`,
    lastModified: UPDATED,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postPages: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const tagPages: MetadataRoute.Sitemap = BLOG_TAGS.map((tag) => ({
    url: `${BASE}/blog/tag/${tag.slug}`,
    lastModified: UPDATED,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...modelPages, ...postPages, ...tagPages];
}
