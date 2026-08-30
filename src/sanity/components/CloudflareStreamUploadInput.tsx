import { useRef } from 'react'
import { Button, Card, Flex, Stack, Text, Box } from '@sanity/ui'
import { set, unset, type StringInputProps } from 'sanity'
import { useCloudflareStreamUpload } from '../lib/useCloudflareStreamUpload'

/**
 * Replaces the plain "paste the video ID" text field on a video block's
 * `cloudflareVideoId` (see ../schemaTypes/course.ts) with a real upload
 * button. Oliver picks a file, it goes straight to Cloudflare Stream over
 * a resumable (TUS) upload — so a flaky home connection can resume rather
 * than restart — and the video ID gets set automatically once it's done.
 * No more manually uploading in the Cloudflare dashboard and copying a UID
 * across by hand.
 *
 * The upload flow itself lives in ../lib/useCloudflareStreamUpload.ts,
 * shared with the Course Builder tool's own video block editor — this
 * component is just that hook wired up to Sanity's native form field
 * `onChange`/`PatchEvent` API instead of a direct patch call.
 */

export function CloudflareStreamUploadInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const inputRef = useRef<HTMLInputElement>(null)

  const { state, progress, errorMessage, handleFile } = useCloudflareStreamUpload((uid) => {
    onChange(set(uid))
  })

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const busy = state === 'requesting' || state === 'uploading'

  return (
    <Stack gap={3}>
      {value ? (
        <Card padding={3} radius={2} shadow={1} tone={state === 'error' ? 'critical' : 'positive'}>
          <Stack gap={3}>
            <Text size={1}>
              Video ID: <code>{value}</code>
            </Text>
            <Box style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src={`https://iframe.cloudflarestream.com/${value}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            </Box>
          </Stack>
        </Card>
      ) : null}

      {state === 'requesting' ? <Text size={1}>Starting upload…</Text> : null}
      {state === 'uploading' ? <Text size={1}>Uploading… {progress}%</Text> : null}
      {state === 'processing' ? (
        <Text size={1}>Uploaded — Cloudflare is processing the video now, it&apos;ll be ready to play shortly (this box will update itself).</Text>
      ) : null}
      {state === 'ready' ? <Text size={1}>Ready to play.</Text> : null}
      {errorMessage ? (
        <Text size={1} style={{ color: 'var(--card-critical-fg-color, #c00)' }}>
          {errorMessage}
        </Text>
      ) : null}

      <Flex gap={2}>
        <Button
          mode="ghost"
          text={value ? 'Replace video' : 'Upload video'}
          disabled={readOnly || busy}
          onClick={() => inputRef.current?.click()}
        />
        {value ? (
          <Button mode="bleed" tone="critical" text="Remove" disabled={readOnly || busy} onClick={() => onChange(unset())} />
        ) : null}
      </Flex>
      <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onFileSelected} />
    </Stack>
  )
}
