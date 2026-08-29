import { NextRequest, NextResponse } from "next/server";

/**
 * Polled by the Studio's upload component (see
 * src/sanity/components/CloudflareStreamUploadInput.tsx) right after a
 * video finishes uploading, so it can show "processing" until Cloudflare
 * has actually finished encoding it and it's real to play.
 */
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid query param is required" }, { status: 400 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !apiToken) {
    return NextResponse.json({ error: "Video uploads are not configured on this site yet." }, { status: 500 });
  }

  let cfRes: Response;
  try {
    cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
  } catch (err) {
    console.error("Cloudflare Stream status lookup failed to send", err);
    return NextResponse.json({ error: "Could not reach Cloudflare Stream" }, { status: 502 });
  }

  if (!cfRes.ok) {
    return NextResponse.json({ error: "Cloudflare Stream lookup failed" }, { status: 502 });
  }

  const data = await cfRes.json();
  const result = data?.result;

  return NextResponse.json({
    state: result?.status?.state ?? "unknown",
    readyToStream: !!result?.readyToStream,
    thumbnail: result?.thumbnail ?? null,
    durationSeconds: typeof result?.duration === "number" ? result.duration : null,
  });
}
