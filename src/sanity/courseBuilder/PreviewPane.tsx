import { useState } from 'react'
import { Box, Card, Flex, Text } from '@sanity/ui'

/**
 * Shows the real `/online-learning/preview/[slug]` route (the same
 * admin-only, fully-entitled-view route already built for manual preview)
 * in an iframe, anchored to whichever module/lesson is selected. Same
 * origin + same Basic Auth realm as /studio, so the browser tab that's
 * already authenticated for Studio doesn't get re-prompted here.
 *
 * Reloads after each patch commits (debounced — see CourseBuilderTool.tsx,
 * which bumps `reloadToken`), rather than anything fancier — a plain
 * reload is a perfectly good v1 for "watch the course develop as I build
 * it", and the preview route's own query is fetched with no caching (see
 * the `revalidate: 0` used on that route) specifically so a reload always
 * shows the change that was just made, not a stale cached copy.
 */
export function PreviewPane({
  slug,
  anchor,
  reloadToken,
}: {
  slug: string | null
  anchor: string | null
  reloadToken: number
}) {
  const src = slug ? `/online-learning/preview/${encodeURIComponent(slug)}${anchor ? `#${anchor}` : ''}` : null

  if (!src) {
    return (
      <Card padding={4} height="fill">
        <Flex align="center" justify="center" style={{ height: '100%' }}>
          <Text muted size={1}>
            Pick a course to see its live preview here.
          </Text>
        </Flex>
      </Card>
    )
  }

  // Keyed by src+reloadToken so a new instance mounts (with `ready` starting
  // fresh at `false`) on every reload, instead of an effect resetting
  // `ready` on an existing instance.
  return <PreviewFrame key={`${src}::${reloadToken}`} src={src} />
}

function PreviewFrame({ src }: { src: string }) {
  const [ready, setReady] = useState(false)
  return (
    <Box style={{ position: 'relative', height: '100%' }}>
      {!ready ? (
        <Flex align="center" justify="center" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <Text muted size={1}>
            Loading preview…
          </Text>
        </Flex>
      ) : null}
      <iframe
        src={src}
        title="Course preview"
        onLoad={() => setReady(true)}
        style={{ width: '100%', height: '100%', border: 0, background: '#fff' }}
      />
    </Box>
  )
}
