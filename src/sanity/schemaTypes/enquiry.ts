import { defineField, defineType } from 'sanity'

/**
 * Submissions from the /contact page form. Written server-side by
 * src/app/api/enquiry/route.ts using the write client — visitors never
 * touch Sanity directly. Read-only from the front end's point of view;
 * Oliver reviews and actions these from the Studio.
 */
export default defineType({
  name: 'enquiry',
  title: 'Contact Enquiries',
  type: 'document',
  description: 'Submissions from the Contact page form.',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'phone', title: 'Phone (optional)', type: 'string' }),
    defineField({
      name: 'topic',
      title: 'What is this about?',
      type: 'string',
      options: {
        list: ['Puppy Support', 'General Dog Training', 'Gundog Training', 'Behaviour Support', 'Online Learning', 'Something else'],
      },
    }),
    defineField({ name: 'message', title: 'Message', type: 'text', rows: 6, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['New', 'Replied', 'Archived'] },
      initialValue: 'New',
    }),
    defineField({ name: 'submittedAt', title: 'Submitted', type: 'datetime', readOnly: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'message', status: 'status' },
    prepare({ title, subtitle, status }) {
      return { title: `${status === 'New' ? '🟠 ' : ''}${title}`, subtitle }
    },
  },
})
