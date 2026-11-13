// src/components/entertainment/BioEditor.jsx
// The "About you" box with a small toolbar: Bold and Bullet list.
// The text has no length limit. Format: **bold**, lines starting with "- " are bullets.
import { useRef } from 'react'
import { inputClass } from '../../pages/entertainment/account/accountUi'

export default function BioEditor({ id, value, onChange, placeholder }) {
  const ref = useRef(null)

  // change the text and put the selection back after the change
  function apply(next, start, end) {
    onChange(next)
    requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      el.focus()
      el.setSelectionRange(start, end)
    })
  }

  function bold() {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const picked = value.slice(s, e)
    // already bold: take the ** away
    if (picked.length > 4 && picked.startsWith('**') && picked.endsWith('**')) {
      apply(value.slice(0, s) + picked.slice(2, -2) + value.slice(e), s, e - 4)
      return
    }
    if (value.slice(s - 2, s) === '**' && value.slice(e, e + 2) === '**') {
      apply(value.slice(0, s - 2) + picked + value.slice(e + 2), s - 2, e - 2)
      return
    }
    const text = picked || 'bold text'
    apply(value.slice(0, s) + '**' + text + '**' + value.slice(e), s + 2, s + 2 + text.length)
  }

  function bullets() {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const from = value.lastIndexOf('\n', s - 1) + 1
    let to = value.indexOf('\n', e)
    if (to === -1) to = value.length
    const lines = value.slice(from, to).split('\n')
    const allBullets = lines.every((l) => /^\s*[-•]\s+/.test(l))
    const next = lines.map((l) => (allBullets ? l.replace(/^\s*[-•]\s+/, '') : /^\s*[-•]\s+/.test(l) ? l : `- ${l}`)).join('\n')
    apply(value.slice(0, from) + next + value.slice(to), from, from + next.length)
  }

  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      bold()
    }
  }

  const btn =
    'inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#1B5E4F] transition hover:bg-[#E6F1EE] active:scale-95'

  return (
    <div>
      <div className="mb-2 flex items-center gap-1 rounded-xl bg-[#F1F6F4] p-1 ring-1 ring-[#CDEBE2]">
        <button type="button" onClick={bold} className={btn} title="Bold (select a word first). Shortcut: Ctrl+B" aria-label="Bold">
          <span className="text-sm font-extrabold">B</span>
          <span className="hidden sm:inline">Bold</span>
        </button>
        <button type="button" onClick={bullets} className={btn} title="Bullet list (for the selected lines)" aria-label="Bullet list">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
          <span className="hidden sm:inline">Bullets</span>
        </button>
      </div>
      <textarea
        ref={ref}
        id={id}
        className={inputClass + ' min-h-[200px] resize-y leading-relaxed'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
    </div>
  )
}