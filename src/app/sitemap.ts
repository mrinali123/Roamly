import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/url";

const appUrl = getBaseUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: appUrl, lastModified: new Date(), priority: 1 },
    { url: `${appUrl}/auth/signup`, lastModified: new Date(), priority: 0.8 },
    { url: `${appUrl}/auth/signin`, lastModified: new Date(), priority: 0.7 },
  ];
}
