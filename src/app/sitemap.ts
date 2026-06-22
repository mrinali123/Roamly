import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: appUrl, lastModified: new Date(), priority: 1 },
    { url: `${appUrl}/auth/signup`, lastModified: new Date(), priority: 0.8 },
    { url: `${appUrl}/auth/signin`, lastModified: new Date(), priority: 0.7 },
  ];
}
