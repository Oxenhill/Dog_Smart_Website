import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'galleryItem',
  title: 'Gallery Photos',
  type: 'document',
  description: 'Powers the "Gallery" page — one entry per photo.',
  fields: [
    defineField({ name: 'title', title: 'Title / caption (optional)', type: 'string' }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['Puppy Classes', 'General Training', 'Gundog Training', 'Behaviour Support', 'The Dog Smart Family', 'Events'] },
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'category', media: 'image' } },
})
