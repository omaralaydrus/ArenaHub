import { NextRequest, NextResponse } from "next/server";
import { SandboxRequestError, sandboxGet } from "@core/http/sandbox.gateway";
import { ALLOWED_PATHS, sandboxQuery } from "@core/http/sandbox.policy";

/**
 * Same-origin proxy for every sandbox read. The browser calls
 * `/api/sandbox/zones?offset=0&limit=50`; this handler adds the bearer token
 * and forwards to the real sandbox.
 *
 * Why a proxy rather than calling the sandbox from the browser:
 *   1. The credential stays on the server. The sandbox rules assume it will
 *      leak eventually; shipping it in a JS bundle guarantees it.
 *   2. No CORS negotiation with the license host.
 *   3. One place to enforce the allowlist below.
 */

/**
 * Read paths this template exposes. An allowlist, not a passthrough: a bug in
 * a client component must not be able to reach a path this app has not
 * deliberately published. Extend it when the sandbox spec grows.
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const target = path.join("/");

  if (!ALLOWED_PATHS.has(target)) {
    return NextResponse.json(
      {
        message: `Unknown sandbox path '${target}'.`,
        allowed: [...ALLOWED_PATHS],
      },
      { status: 404 },
    );
  }

  // Forward only the documented paging params; anything else is dropped
  // rather than passed through to the upstream query string.
  let search: string;
  try {
    search = sandboxQuery(request.nextUrl.searchParams);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400 },
    );
  }
  if (
    ![
      "SANDBOX_CLIENT_ID",
      "SANDBOX_CLIENT_SECRET",
      "SANDBOX_USERNAME",
      "SANDBOX_PASSWORD",
    ].every((key) => process.env[key])
  ) {
    return NextResponse.json(
      {
        code: "SANDBOX_NOT_CONFIGURED",
        message:
          "Council references are not configured. Add the sandbox credentials to the server’s .env.local file.",
      },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json(await sandboxGet(target, search), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof SandboxRequestError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
          retryAfterSeconds: error.retryAfterSeconds,
        },
        {
          status: error.status,
          headers:
            error.status === 429 && error.retryAfterSeconds
              ? { "Retry-After": String(error.retryAfterSeconds) }
              : undefined,
        },
      );
    }
    // Configuration failures (missing env, unreachable host) land here.
    return NextResponse.json(
      {
        message:
          "The council connection is unavailable. Check the server’s sandbox configuration and try again.",
        code: "SANDBOX_UNAVAILABLE",
      },
      { status: 502 },
    );
  }
}
