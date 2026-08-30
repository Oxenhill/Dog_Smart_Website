// Shared types for the Course Builder Studio tool. Deliberately separate
// from the site's own `src/lib/queries.ts` / `src/sanity/lib/types.ts`
// types — those describe the *site's* read shape (dereferenced image URLs
// via urlForImage, published-only filtering, etc). This file describes the
// raw editable shape the builder itself works with: it fetches its own
// GROQ query (see `queries.ts` in this folder) that dereferences just
// enough (asset URLs for thumbnails/filenames) to render a compact
// editing UI, while every mutation is a narrow, `_key`-based Sanity patch
// against the real document — never a whole-document overwrite.

export type PortableTextBlock = {
  _key: string
  _type: 'block'
  style?: string
  markDefs?: unknown[]
  children: { _key: string; _type: 'span'; text: string; marks?: string[] }[]
}

export type BuilderVideoBlock = {
  _key: string
  _type: 'videoBlock'
  title?: string
  provider?: 'cloudflare_stream' | 'external_url'
  cloudflareVideoId?: string
  externalUrl?: string
  posterImageUrl?: string
}

export type BuilderTextBlock = {
  _key: string
  _type: 'textBlock'
  content?: PortableTextBlock[]
}

export type BuilderPdfBlock = {
  _key: string
  _type: 'pdfBlock'
  title?: string
  preventDownload?: boolean
  fileUrl?: string
  fileName?: string
}

export type BuilderYoutubeBlock = {
  _key: string
  _type: 'youtubeEmbedBlock'
  title?: string
  url?: string
}

export type BuilderImageSlideBlock = {
  _key: string
  _type: 'imageSlideBlock'
  caption?: string
  imageUrl?: string
}

export type BuilderContentBlock =
  | BuilderVideoBlock
  | BuilderTextBlock
  | BuilderPdfBlock
  | BuilderYoutubeBlock
  | BuilderImageSlideBlock

export type BuilderContentBlockType = BuilderContentBlock['_type']

export type BuilderLesson = {
  _key: string
  title: string
  durationMinutes?: number
  isFreePreview?: boolean
  content?: BuilderContentBlock[]
}

export type BuilderModule = {
  _key: string
  title: string
  summary?: string
  lessons?: BuilderLesson[]
}

export type BuilderCourse = {
  _id: string
  _rev: string
  title: string
  slug: string
  published?: boolean
  modules?: BuilderModule[]
}

export type CourseListItem = {
  _id: string
  title: string
  slug: string
  published?: boolean
}

export const CONTENT_BLOCK_TYPE_LABELS: Record<BuilderContentBlockType, string> = {
  videoBlock: 'Video',
  textBlock: 'Text',
  pdfBlock: 'PDF',
  youtubeEmbedBlock: 'YouTube / external link',
  imageSlideBlock: 'Slide image',
}
