import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
