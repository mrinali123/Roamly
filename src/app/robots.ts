import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/url";

const appUrl = getBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth/signup", "/auth/signin"],
        disallow: ["/dashboard", "/trips/", "/profile", "/api/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
