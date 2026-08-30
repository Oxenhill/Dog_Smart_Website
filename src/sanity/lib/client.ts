import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, sanityConfigured } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})

/**
 * Safe query wrapper: if Sanity hasn't been connected yet (no real project
 * ID set), returns `fallback` instead of throwing, so pages always render.
 *
 * `revalidate` defaults to the usual 60s ISR-style caching. The
 * Course Builder's live preview pane (/online-learning/preview/[slug])
 * passes `revalidate: 0` instead — it's a Basic-Auth-gated admin route with
 * no real traffic to cache for, and a reload after a builder save needs to
 * show that save immediately, not whatever was cached up to a minute ago.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T,
  options: { revalidate?: number } = {}
): Promise<T> {
  if (!sanityConfigured) return fallback
  try {
    const data = await client.fetch<T>(query, params, {
      next: { revalidate: options.revalidate ?? 60 },
    })
    if (data === null || data === undefined) return fallback
    if (Array.isArray(data) && data.length === 0) return fallback
    return data
  } catch (err) {
    console.error('Sanity fetch failed, using fallback content:', err)
    return fallback
  }
}
