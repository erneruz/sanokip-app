// src/components/entertainment/RichText.jsx
// Shows the "About" text with a little formatting, safely (no HTML is ever inserted):
//   **word**        -> bold
//   a line starting with "- "  -> a bullet point
//   an empty line   -> a new paragraph, a single Enter -> a new line
// With `collapsible`, a long text is cut with a "Read more" button.
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../pages/entertainment/account/accountUi'

const COLLAPSED = 224 // px, about 8 lines
const SLACK = 48 // a text only slightly longer than this is shown in full

function inline(text) {
  return text.split(/(\*\*[^*\n]+?\*\*)/g).map((part, i) =>
    /^\*\*[^*\n]+\*\*$/.test(part) ? (
      <strong key={i} className="font-semibold text-[#0F3D32]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  )
}

function parse(text) {
  const blocks = []
  let para = []
  let list = []
  const flushPara = () => {
    if (para.length) blocks.push({ type: 'p', lines: para })
    para = []
  }
  const flushList = () => {
    if (list.length) blocks.push({ type: 'ul', items: list })
    list = []
  }
  for (const raw of String(text ?? '').replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trimEnd()
    const bullet = line.match(/^\s*[-•]\s+(.*)$/)
    if (!line.trim()) {
      flushPara()
      flushList()
    } else if (bullet) {
      flushPara()
      list.push(bullet[1])
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara()
  flushList()
  return blocks
}

export default function RichText({ text, collapsible = false, className = '' }) {
  const innerRef = useRef(null)
  const [full, setFull] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const measure = () => setFull(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text])

  useEffect(() => setExpanded(false), [text])

  const cut = collapsible && full > COLLAPSED + SLACK
  const blocks = parse(text)

  return (
    <div className={className}>
      <div className="relative">
        <div
          className="overflow-hidden transition-[max-height] duration-500 ease-in-out motion-reduce:transition-none"
          style={cut ? { maxHeight: expanded ? full : COLLAPSED } : undefined}
        >
          <div ref={innerRef} className="space-y-3 text-sm leading-relaxed text-gray-700">
            {blocks.map((b, i) =>
              b.type === 'ul' ? (
                <ul key={i} className="space-y-1.5">
                  {b.items.map((item, j) => (
                    <li key={j} className="flex gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#2F9678]" />
                      <span className="min-w-0 break-words">{inline(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="break-words">
                  {b.lines.map((l, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {inline(l)}
                    </span>
                  ))}
                </p>
              ),
            )}
          </div>
        </div>
        {cut && !expanded && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {cut && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg text-sm font-semibold text-[#1B5E4F] transition hover:text-[#0F3D32] active:scale-95"
        >
          {expanded ? 'Show less' : 'Read more'}
          <Icon name="arrow" size={14} className={expanded ? '-rotate-90' : 'rotate-90'} />
        </button>
      )}
    </div>
  )
}