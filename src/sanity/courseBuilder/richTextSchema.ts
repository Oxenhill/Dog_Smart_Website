import { defineSchema } from '@portabletext/editor'

/**
 * Schema for the Course Builder's rich text editor (lesson text blocks).
 * Mirrors the block configuration on `textBlock.content` in
 * src/sanity/schemaTypes/course.ts — keep the two in sync: that file
 * defines what Studio's native array editor (and the stored documents)
 * accept, this defines what the Course Builder's own editor can produce.
 * Both need to agree on which decorator/list/annotation names are valid
 * for the same underlying `content` field, or content built in one editor
 * could look subtly wrong (or lose formatting) when opened in the other.
 */
export const richTextSchemaDefinition = defineSchema({
  styles: [{ name: 'normal', title: 'Normal' }],
  decorators: [
    { name: 'strong', title: 'Bold' },
    { name: 'em', title: 'Italic' },
    { name: 'underline', title: 'Underline' },
  ],
  annotations: [
    {
      name: 'link',
      title: 'Link',
      fields: [{ name: 'href', type: 'string', title: 'URL' }],
    },
  ],
  lists: [
    { name: 'bullet', title: 'Bulleted list' },
    { name: 'number', title: 'Numbered list' },
  ],
  inlineObjects: [],
  blockObjects: [],
})
