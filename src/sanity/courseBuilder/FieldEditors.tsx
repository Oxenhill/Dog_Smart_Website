import { useEffect, useRef, useState } from 'react'
import { Switch, Text, TextArea, TextInput } from '@sanity/ui'

/**
 * Plain form fields that patch on blur (or immediately for toggles/selects,
 * where there's no "still typing" race to worry about) rather than on every
 * keystroke. Each keeps its own local buffer and only re-syncs from the
 * `value` prop while the field ISN'T focused — so a document refetch
 * triggered by an unrelated action elsewhere in the tree (a drag, another
 * field's save) can never clobber a keystroke that's still in flight here.
 */

function useLocalBuffer<T>(value: T) {
  const [local, setLocal] = useState(value)
  const focusedRef = useRef(false)
  useEffect(() => {
    if (!focusedRef.current) setLocal(value)
  }, [value])
  return { local, setLocal, focusedRef }
}

export function BlurTextField({
  value,
  onCommit,
  placeholder,
  disabled,
  multiline,
  rows = 4,
}: {
  value: string
  onCommit: (value: string) => void
  placeholder?: string
  disabled?: boolean
  multiline?: boolean
  rows?: number
}) {
  const { local, setLocal, focusedRef } = useLocalBuffer(value)

  const commit = () => {
    focusedRef.current = false
    if (local !== value) onCommit(local)
  }

  if (multiline) {
    return (
      <TextArea
        value={local}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        onFocus={() => {
          focusedRef.current = true
        }}
        onChange={(e) => setLocal(e.currentTarget.value)}
        onBlur={commit}
      />
    )
  }

  return (
    <TextInput
      value={local}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => {
        focusedRef.current = true
      }}
      onChange={(e) => setLocal(e.currentTarget.value)}
      onBlur={commit}
    />
  )
}

export function BlurNumberField({
  value,
  onCommit,
  placeholder,
  disabled,
}: {
  value: number | undefined
  onCommit: (value: number | undefined) => void
  placeholder?: string
  disabled?: boolean
}) {
  const { local, setLocal, focusedRef } = useLocalBuffer(value === undefined ? '' : String(value))

  const commit = () => {
    focusedRef.current = false
    const parsed = local.trim() === '' ? undefined : Number(local)
    const normalized = parsed === undefined || Number.isNaN(parsed) ? undefined : parsed
    const currentNormalized = value
    if (normalized !== currentNormalized) onCommit(normalized)
  }

  return (
    <TextInput
      type="number"
      value={local}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => {
        focusedRef.current = true
      }}
      onChange={(e) => setLocal(e.currentTarget.value)}
      onBlur={commit}
    />
  )
}

export function InlineSwitchField({
  checked,
  onCommit,
  label,
  disabled,
}: {
  checked: boolean
  onCommit: (checked: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer' }}>
      <Switch checked={checked} disabled={disabled} onChange={(e) => onCommit(e.currentTarget.checked)} />
      <Text size={1}>{label}</Text>
    </label>
  )
}
