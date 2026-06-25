import { getBaseUrl } from "@/lib/url";

export function generateShareToken(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url").slice(0, 12);
}

export function getShareUrl(token: string): string {
  return `${getBaseUrl()}/share/${token}`;
}
