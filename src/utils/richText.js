// src/utils/richText.js
import DOMPurify from 'dompurify'

// Quill sometimes saves every space as a non-breaking space (&nbsp;), which
// has no line-wrap point and makes text overflow its container — normalize
// those (as entities or real U+00A0 characters) back to normal spaces.
export function normalizeHtml(html) {
  if (!html) return ''
  return html.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ')
}

// Sanitized HTML, safe to render with dangerouslySetInnerHTML.
export function sanitizeHtml(html) {
  if (!html) return ''
  return DOMPurify.sanitize(normalizeHtml(html))
}

// Strips all tags/entities down to plain text — for clamped previews
// (where line-clamp needs plain text to truncate reliably) and for search matching.
export function htmlToPlainText(html) {
  if (!html) return ''
  const normalized = normalizeHtml(html)
  const withBreaks = normalized.replace(/<\/p>|<br\s*\/?>/gi, ' ')
  const stripped = withBreaks.replace(/<[^>]+>/g, '')
  const textarea = document.createElement('textarea')
  textarea.innerHTML = stripped
  return textarea.value.replace(/\s+/g, ' ').trim()
}