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
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T
): Promise<T> {
  if (!sanityConfigured) return fallback
  try {
    const data = await client.fetch<T>(query, params, {
      next: { revalidate: 60 },
    })
    if (data === null || data === undefined) return fallback
    if (Array.isArray(data) && data.length === 0) return fallback
    return data
  } catch (err) {
    console.error('Sanity fetch failed, using fallback content:', err)
    return fallback
  }
}
