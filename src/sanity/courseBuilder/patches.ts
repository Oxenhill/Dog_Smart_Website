import type { SanityClient } from 'sanity'
import { randomKey } from './keys'
import type { BuilderContentBlockType } from './types'

/**
 * Every mutation the Course Builder tool makes goes through here, and every
 * one of them is a narrow, `_key`-based patch against the real document —
 * never a whole-document overwrite from local state. This matters because
 * this is Oliver's live, in-progress course data: a patch that only ever
 * touches the specific module/lesson/block it names can't silently clobber
 * something else that changed in the meantime (a slow client, a concurrent
 * edit, a native Studio edit made in another tab).
 *
 * `unset` + `insert`/`append`/`prepend` operations within a single
 * `.commit()` call are applied in order, against the document as mutated by
 * the earlier operations in that same call — so "remove this lesson from
 * module A, then insert it into module B" is one atomic transaction, not a
 * read-then-write race. If Sanity rejects it (e.g. a sibling `_key` no
 * longer exists because someone else deleted it first), the whole
 * transaction is rejected atomically — nothing partial gets written, and
 * the caller's catch block should trigger a refetch to resync.
 */

const COMMIT_OPTS = { returnDocuments: false } as const

function modulePath(moduleKey: string) {
  return `modules[_key=="${moduleKey}"]`
}
function lessonsPath(moduleKey: string) {
  return `${modulePath(moduleKey)}.lessons`
}
function lessonPath(moduleKey: string, lessonKey: string) {
  return `${lessonsPath(moduleKey)}[_key=="${lessonKey}"]`
}
function contentPath(moduleKey: string, lessonKey: string) {
  return `${lessonPath(moduleKey, lessonKey)}.content`
}
function contentBlockPath(moduleKey: string, lessonKey: string, blockKey: string) {
  return `${contentPath(moduleKey, lessonKey)}[_key=="${blockKey}"]`
}

/**
 * Removes an item from one keyed array location (if `unsetPath` is given)
 * and (re)inserts it into another (or the same) keyed array, either right
 * before a named sibling `_key`, or at the end of the array when
 * `beforeKey` is null. Used for every reorder/move: reordering modules,
 * reordering lessons within a module, and moving a lesson into a different
 * module.
 */
async function moveKeyedItem(
  client: SanityClient,
  docId: string,
  opts: {
    unsetPath?: string
    arrayPath: string
    beforeKey: string | null
    item: Record<string, unknown>
  }
) {
  let patch = client.patch(docId)
  if (opts.unsetPath) patch = patch.unset([opts.unsetPath])
  patch = patch.setIfMissing({ [opts.arrayPath]: [] })
  patch = opts.beforeKey
    ? patch.insert('before', `${opts.arrayPath}[_key=="${opts.beforeKey}"]`, [opts.item])
    : patch.append(opts.arrayPath, [opts.item])
  return patch.commit(COMMIT_OPTS)
}

// ---- Modules ----------------------------------------------------------

export async function addModule(client: SanityClient, docId: string) {
  const _key = randomKey()
  const mod = { _key, _type: 'module', title: 'New module', lessons: [] }
  await client.patch(docId).setIfMissing({ modules: [] }).append('modules', [mod]).commit(COMMIT_OPTS)
  return _key
}

export async function deleteModule(client: SanityClient, docId: string, moduleKey: string) {
  return client.patch(docId).unset([modulePath(moduleKey)]).commit(COMMIT_OPTS)
}

export async function setModuleField(
  client: SanityClient,
  docId: string,
  moduleKey: string,
  field: 'title' | 'summary',
  value: string
) {
  return client.patch(docId).set({ [`${modulePath(moduleKey)}.${field}`]: value }).commit(COMMIT_OPTS)
}

/** Reorders a module within the course's top-level `modules` array. */
export async function moveModule(
  client: SanityClient,
  docId: string,
  moduleKey: string,
  moduleSnapshot: Record<string, unknown>,
  beforeKey: string | null
) {
  return moveKeyedItem(client, docId, {
    unsetPath: modulePath(moduleKey),
    arrayPath: 'modules',
    beforeKey,
    item: moduleSnapshot,
  })
}

// ---- Lessons ------------------------------------------------------------

