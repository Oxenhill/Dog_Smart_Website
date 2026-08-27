import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Reviews',
  type: 'document',
  description: 'Powers the "Reviews" page. One with "Feature on homepage" turned on also appears in the homepage quote band.',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'clientName', title: 'Client name', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'dogName', title: 'Dog name (optional)', type: 'string' }),
    defineField({
      name: 'rating',
      title: 'Star rating (optional)',
      type: 'number',
      options: { list: [1, 2, 3, 4, 5], layout: 'radio' },
      validation: (Rule) => Rule.min(1).max(5).integer(),
    }),
    defineField({ name: 'photo', title: 'Photo (optional)', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'source',
      title: 'Where this came from',
      type: 'string',
      options: { list: ['Google', 'Facebook', 'Submitted via website', 'Direct / other'] },
    }),
    defineField({ name: 'sourceUrl', title: 'Link to the original (optional)', type: 'url' }),
    defineField({ name: 'approved', title: 'Approved — show on site?', type: 'boolean', initialValue: true }),
    defineField({ name: 'featured', title: 'Feature on homepage?', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'clientName', subtitle: 'quote', approved: 'approved' },
    prepare({ title, subtitle, approved }) {
      return { title, subtitle: approved === false ? `⏳ Awaiting approval — ${subtitle}` : subtitle }
    },
  },
})
