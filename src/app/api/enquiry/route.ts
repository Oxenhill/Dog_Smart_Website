import { NextRequest, NextResponse } from "next/server";
import { writeClient, sanityWriteConfigured } from "@/sanity/lib/writeClient";

// Handles submissions from the /contact page form. Writes directly to
// Sanity as an `enquiry` document (visible to Oliver in the Studio) — no
// third-party email service wired up yet, so this is the honest
// "actually works right now" version rather than a form that silently
// goes nowhere. Works with plain HTML form POSTs (no JS required) and
// with fetch()-based progressive enhancement.
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const topic = String(formData.get("topic") || "").trim();
  const message = String(formData.get("message") || "").trim();
  // Honeypot field — real visitors never fill this in; bots usually do.
  const honeypot = String(formData.get("website") || "").trim();

  const wantsJson = request.headers.get("accept")?.includes("application/json");

  if (honeypot) {
    // Silently pretend success so bots don't learn anything.
    return wantsJson
      ? NextResponse.json({ ok: true })
      : NextResponse.redirect(new URL("/contact?sent=1", request.url), 303);
  }

  if (!name || !email || !message) {
    const msg = "Name, email and message are required.";
    return wantsJson
      ? NextResponse.json({ ok: false, error: msg }, { status: 400 })
      : NextResponse.redirect(new URL("/contact?error=1", request.url), 303);
  }

  if (!sanityWriteConfigured) {
    console.error("Enquiry received but SANITY_API_WRITE_TOKEN is not configured:", { name, email });
    return wantsJson
      ? NextResponse.json({ ok: false, error: "Not configured" }, { status: 500 })
      : NextResponse.redirect(new URL("/contact?error=1", request.url), 303);
  }

  try {
    await writeClient.create({
      _type: "enquiry",
      name,
      email,
      phone: phone || undefined,
      topic: topic || undefined,
      message,
      status: "New",
      submittedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to write enquiry to Sanity:", err);
    return wantsJson
      ? NextResponse.json({ ok: false, error: "Failed to submit" }, { status: 500 })
      : NextResponse.redirect(new URL("/contact?error=1", request.url), 303);
  }

  return wantsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/contact?sent=1", request.url), 303);
}