export async function addLesson(client: SanityClient, docId: string, moduleKey: string) {
  const _key = randomKey()
  const lesson = { _key, _type: 'lesson', title: 'New lesson', content: [] }
  await client
    .patch(docId)
    .setIfMissing({ [lessonsPath(moduleKey)]: [] })
    .append(lessonsPath(moduleKey), [lesson])
    .commit(COMMIT_OPTS)
  return _key
}

export async function deleteLesson(client: SanityClient, docId: string, moduleKey: string, lessonKey: string) {
  return client.patch(docId).unset([lessonPath(moduleKey, lessonKey)]).commit(COMMIT_OPTS)
}

export async function setLessonField(
  client: SanityClient,
  docId: string,
  moduleKey: string,
  lessonKey: string,
  field: 'title' | 'durationMinutes' | 'isFreePreview',
  value: string | number | boolean | undefined
) {
  const path = `${lessonPath(moduleKey, lessonKey)}.${field}`
  if (value === undefined || value === '') {
    return client.patch(docId).unset([path]).commit(COMMIT_OPTS)
  }
  return client.patch(docId).set({ [path]: value }).commit(COMMIT_OPTS)
}

/**
 * Moves a lesson to a (possibly different) module, at a specific position.
 * This is the operation native Sanity array editing can't do — dragging a
 * lesson out of one module's array into another's — since it needs to
 * unset from one array and insert into a different one in the same atomic
 * patch.
 */
export async function moveLesson(
  client: SanityClient,
  docId: string,
  fromModuleKey: string,
  lessonKey: string,
  lessonSnapshot: Record<string, unknown>,
  toModuleKey: string,
  beforeKey: string | null
) {
  return moveKeyedItem(client, docId, {
    unsetPath: lessonPath(fromModuleKey, lessonKey),
    arrayPath: lessonsPath(toModuleKey),
    beforeKey,
    item: lessonSnapshot,
  })
}

// ---- Content blocks -------------------------------------------------------

function emptyBlock(_type: BuilderContentBlockType, _key: string): Record<string, unknown> {
  switch (_type) {
    case 'videoBlock':
      return { _key, _type, provider: 'cloudflare_stream' }
    case 'textBlock':
      return { _key, _type, content: [] }
    case 'pdfBlock':
      return { _key, _type, preventDownload: false }
    case 'youtubeEmbedBlock':
      return { _key, _type }
    case 'imageSlideBlock':
      return { _key, _type }
  }
}

export async function addContentBlock(
  client: SanityClient,
  docId: string,
  moduleKey: string,
  lessonKey: string,
  type: BuilderContentBlockType
) {
  const _key = randomKey()
  const block = emptyBlock(type, _key)
  const path = contentPath(moduleKey, lessonKey)
  await client.patch(docId).setIfMissing({ [path]: [] }).append(path, [block]).commit(COMMIT_OPTS)
  return _key
}

export async function deleteContentBlock(
  client: SanityClient,
  docId: string,
  moduleKey: string,
  lessonKey: string,
  blockKey: string
) {
  return client.patch(docId).unset([contentBlockPath(moduleKey, lessonKey, blockKey)]).commit(COMMIT_OPTS)
}

export async function moveContentBlock(
  client: SanityClient,
  docId: string,
  moduleKey: string,
  lessonKey: string,
  blockKey: string,
  blockSnapshot: Record<string, unknown>,
  beforeKey: string | null
) {
  return moveKeyedItem(client, docId, {
    unsetPath: contentBlockPath(moduleKey, lessonKey, blockKey),
    arrayPath: contentPath(moduleKey, lessonKey),
    beforeKey,
    item: blockSnapshot,
  })
}

/** Sets (or, if `value` is undefined, unsets) a single field on one content block. */
export async function setContentBlockField(
  client: SanityClient,
  docId: string,
  moduleKey: string,
  lessonKey: string,
  blockKey: string,
  field: string,
  value: unknown
) {
  const path = `${contentBlockPath(moduleKey, lessonKey, blockKey)}.${field}`
  if (value === undefined) {
    return client.patch(docId).unset([path]).commit(COMMIT_OPTS)
  }
  return client.patch(docId).set({ [path]: value }).commit(COMMIT_OPTS)
}
