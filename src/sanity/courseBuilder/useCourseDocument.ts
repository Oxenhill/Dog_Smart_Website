import { useCallback, useEffect, useRef, useState } from 'react'
import type { SanityClient } from 'sanity'
import { COURSE_BUILDER_DETAIL_QUERY } from './queries'
import type { BuilderCourse } from './types'

/**
 * Loads one course document for the builder and keeps it in sync with the
 * real dataset: an initial fetch, then a realtime `listen()` subscription
 * that re-fetches the full document (debounced) whenever anything changes
 * it — our own patches included, which is deliberate. It's the same
 * "read-modify-write against the latest document" principle as the patch
 * functions in patches.ts, just for reads: this component never trusts a
 * local copy for longer than it has to, so a concurrent edit (Oliver in
 * two tabs, or a native Studio edit alongside the builder) shows up here
 * rather than getting silently overwritten later by a stale patch.
 *
 * Individual field editors are still safe to use while a refetch lands —
 * see the field editor components, which only read their initial value
 * once per mount (keyed by the module/lesson/block `_key`) rather than
 * re-syncing from props on every render, so an in-progress keystroke is
 * never clobbered by a refetch triggered by an unrelated action elsewhere
 * in the tree.
 */
export function useCourseDocument(client: SanityClient, courseId: string | null) {
  const [course, setCourse] = useState<BuilderCourse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clears `course` the moment `courseId` goes null (the picker's "Select a
  // course…" placeholder option) — done here, during render, rather than as
  // a setState call at the top of the effect below, so the effect body
  // stays pure "subscribe to an external system" (the fetch + listener),
  // which is all a `useEffect` should be doing.
  const [syncedCourseId, setSyncedCourseId] = useState(courseId)
  if (courseId !== syncedCourseId) {
    setSyncedCourseId(courseId)
    if (!courseId) setCourse(null)
  }

  const refetch = useCallback(async () => {
    if (!courseId) return
    try {
      const doc = await client.fetch<BuilderCourse | null>(COURSE_BUILDER_DETAIL_QUERY, { id: courseId })
      setCourse(doc)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course')
    }
  }, [client, courseId])

  useEffect(() => {
    if (!courseId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const doc = await client.fetch<BuilderCourse | null>(COURSE_BUILDER_DETAIL_QUERY, { id: courseId })
        if (!cancelled) setCourse(doc)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load course')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    const subscription = client
      .listen(`*[_id == $id]`, { id: courseId }, { events: ['mutation'], visibility: 'query' })
      .subscribe({
        next: () => {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => {
            if (!cancelled) refetch()
          }, 400)
        },
        error: () => {
          // Listener connections can drop (network blip, tab backgrounded).
          // Not fatal — the builder still works from the last-known state,
          // and every mutation it makes re-fetches on success anyway.
        },
      })

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
      subscription.unsubscribe()
    }
  }, [client, courseId, refetch])

  return { course, loading, error, refetch }
}
