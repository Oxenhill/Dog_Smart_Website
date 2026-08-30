import { defineField, defineType, defineArrayMember } from 'sanity'
import { CloudflareStreamUploadInput } from '../components/CloudflareStreamUploadInput'

/**
 * Powers the built-in "Online Learning" area — replaces the Teachable
 * courses (Pup Smart, Life Skills, Behaviour Toolbox). Each course is made
 * of modules, and each module is made of lessons. A lesson's content is a
 * mixed, ordered list of blocks (video / text / PDF / YouTube-style link /
 * slide image) rather than a single video-plus-text field, since the real
 * Teachable content mixes these freely within one lesson.
 *
 * Access control (who has paid for what) is handled separately in the
 * application layer, driven by `entitlementKey` below — this schema only
 * holds the course CONTENT.
 */

const videoBlock = defineArrayMember({
  type: 'object',
  name: 'videoBlock',
  title: 'Video',
  fields: [
    defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
    defineField({
      name: 'provider',
      title: 'Video source',
      type: 'string',
      options: {
        list: [
          { title: 'Cloudflare Stream', value: 'cloudflare_stream' },
          { title: 'External URL (e.g. a direct link during migration)', value: 'external_url' },
        ],
        layout: 'radio',
      },
      initialValue: 'cloudflare_stream',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cloudflareVideoId',
      title: 'Video',
      type: 'string',
      description: 'Upload the video here and this fills in automatically — only edit by hand if you already have a Cloudflare Stream video UID to reuse.',
      hidden: ({ parent }) => parent?.provider !== 'cloudflare_stream',
      components: { input: CloudflareStreamUploadInput },
    }),
    defineField({
      name: 'externalUrl',
      title: 'External video URL',
      type: 'url',
      description: 'A direct video URL to use temporarily during migration, before it has a Cloudflare Stream home.',
      hidden: ({ parent }) => parent?.provider !== 'external_url',
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster image (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'provider' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Video', subtitle }),
  },
})

const textBlock = defineArrayMember({
  type: 'object',
  name: 'textBlock',
  title: 'Text',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      const firstText = content?.[0]?.children?.map((c: { text?: string }) => c.text).join('') || 'Text block'
      return { title: firstText.slice(0, 60) }
    },
  },
})

const pdfBlock = defineArrayMember({
  type: 'object',
  name: 'pdfBlock',
  title: 'PDF download',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'file',
      title: 'PDF file',
      type: 'file',
      options: { accept: 'application/pdf' },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({ title: title || 'PDF download' }),
  },
})

const youtubeEmbedBlock = defineArrayMember({
  type: 'object',
  name: 'youtubeEmbedBlock',
  title: 'YouTube / external video link',
  fields: [
    defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
      description: "For linking to someone else's video (credit their material) — not for hosting your own course video, use the Video block for that.",
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'url' },
    prepare: ({ title, subtitle }) => ({ title: title || 'External video link', subtitle }),
  },
})

const imageSlideBlock = defineArrayMember({
  type: 'object',
  name: 'imageSlideBlock',
  title: 'Slide image',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' }),
  ],
  preview: {
    select: { media: 'image', title: 'caption' },
    prepare: ({ media, title }) => ({ title: title || 'Slide', media }),
  },
})

const lesson = defineArrayMember({
  type: 'object',
  name: 'lesson',
  title: 'Lesson',
  fields: [
    defineField({ name: 'title', title: 'Lesson title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'durationMinutes', title: 'Duration (minutes, optional)', type: 'number' }),
    defineField({
      name: 'isFreePreview',
      title: 'Free preview lesson?',
      type: 'boolean',
      initialValue: false,
      description: "Turn on to let anyone view this lesson's content without being logged in or entitled — useful for a taster lesson.",
    }),
    defineField({
      name: 'content',
      title: 'Lesson content',
      type: 'array',
      of: [videoBlock, textBlock, pdfBlock, youtubeEmbedBlock, imageSlideBlock],
      description: 'Mix and match, in any order — a lesson can have a video, some text, a PDF handout and slide images all in the same lesson.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'durationMinutes' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? `${subtitle} min` : undefined }
    },
  },
})

const module_ = defineArrayMember({
  type: 'object',
  name: 'module',
  title: 'Module',
  fields: [
    defineField({ name: 'title', title: 'Module title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'summary', title: 'Module summary (optional)', type: 'text', rows: 2 }),
    defineField({ name: 'lessons', title: 'Lessons', type: 'array', of: [lesson] }),
  ],
  preview: {
    select: { title: 'title', lessons: 'lessons' },
    prepare({ title, lessons }) {
      return { title, subtitle: `${(lessons ?? []).length} lesson(s)` }
    },
  },
})

export default defineType({
  name: 'course',
  title: 'Courses (Online Learning)',
  type: 'document',
  description: 'Powers the "Online Learning" area — the video/text courses included with training packages.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'entitlementKey',
      title: 'Entitlement key (links to the booking system)',
      type: 'string',
      options: {
        list: [
          { title: 'Pup Smart', value: 'pup_smart' },
          { title: 'Life Skills', value: 'life_skills' },
          { title: 'Behaviour Toolbox', value: 'behaviour_toolbox' },
        ],
      },
      description: 'Which entitlement flag in the booking system unlocks this course. This is not tied to any single package — in the booking system, turn on the matching "includes access to the [this course] on the new online learning platform" toggle on every package and session type that should unlock it (Settings → Packages/Session Types), and all of them will grant access. Must match exactly — this is how the site decides whether someone can see the real lesson content versus just the syllabus. (The gundog course lives on Briarrose Gundogs, not here, so it is not offered as an option on this site.)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'summary', title: 'Short summary (used in listings)', type: 'text', rows: 3 }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'price',
      title: 'Price (e.g. "£49") — optional, only relevant if a course is ever sold standalone',
      type: 'string',
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [module_],
    }),
    defineField({
      name: 'published',
      title: 'Published — visible on the site?',
      type: 'boolean',
      initialValue: false,
      description: "Keep off while you're still building a course; switch on when it's ready for the public listing.",
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'entitlementKey', media: 'coverImage', published: 'published' },
    prepare({ title, subtitle, media, published }) {
      return { title, subtitle: published === false ? `Draft — ${subtitle ?? ''}` : subtitle, media }
    },
  },
})
