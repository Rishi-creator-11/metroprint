import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/products`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/request-quote`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
