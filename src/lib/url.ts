const PRODUCTION_URL = "https://navoryn-pied.vercel.app";

/**
 * Returns the app base URL for the current environment.
 *
 * Client-side: always uses window.location.origin — correct in any environment
 * without depending on env vars.
 *
 * Server-side without a request object (sitemap, robots): uses VERCEL_URL (set
 * automatically by Vercel for every deployment), then NEXT_PUBLIC_APP_URL (only
 * if it is not a localhost value — guards against accidentally copying .env.local
 * into Vercel's environment variables), then the hardcoded production URL.
 *
 * For server-side API routes that have a NextRequest, prefer deriving the origin
 * from new URL(request.url).origin instead of calling this function.
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !appUrl.includes("localhost")) return appUrl;
  return PRODUCTION_URL;
}
