import Image from "next/image";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import { COURSE_BY_SLUG_QUERY_PREVIEW } from "@/sanity/lib/queries";
import type { CourseDetail } from "@/sanity/lib/types";
import PortableTextBody from "@/components/site/PortableTextBody";
import LessonContent from "@/components/site/LessonContent";
import CourseNav from "@/components/site/CourseNav";
import LessonProgressControls from "@/components/site/LessonProgressControls";

/**
 * Admin-only mirror of ../[slug]/page.tsx: renders a course exactly as a
 * fully-entitled client would see it — every module open, every lesson's
 * real content showing — without needing a real Base44 login, a "free
 * preview" toggle on every lesson, or the course being published yet.
 *
 * Gated by proxy.ts (same Basic Auth as /studio). isEntitled is hardcoded
 * true here ONLY — this file has no bearing on the real entitlement check
 * in ../[slug]/page.tsx, which still asks Base44 fresh on every visit.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await sanityFetch<CourseDetail | null>(COURSE_BY_SLUG_QUERY_PREVIEW, { slug }, null);
  if (!course) return {};
  return { title: `Preview: ${course.title}`, robots: { index: false, follow: false } };
}

export default async function CoursePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await sanityFetch<CourseDetail | null>(COURSE_BY_SLUG_QUERY_PREVIEW, { slug }, null);
  if (!course) notFound();

  const navModules = (course.modules || []).map((mod) => ({
    key: mod._key,
    title: mod.title,
    lessons: (mod.lessons || []).map((lesson) => ({ key: lesson._key, title: lesson.title, locked: false })),
  }));

  return (
    <>
      <div style={{ background: "#111", color: "#fff", padding: "0.6rem 1.5rem", textAlign: "center", fontSize: "0.875rem" }}>
        Preview mode — this is what a fully-entitled client sees. Not a public page.
        {course.published === false ? " This course is still a draft." : ""}
      </div>

      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">Online Learning</p>
          <h1>{course.title}</h1>
          {course.summary ? <p className="lede">{course.summary}</p> : null}
        </div>
      </section>

      {course.coverImage?.asset?.url ? (
        <section className="container">
          <div className="service-hero photo-frame">
            <Image src={course.coverImage.asset.url} alt="" fill sizes="100vw" priority />
          </div>
        </section>
      ) : null}

      <div className="container">
        <div className="service-detail-layout">
          <div>
            <PortableTextBody value={course.description} />

            {course.modules && course.modules.length > 0 ? (
              <div className="faq-groups" style={{ paddingBlockEnd: 0 }}>
                <div className="faq-category">
                  <h2>Course content</h2>
                  {course.modules.map((mod) => (
                    <details className="disclosure" key={mod._key} id={`module-${mod._key}`} open style={{ scrollMarginTop: "1.25rem" }}>
                      <summary>
                        {mod.title}
                        {mod.lessons ? ` (${mod.lessons.length} lesson${mod.lessons.length === 1 ? "" : "s"})` : ""}
                      </summary>
                      <div className="answer">
                        {mod.summary ? <p>{mod.summary}</p> : null}
                        {(mod.lessons || []).map((lesson, lessonIndex) => (
                          <div key={lesson._key} id={`lesson-${lesson._key}`} className="lesson-block" style={{ scrollMarginTop: "1.25rem" }}>
                            <p className="lesson-heading">
                              <span className="lesson-number">Lesson {lessonIndex + 1}</span>
                              {lesson.title}
                              {lesson.durationMinutes ? ` — ${lesson.durationMinutes} min` : ""}
                              {lesson.isFreePreview ? " (free preview)" : ""}
                            </p>
                            <LessonContent blocks={lesson.content} />
                            <LessonProgressControls courseSlug={`preview-${slug}`} lessonKey={lesson._key} />
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ opacity: 0.7 }}>No modules added yet.</p>
            )}

            <p className="text-xs" style={{ opacity: 0.7, marginBlockStart: "2rem" }}>
              (In real life, a client only sees this once entitled — see{" "}
              <a href={`/online-learning/${course.slug}`}>the real page</a> for what a logged-out or not-yet-entitled
              visitor sees instead.)
            </p>
          </div>

          <aside className="service-sidebar">
            <CourseNav courseSlug={`preview-${slug}`} modules={navModules} />
          </aside>
        </div>
      </div>
    </>
  );
}
