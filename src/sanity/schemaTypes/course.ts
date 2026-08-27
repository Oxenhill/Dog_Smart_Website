import { defineField, defineType, defineArrayMember } from 'sanity'

/**
 * Powers the built-in "Online Learning" area — replaces the Teachable
 * courses (Pup Smart, Life Skills, Behaviour Toolbox). Each course is made
 * of modules, and each module is made of lessons (video and/or text).
 * Access control (who has paid for what) is handled separately in the
 * application layer — this schema only holds the course CONTENT.
 */
const lesson = defineArrayMember({
  type: 'object',
  name: 'lesson',
  title: 'Lesson',
  fields: [
    defineField({ name: 'title', title: 'Lesson title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL (optional)',
      type: 'url',
      description: 'A link to the hosted video for this lesson (e.g. Vimeo/YouTube unlisted link, or a Mux/Cloudflare Stream URL).',
    }),
    defineField({
      name: 'body',
      title: 'Written content',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'durationMinutes', title: 'Duration (minutes, optional)', type: 'number' }),
    defineField({
      name: 'isFreePreview',
      title: 'Free preview lesson?',
      type: 'boolean',
      initialValue: false,
      description: 'Turn on to let anyone watch/read this lesson without buying the course — useful for a taster lesson.',
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
  description: 'Powers the "Online Learning" area — the paid video/text courses.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
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
      title: 'Price (e.g. "£49")',
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
      description: 'Keep off while you\'re still building a course; switch on when it\'s ready for the public listing.',
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'price', media: 'coverImage', published: 'published' },
    prepare({ title, subtitle, media, published }) {
      return { title, subtitle: published === false ? `Draft — ${subtitle ?? ''}` : subtitle, media }
    },
  },
})
