import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { CourseBuilderTool } from './src/sanity/courseBuilder/CourseBuilderTool'
import { BookIcon } from './src/sanity/courseBuilder/icons'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
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
