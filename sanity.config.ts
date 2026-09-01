import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { PublishChangesAction, TakeOfflineAction } from './src/sanity/components/PublishToggleAction'
import { CourseBuilderTool } from './src/sanity/courseBuilder/CourseBuilderTool'
import { BookIcon } from './src/sanity/courseBuilder/icons'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    // Adds two one-click buttons to courses, ahead of Studio's own default
    // actions: "Publish changes"/"Publish live" (primary) pushes an edit
    // live without taking the course offline first, and "Take offline"
    // (secondary, in the "…" menu) flips it back off — see
    // PublishToggleAction.tsx for why a course needs more than just the
    // schema's published field.
    actions: (prev, context) =>
      context.schemaType === 'course' ? [PublishChangesAction, TakeOfflineAction, ...prev] : prev,
  },
  tools: (prev) => [
    ...prev,
    {
      name: 'course-builder',
      title: 'Course Builder',
      icon: BookIcon,
      component: CourseBuilderTool,
    },
  ],
})
