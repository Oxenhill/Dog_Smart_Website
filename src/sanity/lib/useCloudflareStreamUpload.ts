import { useCallback, useEffect, useRef, useState } from 'react'
import * as tus from 'tus-js-client'

/**
 * The direct-to-Cloudflare-Stream resumable (TUS) upload flow, extracted
 * from CloudflareStreamUploadInput.tsx so it has exactly one implementation
 * shared by both call sites: the native Sanity `cloudflareVideoId` field
 * input (CloudflareStreamUploadInput, which wraps this hook) and the Course
 * Builder tool's own video block editor (see
 * ../courseBuilder/blocks/VideoBlockEditor.tsx), which needs the same
 * upload behaviour but writes the result via a direct Sanity patch instead
 * of Sanity's form `onChange`/`PatchEvent` machinery.
 *
 * The actual Cloudflare API token never reaches the browser either way —
 * this only ever talks to our own /api/cloudflare-stream/* routes.
 */

export type CloudflareUploadState = 'idle' | 'requesting' | 'uploading' | 'processing' | 'ready' | 'error'

export function useCloudflareStreamUpload(onUploaded: (uid: string) => void) {
  const [state, setState] = useState<CloudflareUploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onUploadedRef = useRef(onUploaded)

  // Keeps the ref pointing at the latest callback without making it a
  // dependency of anything below — writing to a ref during render itself
  // isn't safe, so this happens in an effect (with no deps: it just runs
  // after every render, same as the assignment used to run during render).
  useEffect(() => {
    onUploadedRef.current = onUploaded
  })

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

        onUploadedRef.current(uid)
        setState('processing')
        pollUntilReady(uid)
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
        setState('error')
      }
    },
    [pollUntilReady]
  )

  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    setState('idle')
    setProgress(0)
    setErrorMessage(null)
  }, [])

  return { state, progress, errorMessage, handleFile, reset }
}
