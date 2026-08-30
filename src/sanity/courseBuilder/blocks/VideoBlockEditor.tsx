import { useRef } from 'react'
import type { SanityClient } from 'sanity'
import { Box, Button, Card, Flex, Label, Select, Stack, Text } from '@sanity/ui'
import { useCloudflareStreamUpload } from '../../lib/useCloudflareStreamUpload'
import { BlurTextField } from '../FieldEditors'
import type { BuilderVideoBlock } from '../types'

/**
 * Reuses the exact same Cloudflare Stream upload flow as the native
 * `cloudflareVideoId` field (see ../../lib/useCloudflareStreamUpload.ts) —
 * this is the one block type with real upload complexity behind it, so
 * nothing here reimplements that.
 */
export function VideoBlockEditor({
  client,
  block,
  onSetField,
}: {
  client: SanityClient
  block: BuilderVideoBlock
  onSetField: (field: string, value: unknown) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { state, progress, errorMessage, handleFile } = useCloudflareStreamUpload((uid) => {
    onSetField('cloudflareVideoId', uid)
  })
  const busy = state === 'requesting' || state === 'uploading'
  const provider = block.provider ?? 'cloudflare_stream'

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onPosterSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const asset = await client.assets.upload('image', file, { filename: file.name })
    onSetField('posterImage', { _type: 'image', asset: { _type: 'reference', _ref: asset._id } })
  }

  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Label size={1}>Title (optional)</Label>
        <BlurTextField value={block.title ?? ''} onCommit={(v) => onSetField('title', v)} placeholder="Video title" />
      </Stack>

      <Stack gap={2}>
        <Label size={1}>Video source</Label>
        <Select
          value={provider}
          onChange={(e) => {
            const next = e.currentTarget.value as BuilderVideoBlock['provider']
            onSetField('provider', next)
          }}
        >
          <option value="cloudflare_stream">Cloudflare Stream</option>
          <option value="external_url">External URL (temporary, during migration)</option>
        </Select>
      </Stack>

      {provider === 'cloudflare_stream' ? (
        <Stack gap={2}>
          {block.cloudflareVideoId ? (
            <Card padding={3} radius={2} shadow={1} tone={state === 'error' ? 'critical' : 'positive'}>
              <Stack gap={3}>
                <Text size={1}>
                  Video ID: <code>{block.cloudflareVideoId}</code>
                </Text>
                <Box style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe
                    src={`https://iframe.cloudflarestream.com/${block.cloudflareVideoId}`}
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
          {state === 'processing' ? <Text size={1}>Processing on Cloudflare — will be ready shortly.</Text> : null}
          {errorMessage ? (
            <Text size={1} style={{ color: 'var(--card-critical-fg-color, #c00)' }}>
              {errorMessage}
            </Text>
          ) : null}

          <Flex gap={2}>
            <Button
              mode="ghost"
              text={block.cloudflareVideoId ? 'Replace video' : 'Upload video'}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            />
          </Flex>
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onFileSelected} />
        </Stack>
      ) : (
        <Stack gap={2}>
          <Label size={1}>External video URL</Label>
          <BlurTextField
            value={block.externalUrl ?? ''}
            onCommit={(v) => onSetField('externalUrl', v)}
            placeholder="https://…"
          />
        </Stack>
      )}

      <Stack gap={2}>
        <Label size={1}>Poster image (optional)</Label>
        {block.posterImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.posterImageUrl} alt="" style={{ maxWidth: 220, borderRadius: 4 }} />
        ) : null}
        <Box>
          <input type="file" accept="image/*" onChange={onPosterSelected} />
        </Box>
      </Stack>
    </Stack>
  )
}
