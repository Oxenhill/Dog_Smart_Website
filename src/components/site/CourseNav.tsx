"use client";

import { useEffect, useMemo, useState } from "react";
import { readProgress, subscribeToProgress } from "@/lib/courseProgress";

export type CourseNavLesson = { key: string; title: string; locked: boolean };
export type CourseNavModule = { key: string; title: string; lessons: CourseNavLesson[] };

/**
 * A floating "course menu" — collapsed to a small pill by default so it
 * never competes with the lesson content itself, expanding into a full-
 * height panel with jump links to every module/lesson, a completion count,
 * and a quick-access list of anything starred with "Save for the field".
 *
 * Fixed-position rather than a sidebar column so it drops into the course
 * page layout unchanged and behaves the same on mobile, where a client is
 * most likely to actually be using this — checking a lesson off, or
 * reopening a saved one — mid-session with their dog.
 */
export default function CourseNav({ courseSlug, modules }: { courseSlug: string; modules: CourseNavModule[] }) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(() => readProgress(courseSlug));

  useEffect(() => {
    const sync = () => setProgress(readProgress(courseSlug));
    sync();
    return subscribeToProgress(courseSlug, sync);
  }, [courseSlug]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const { totalLessons, completedCount, bookmarkedLessons } = useMemo(() => {
    const unlocked = modules.flatMap((m) => m.lessons.filter((l) => !l.locked));
    const titleByKey = new Map(unlocked.map((l) => [l.key, l.title]));
    return {
      totalLessons: unlocked.length,
      completedCount: unlocked.filter((l) => progress.completed.includes(l.key)).length,
      bookmarkedLessons: progress.bookmarked
        .filter((k) => titleByKey.has(k))
        .map((k) => ({ key: k, title: titleByKey.get(k)! })),
    };
  }, [modules, progress]);

  if (totalLessons === 0) return null;

  const closeAndJump = () => setOpen(false);

  return (
    <>
      {open ? (
        <button type="button" aria-label="Close course menu" className="course-nav-backdrop" onClick={() => setOpen(false)} />
      ) : null}
      <div className="course-nav" data-open={open}>
        <button type="button" className="course-nav-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "Close" : "Course menu"}
          {!open ? <span className="course-nav-toggle-count">{completedCount}/{totalLessons}</span> : null}
        </button>
        <div className="course-nav-panel" role="dialog" aria-label="Course navigation" hidden={!open}>
          <div className="course-nav-progress">
            <div className="course-nav-progress-bar">
              <span style={{ width: `${totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0}%` }} />
            </div>
            <p>{completedCount} of {totalLessons} lessons done</p>
          </div>

          {bookmarkedLessons.length > 0 ? (
            <div className="course-nav-section">
              <h4>Saved for the field</h4>
              <ul>
                {bookmarkedLessons.map((l) => (
                  <li key={l.key}>
                    <a href={`#lesson-${l.key}`} onClick={closeAndJump}>★ {l.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="course-nav-section">
            <h4>All content</h4>
            {modules.map((mod) => (
              <div className="course-nav-module" key={mod.key}>
                <a href={`#module-${mod.key}`} onClick={closeAndJump}>{mod.title}</a>
                <ul>
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.key}>
                      <a href={lesson.locked ? undefined : `#lesson-${lesson.key}`} aria-disabled={lesson.locked} onClick={lesson.locked ? undefined : closeAndJump}>
                        {lesson.locked ? "🔒 " : progress.completed.includes(lesson.key) ? "✓ " : ""}
                        {lesson.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
