import { NextRequest } from "next/server";
import { logger, requestContext, generateRequestId } from "./logger";

// Re-export the per-request helpers so route files only need one import.
export { getLog, getRequestId } from "./logger";

// ---------------------------------------------------------------------------
// withLogger — Higher-Order Function for Next.js App Router handlers
// ---------------------------------------------------------------------------
// Design rationale:
// • Each API route handler is wrapped once at module load time.  No runtime
//   registration or middleware stack is required.
// • A new requestId is generated per invocation and stored in AsyncLocalStorage
//   so every log call inside the handler (including nested db helpers or stream
//   callbacks) automatically carries the requestId — without threading it
//   through every function argument.
// • The HOF measures wall-clock time from request receipt to response object
//   creation.  For streaming responses the reported duration is TTFB (time to
//   first byte), not the total transfer time; the stream's own logs record the
//   end-of-stream timing.
// • An x-request-id header is added to every response so the client/browser
//   can include it in bug reports and it can be correlated with server logs.
// • Unhandled throws (programming errors that escape the route handler) are
//   caught, logged with a full stack trace, and re-thrown so Next.js can
//   return its default 500 page.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (req: NextRequest, ctx: any) => Promise<Response>;

export function withLogger(route: string, handler: AnyHandler): AnyHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: NextRequest, ctx: any): Promise<Response> => {
    const requestId = generateRequestId();
    const path = new URL(req.url).pathname;
    const log = logger.child({ requestId, route });
    const start = performance.now();

    log.info({ method: req.method, path }, "request");

    return requestContext.run({ requestId, log }, async () => {
      try {
        const res = await handler(req, ctx);

        const ms = Math.round(performance.now() - start);
        log.info({ status: res.status, ms }, "response");

        // Propagate requestId to the client.  For streaming bodies we create a
        // new Response with the same ReadableStream reference — the body itself
        // is untouched; only the headers object changes.
        const headers = new Headers(res.headers);
        headers.set("x-request-id", requestId);
        return new Response(res.body, { status: res.status, headers });
      } catch (err) {
        const ms = Math.round(performance.now() - start);
        log.error({ err, ms }, "unhandled error");
        throw err;
      }
    });
  };
}
