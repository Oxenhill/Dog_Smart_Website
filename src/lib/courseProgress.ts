// Per-browser course progress: which lessons a client has marked done, and
// which they've starred to find again quickly ("in the field with their
// dog"). Deliberately client-only (localStorage) rather than synced to
// Base44 — it needs to ship fast for Oliver's Teachable migration, works
// offline/on flaky signal (no network round-trip to check a box), and
// doesn't touch the entitlement system at all. Trade-off worth knowing: it
// doesn't follow a client across devices/browsers, only within one. If that
// ever matters enough, the natural next step is a Base44 entity keyed by
// clientId — this module is the one place that would change.
"use client";

export type CourseProgressState = {
  completed: string[];
  bookmarked: string[];
};

const STORAGE_PREFIX = "courseProgress:v1:";
export const COURSE_PROGRESS_EVENT = "course-progress-changed";

const EMPTY: CourseProgressState = { completed: [], bookmarked: [] };

function storageKey(courseSlug: string) {
  return `${STORAGE_PREFIX}${courseSlug}`;
}

export function readProgress(courseSlug: string): CourseProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(courseSlug));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      completed: Array.isArray(parsed?.completed) ? parsed.completed : [],
      bookmarked: Array.isArray(parsed?.bookmarked) ? parsed.bookmarked : [],
    };
  } catch {
    // Private browsing, corrupted value, storage disabled — fail quiet.
    return EMPTY;
  }
}

function writeProgress(courseSlug: string, state: CourseProgressState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(courseSlug), JSON.stringify(state));
  } catch {
    // Quota exceeded or storage disabled — the toggle just won't persist.
  }
  // Same-tab listeners (native "storage" events only fire in OTHER tabs).
  window.dispatchEvent(new CustomEvent(COURSE_PROGRESS_EVENT, { detail: { courseSlug } }));
}

export function toggleLessonCompleted(courseSlug: string, lessonKey: string) {
  const state = readProgress(courseSlug);
  const completed = state.completed.includes(lessonKey)
    ? state.completed.filter((k) => k !== lessonKey)
    : [...state.completed, lessonKey];
  writeProgress(courseSlug, { ...state, completed });
}

export function toggleLessonBookmarked(courseSlug: string, lessonKey: string) {
  const state = readProgress(courseSlug);
  const bookmarked = state.bookmarked.includes(lessonKey)
    ? state.bookmarked.filter((k) => k !== lessonKey)
    : [...state.bookmarked, lessonKey];
  writeProgress(courseSlug, { ...state, bookmarked });
}

/** Re-runs `callback` whenever this course's progress changes — same tab (custom event) or another tab/device sharing the browser (native "storage" event). Returns an unsubscribe function. */
export function subscribeToProgress(courseSlug: string, callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handleCustom = (e: Event) => {
    const detail = (e as CustomEvent<{ courseSlug?: string }>).detail;
    if (!detail || detail.courseSlug === courseSlug) callback();
  };
  const handleStorage = (e: StorageEvent) => {
    if (!e.key || e.key === storageKey(courseSlug)) callback();
  };
  window.addEventListener(COURSE_PROGRESS_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(COURSE_PROGRESS_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}
