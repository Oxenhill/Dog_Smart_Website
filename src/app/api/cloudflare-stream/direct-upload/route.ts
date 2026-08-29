import { NextRequest, NextResponse } from "next/server";

/**
 * Mints a one-time, resumable (TUS) upload URL for a video going straight
 * into Cloudflare Stream, so the "Upload video" button in Sanity Studio
 * (see src/sanity/components/CloudflareStreamUploadInput.tsx) never needs
 * the real Cloudflare API token in the browser — it comes here first.
 *
 * Gated by proxy.ts (Basic Auth) alongside /studio itself, since this
 * mints real Cloudflare Stream storage/minutes on every call and has no
 * other access control of its own.
 *
 * See https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/
 * for the TUS-based direct-upload flow this implements.
 */
export async function POST(request: NextRequest) {
  let body: { filename?: string; fileSize?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { filename, fileSize } = body;
  if (!filename || !fileSize || typeof fileSize !== "number" || fileSize <= 0) {
    return NextResponse.json({ error: "filename and a positive fileSize are required" }, { status: 400 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !apiToken) {
    console.error("Cloudflare Stream upload requested but CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_STREAM_API_TOKEN is not configured");
    return NextResponse.json({ error: "Video uploads are not configured on this site yet." }, { status: 500 });
  }

  const nameB64 = Buffer.from(filename, "utf-8").toString("base64");

  let cfRes: Response;
  try {
    cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": String(fileSize),
        "Upload-Metadata": `name ${nameB64}`,
      },
    });
  } catch (err) {
    console.error("Cloudflare Stream direct_upload request failed to send", err);
    return NextResponse.json({ error: "Could not reach Cloudflare Stream" }, { status: 502 });
  }

  if (!cfRes.ok) {
    const text = await cfRes.text().catch(() => "");
    console.error("Cloudflare Stream direct_upload returned an error", cfRes.status, text);
    return NextResponse.json({ error: "Cloudflare Stream rejected the upload request" }, { status: 502 });
  }

  const uploadURL = cfRes.headers.get("Location");
  const uid = cfRes.headers.get("stream-media-id");

  if (!uploadURL || !uid) {
    console.error("Cloudflare Stream direct_upload response missing Location/stream-media-id headers");
    return NextResponse.json({ error: "Unexpected response from Cloudflare Stream" }, { status: 502 });
  }

  return NextResponse.json({ uploadURL, uid });
}
