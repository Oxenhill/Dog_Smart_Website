import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Card, Flex, Stack, Text, Box } from '@sanity/ui'
import { set, unset, type StringInputProps } from 'sanity'
import * as tus from 'tus-js-client'

/**
 * Replaces the plain "paste the video ID" text field on a video block's
 * `cloudflareVideoId` (see ../schemaTypes/course.ts) with a real upload
 * button. Oliver picks a file, it goes straight to Cloudflare Stream over
 * a resumable (TUS) upload — so a flaky home connection can resume rather
 * than restart — and the video ID gets set automatically once it's done.
 * No more manually uploading in the Cloudflare dashboard and copying a UID
 * across by hand.
 *
 * The actual Cloudflare API token never reaches the browser: this only
 * ever talks to our own /api/cloudflare-stream/* routes, which are the
 * ones holding the real credentials (see those route files, and
 * proxy.ts for how they're gated).
 */

type UploadState = 'idle' | 'requesting' | 'uploading' | 'processing' | 'ready' | 'error'

export function CloudflareStreamUploadInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const pollUntilReady = useCallback((uid: string) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/cloudflare-stream/status?uid=${encodeURIComponent(uid)}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.readyToStream) {
          setState('ready')
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // Transient — the next tick will try again. Not worth surfacing
        // as an error, the upload itself already succeeded.
      }
    }, 4000)
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      setErrorMessage(null)
      setProgress(0)
      setState('requesting')

      try {
        const res = await fetch('/api/cloudflare-stream/direct-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, fileSize: file.size }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `Could not start the upload (${res.status})`)
        }
        const { uploadURL, uid } = (await res.json()) as { uploadURL: string; uid: string }

        setState('uploading')

        await new Promise<void>((resolve, reject) => {
          const upload = new tus.Upload(file, {
            uploadUrl: uploadURL,
            chunkSize: 50 * 1024 * 1024,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            metadata: { filename: file.name, filetype: file.type },
            onError: (err) => reject(err),
            onProgress: (bytesSent, bytesTotal) => {
              setProgress(Math.round((bytesSent / bytesTotal) * 100))
            },
            onSuccess: () => resolve(),
          })
          upload.start()
        })

        onChange(set(uid))
        setState('processing')
        pollUntilReady(uid)
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
        setState('error')
      }
    },
    [onChange, pollUntilReady]
  )

  const onFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile]
  )

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
