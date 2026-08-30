import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/client";
import { COURSES_QUERY_PREVIEW } from "@/sanity/lib/queries";
import type { CourseSummary } from "@/sanity/lib/types";

/**
 * Admin-only preview of the course catalogue — shows every `course`
 * document regardless of its `published` flag, so Oliver can see what a
 * course looks like while he's still building it in Studio, without
 * needing a real Base44 login or a "free preview" lesson toggle.
 *
 * Gated by proxy.ts (same Basic Auth as /studio) — never linked from
 * anywhere public, and excluded from search engines. See
 * preview/[slug]/page.tsx for the course detail equivalent, which is
 * where the actual "view it as an entitled client" behaviour lives (this
 * page just lists what's there to preview).
 */
export const metadata = {
  title: "Course preview (admin only)",
  robots: { index: false, follow: false },
};

// This route always fetches with `revalidate: 0` (see sanityFetch's
// options param) because it's an admin-only page that must never show
// stale content. Next's static analysis at build time can't see that — it
// prerenders the route as static, then throws "Page changed from static
// to dynamic at runtime" the moment a live request hits the revalidate:0
// fetch. Forcing the whole route dynamic here (never attempted to
// prerender in the first place) keeps the runtime behaviour consistent
// with the build-time one.
export const dynamic = "force-dynamic";

export default async function OnlineLearningPreviewIndex() {
  const courses = await sanityFetch<CourseSummary[]>(COURSES_QUERY_PREVIEW, {}, [], { revalidate: 0 });

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">Admin preview — not a public page</p>
          <h1>Course preview</h1>
          <p className="lede">
            Every course in Studio, published or not. Open one to see exactly what a fully-entitled client would
            see — real content unlocked, no logging in required.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: "4rem" }}>
        {courses.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.7 }}>
            No course documents exist in Studio yet — create one and it&apos;ll show up here.
          </p>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <Link href={`/online-learning/preview/${course.slug}`} className="course-card" key={course._id}>
                {course.coverImage?.asset?.url ? (
                  <div className="photo-frame" style={{ aspectRatio: "16/10", borderRadius: "var(--radius-lg)" }}>
                    <Image src={course.coverImage.asset.url} alt="" fill sizes="(max-width: 760px) 100vw, 340px" />
                  </div>
                ) : null}
                <span className="status-tag">{course.published ? "Published" : "Draft — not visible to real clients yet"}</span>
                <h3>{course.title}</h3>
                {course.summary ? <p>{course.summary}</p> : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
