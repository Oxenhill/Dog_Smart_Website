import Image from "next/image";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import { COURSE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import type { CourseDetail } from "@/sanity/lib/types";
import PortableTextBody from "@/components/site/PortableTextBody";
import LessonContent from "@/components/site/LessonContent";
import { getSessionClientId, getEntitledCourses, BASE44_PORTAL_URL } from "@/lib/courseAccess";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await sanityFetch<CourseDetail | null>(COURSE_BY_SLUG_QUERY, { slug }, null);
  if (!course) return {};
  return { title: `${course.title} | Dog Smart Online Learning`, description: course.summary || undefined };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await sanityFetch<CourseDetail | null>(COURSE_BY_SLUG_QUERY, { slug }, null);
  if (!course) notFound();

  // Entitlement is checked fresh on every visit — never cached, never
  // trusted from anything the browser sends. A lesson only ever renders
  // its real content (video/text/PDF/etc.) once this comes back true, or
  // if the lesson itself is marked as a free preview.
  const clientId = await getSessionClientId();
  const entitledKeys = clientId ? await getEntitledCourses(clientId) : [];
  const isEntitled = !!course.entitlementKey && entitledKeys.includes(course.entitlementKey);

  return (
    <>
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
                    <details className="disclosure" key={mod._key} open={isEntitled}>
                      <summary>
                        {mod.title}
                        {mod.lessons ? ` (${mod.lessons.length} lesson${mod.lessons.length === 1 ? "" : "s"})` : ""}
                      </summary>
                      <div className="answer">
                        {mod.summary ? <p>{mod.summary}</p> : null}
                        {(mod.lessons || []).map((lesson) => {
                          const unlocked = !!lesson.isFreePreview || isEntitled;
                          return (
                            <div key={lesson._key} style={{ marginBlockEnd: "1.5rem" }}>
                              <p style={{ fontWeight: 600, marginBlockEnd: unlocked ? "0.5rem" : 0 }}>
                                {lesson.title}
                                {lesson.durationMinutes ? ` — ${lesson.durationMinutes} min` : ""}
                                {lesson.isFreePreview ? " (free preview)" : ""}
                              </p>
                              {unlocked ? (
                                <LessonContent blocks={lesson.content} />
                              ) : (
                                <p className="text-xs" style={{ opacity: 0.7 }}>
                                  {clientId
                                    ? "Included with a different package — get in touch if that doesn't look right."
                                    : "Log in from your account home page to watch this lesson."}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="service-sidebar">
            <div className="sidebar-card">
              {isEntitled ? (
                <>
                  <h3>Included with your package</h3>
                  <p className="text-xs">You have full access to this course.</p>
                </>
              ) : clientId ? (
                <>
                  <h3>Not included in your current package</h3>
                  <a href="/contact" className="pill solid">
                    Ask About This Course
                  </a>
                </>
              ) : (
                <>
                  <h3>{course.price || "Included with a training package"}</h3>
                  <a href={BASE44_PORTAL_URL} className="pill solid">
                    Log In To Watch
                  </a>
                  <a href="/contact" className="pill" style={{ marginBlockStart: "0.5rem" }}>
                    Ask About This Course
                  </a>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
