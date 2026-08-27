import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'policy',
  title: 'Policy Pages',
  type: 'document',
  description: 'Long-form pages such as Privacy Policy, Terms & Conditions.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'updatedAt', title: 'Last updated', type: 'date' }),
  ],
  preview: { select: { title: 'title' } },
})
