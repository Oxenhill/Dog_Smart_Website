import { NextRequest, NextResponse } from "next/server";

/**
 * Gates Sanity Studio (/studio), the Cloudflare Stream upload API
 * (/api/cloudflare-stream/*), and the admin course preview
 * (/online-learning/preview/*) behind a single shared username/password,
 * prompted by the browser's own native Basic Auth dialog.
 *
 * Sanity's own project login already stops a stranger from actually
 * reading or writing content once inside Studio, but the upload API has
 * no auth of its own at all — without this, anyone who found the URL
 * could mint real Cloudflare Stream uploads on Oliver's account. Gating
 * /studio too means there's exactly one login prompt, not a surprise
 * second one the first time someone tries to upload a video. The course
 * preview route needs the same gate for a different reason: it renders
 * full course content (including unpublished drafts) as if the visitor
 * were a fully-entitled client, bypassing the real Base44 entitlement
 * check entirely — that must never be reachable by an actual visitor.
 *
 * If STUDIO_BASIC_AUTH_USER/PASS aren't set (e.g. a preview deploy that
 * hasn't had them configured yet), this deliberately falls open rather
 * than locking everyone out by accident — Sanity's login is still there
 * as the real gate on content itself.
 *
 * Named `proxy.ts` (not `middleware.ts`) and exports `proxy` (not
 * `middleware`) — Next.js 16 renamed the middleware convention; see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 * The matcher config below is unchanged by that rename.
 */
export function proxy(request: NextRequest) {
  const expectedUser = process.env.STUDIO_BASIC_AUTH_USER;
  const expectedPass = process.env.STUDIO_BASIC_AUTH_PASS;

  if (!expectedUser || !expectedPass) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const suppliedUser = separatorIndex === -1 ? decoded : decoded.slice(0, separatorIndex);
    const suppliedPass = separatorIndex === -1 ? "" : decoded.slice(separatorIndex + 1);
    if (suppliedUser === expectedUser && suppliedPass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Studio", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/studio/:path*", "/api/cloudflare-stream/:path*", "/online-learning/preview/:path*"],
};
