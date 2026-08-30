import Image from "next/image";
import PortableTextBody from "@/components/site/PortableTextBody";
import type { CourseLessonContentBlock } from "@/sanity/lib/types";

// Renders one lesson's mixed content stream (video / text / PDF / external
// video link / slide image), in the order an editor arranged them in
// Sanity. Only ever called for lessons the visitor is actually allowed to
// see (a free preview, or a course they're entitled to) — this component
// itself does no access checking.
export default function LessonContent({ blocks }: { blocks?: CourseLessonContentBlock[] | null }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="lesson-content" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {blocks.map((block, i) => {
        const key = block._key || String(i);

        if (block._type === "videoBlock") {
          if (block.provider === "cloudflare_stream" && block.cloudflareVideoId) {
            return (
              <div key={key} style={{ position: "relative", paddingTop: "56.25%", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <iframe
                  src={`https://iframe.cloudflarestream.com/${block.cloudflareVideoId}`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  title={block.title || "Lesson video"}
                />
              </div>
            );
          }
          if (block.provider === "external_url" && block.externalUrl) {
            return (
              <video
                key={key}
                controls
                style={{ width: "100%", borderRadius: "var(--radius-lg)" }}
                poster={block.posterImage?.asset?.url || undefined}
              >
                <source src={block.externalUrl} />
              </video>
            );
          }
          return null;
        }

        if (block._type === "textBlock") {
          return <PortableTextBody key={key} value={block.content} />;
        }

        if (block._type === "pdfBlock") {
          if (!block.fileUrl) return null;
          return (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ position: "relative", paddingTop: "129%", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--line, #e5e5e5)" }}>
                <iframe
                  src={`${block.fileUrl}${block.preventDownload ? "#toolbar=0" : ""}`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  title={block.title || "PDF"}
                />
              </div>
              {block.preventDownload ? null : (
                <a href={block.fileUrl} target="_blank" rel="noreferrer" className="pill" style={{ alignSelf: "flex-start" }}>
                  Download: {block.title}
                </a>
              )}
            </div>
          );
        }

        if (block._type === "youtubeEmbedBlock") {
          return block.url ? (
            <a key={key} href={block.url} target="_blank" rel="noreferrer" className="pill" style={{ alignSelf: "flex-start" }}>
              {block.title || "Watch video"} ↗
            </a>
          ) : null;
        }

        if (block._type === "imageSlideBlock") {
          return block.image?.asset?.url ? (
            <figure key={key} className="photo-frame" style={{ position: "relative", aspectRatio: "16/10", borderRadius: "var(--radius-lg)" }}>
              <Image src={block.image.asset.url} alt={block.caption || ""} fill sizes="(max-width: 760px) 100vw, 700px" />
              {block.caption ? (
                <figcaption className="text-xs" style={{ marginTop: "0.5rem" }}>
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null;
        }

        return null;
      })}
    </div>
  );
}
