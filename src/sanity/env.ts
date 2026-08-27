export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export const dataset = assertValue(process.env.NEXT_PUBLIC_SANITY_DATASET)

export const projectId = assertValue(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)

// Set to true once the Sanity project exists and content should come live
// from the CMS. Until then, pages fall back to local placeholder content
// so the site still renders a complete, on-brand preview.
const PLACEHOLDER_VALUES = new Set(['placeholder-project-id', 'your-project-id', ''])

export const sanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    !PLACEHOLDER_VALUES.has(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
)

// Unlike the upstream Sanity template this is adapted from, this never
// throws — it falls back to a placeholder so the app can render with
// placeholder content before a real Sanity project is connected. Callers
// should check `sanityConfigured` before relying on the value being real.
function assertValue<T>(v: T | undefined): T {
  if (v === undefined) {
    return 'placeholder-project-id' as unknown as T
  }
  return v
}
