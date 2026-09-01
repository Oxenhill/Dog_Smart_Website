import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { PublishToggleAction } from './src/sanity/components/PublishToggleAction'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    // Adds a one-click "Publish live" / "Take offline" button to courses,
    // ahead of Studio's own default actions — see PublishToggleAction.tsx
    // for why a course needs more than just the schema's published field.
    actions: (prev, context) =>
      context.schemaType === 'course' ? [PublishToggleAction, ...prev] : prev,
  },
})
