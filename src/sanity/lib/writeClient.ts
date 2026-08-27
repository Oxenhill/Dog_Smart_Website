import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

/**
 * Server-only write client. Requires a SANITY_API_WRITE_TOKEN environment
 * variable — an "Editor" token created at sanity.io/manage → this project
 * → API → Tokens — which is deliberately NOT prefixed with NEXT_PUBLIC_, so
 * it's only ever readable on the server.
 *
 * Never import this file from a 'use client' component.
 */
export const sanityWriteConfigured = Boolean(process.env.SANITY_API_WRITE_TOKEN)

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'published',
})
