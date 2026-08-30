import { Icon } from '@sanity/icons'

// @sanity/icons v5 removed per-icon named exports from its root entry (each
// icon now lives at its own subpath, or is rendered via the generic
// `<Icon symbol="…" />` component). These small wrappers keep the rest of
// the builder's call sites reading like plain icon components.
export function AddIcon() {
  return <Icon symbol="add" />
}
export function TrashIcon() {
  return <Icon symbol="trash" />
}
export function DragHandleIcon() {
  return <Icon symbol="drag-handle" />
}
export function BookIcon() {
  return <Icon symbol="book" />
}
