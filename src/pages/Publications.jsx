import { useEffect, useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import { getPublishedPublications } from '../services/publicationsService'
import {
  PUBLICATION_CATEGORIES,
  getCategory,
  formatFileSize,
  fileBadgeClass,
} from '../constants/publications'

/*
  Peak Star brand colours (taken from the logo)
    deep green   #1B5E4F   main brand colour: buttons, tags, header
    darker green #0D3A31   header depth
    mid green    #2F8F7A   small accents and icons
    pale green   #E6F1EE   soft tags and highlights
    page tint    #F1F6F4   background of the results area
  To change the look of the whole page later, search and replace these hex codes.
*/

// Soft two-layer shadow that lifts a little on hover (slightly green-tinted)
const CARD_SHADOW =
  'shadow-[0_1px_2px_rgba(13,58,49,0.06),0_10px_30px_-12px_rgba(13,58,49,0.20)] hover:shadow-[0_2px_4px_rgba(13,58,49,0.08),0_22px_44px_-16px_rgba(13,58,49,0.32)]'

/* ---------- icons (all drawn here, no extra library needed) ---------- */
function Svg({ size = 16, className = '', strokeWidth = 2, children }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function SearchIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  )
}

function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  )
}

function DownloadIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </Svg>
  )
}

function UserIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </Svg>
  )
}

function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  )
}

function FileIcon(props) {
  return (
    <Svg {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </Svg>
  )
}

function TagIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </Svg>
  )
}

function ChevronDownIcon(props) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

function LayersIcon(props) {
  return (
    <Svg {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </Svg>
  )
}

function FilterIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z" />
    </Svg>
  )
}

function BookIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z" />
      <path d="M6.5 17a2.5 2.5 0 0 0 0 5H20v-5" />
      <path d="M9 8h7M9 12h5" />
    </Svg>
  )
}

function InboxIcon(props) {
  return (
    <Svg {...props}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z" />
    </Svg>
  )
}

function AlertIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5h.01" />
    </Svg>
  )
}

// One icon for each category
function ScaleIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3v18M5 21h14M5 7h14" />
      <path d="m5 7-3 8a4 4 0 0 0 6 0L5 7ZM19 7l-3 8a4 4 0 0 0 6 0L19 7Z" />
    </Svg>
  )
}

function ClipboardIcon(props) {
  return (
    <Svg {...props}>
      <path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1Z" />
      <path d="M8 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="M8 17v-3M12 17v-6M16 17v-4" />
    </Svg>
  )
}

function WrenchIcon(props) {
  return (
    <Svg {...props}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
    </Svg>
  )
}

function TrendIcon(props) {
  return (
    <Svg {...props}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Svg>
  )
}

function LightbulbIcon(props) {
  return (
    <Svg {...props}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z" />
    </Svg>
  )
}

const CATEGORY_ICONS = {
  policy: ScaleIcon,
  studies: ClipboardIcon,
  technical: WrenchIcon,
  industry: TrendIcon,
  knowledge: LightbulbIcon,
}

/* ---------- text helpers ---------- */
function normalizeHtml(html) {
  if (!html) return ''
  return html.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ')
}

function htmlToPlainText(html) {
  if (!html) return ''
  const normalized = normalizeHtml(html)
  const withBreaks = normalized.replace(/<\/p>|<br\s*\/?>/gi, ' ')
  const stripped = withBreaks.replace(/<[^>]+>/g, '')
  const textarea = document.createElement('textarea')
  textarea.innerHTML = stripped
  return textarea.value.replace(/\s+/g, ' ').trim()
}

/* ---------- a single publication card ---------- */
function PublicationCard({ p }) {
  const [expanded, setExpanded] = useState(false)

  const plainText = useMemo(() => htmlToPlainText(p.description), [p.description])
  const sanitizedHtml = useMemo(
    () => (p.description ? DOMPurify.sanitize(normalizeHtml(p.description)) : ''),
    [p.description]
  )
  const isLong = plainText.length > 220
  const categoryLabel = getCategory(p.category)?.label || p.category
  const CategoryIcon = CATEGORY_ICONS[p.category] || TagIcon

  const date = p.publication_date
    ? new Date(p.publication_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article
      className={`group/card relative overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white transition duration-300 hover:-translate-y-0.5 ${CARD_SHADOW}`}
    >
      {/* green accent bar on the left edge */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#2F8F7A] to-[#1B5E4F]" />

      <div className="flex gap-4 p-6 pl-8 sm:gap-5 sm:p-10 sm:pl-12">
        {/* file type badge */}
        <span
          className={`inline-flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold uppercase ${fileBadgeClass(
            p.file_ext
          )}`}
        >
          <FileIcon size={16} />
          {p.file_ext || 'file'}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1B5E4F] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              <CategoryIcon size={12} />
              {categoryLabel}
            </span>
            {p.subtype && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#1B5E4F]">
                <TagIcon size={11} />
                {p.subtype}
              </span>
            )}
          </div>

          <h2 className="mt-3 break-words text-xl font-bold leading-snug tracking-tight text-[#0D3A31] transition-colors duration-300 group-hover/card:text-[#1B5E4F]">
            {p.title}
          </h2>

          <div className="mt-3 h-[3px] w-10 rounded-full bg-[#2F8F7A]" />

          {plainText && (
            <>
              {expanded ? (
                <div
                  className="mt-3 break-words text-sm leading-relaxed text-gray-600 [overflow-wrap:anywhere] [&_a]:text-[#1B5E4F] [&_a]:underline [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              ) : (
                <p className="mt-3 line-clamp-3 break-words text-sm leading-relaxed text-gray-600 [overflow-wrap:anywhere]">
                  {plainText}
                </p>
              )}
              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#1B5E4F] transition-colors hover:text-[#0D3A31]"
                >
                  {expanded ? 'Show less' : 'Read more'}
                  <ChevronDownIcon
                    size={14}
                    className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer: meta on the left, download on the right */}
      <div className="flex flex-col gap-4 border-t border-[#1B5E4F]/10 bg-[#F3F8F6] px-6 py-5 pl-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-6 sm:pl-12">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
          {p.authors && (
            <span className="inline-flex items-center gap-1.5">
              <UserIcon size={14} className="text-[#2F8F7A]" />
              {p.authors}
            </span>
          )}
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon size={14} className="text-[#2F8F7A]" />
              {date}
            </span>
          )}
          {p.file_size ? (
            <span className="inline-flex items-center gap-1.5">
              <FileIcon size={14} className="text-[#2F8F7A]" />
              {formatFileSize(p.file_size)}
            </span>
          ) : null}
        </div>

        <a
          href={p.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95"
        >
          <DownloadIcon size={16} className="transition-transform duration-200 group-hover:translate-y-0.5" />
          Download
        </a>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white p-6 shadow-sm sm:p-10">
      <div className="flex gap-5">
        <div className="h-14 w-14 rounded-xl bg-[#DCE9E5]" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-40 rounded bg-[#DCE9E5]" />
          <div className="h-5 w-3/4 rounded bg-[#DCE9E5]" />
          <div className="h-3 w-full rounded bg-[#E6F1EE]" />
          <div className="h-3 w-5/6 rounded bg-[#E6F1EE]" />
        </div>
      </div>
    </div>
  )
}

/* ---------- page ---------- */
export default function Publications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('')
  const [subtype, setSubtype] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getPublishedPublications()
      .then(setItems)
      .catch((err) => {
        console.error('Failed to load publications:', err)
        setError('Unable to load publications right now.')
      })
      .finally(() => setLoading(false))
  }, [])

  const activeCategory = getCategory(category)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (p) =>
        (!category || p.category === category) &&
        (!subtype || p.subtype === subtype) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          htmlToPlainText(p.description).toLowerCase().includes(q))
    )
  }, [items, category, subtype, search])

  // How many publications each category has (shown on the pills)
  const counts = useMemo(() => {
    const map = {}
    items.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1
    })
    return map
  }, [items])

  const hasFilters = Boolean(category || subtype || search.trim())

  function selectCategory(key) {
    setCategory(key)
    setSubtype('')
  }

  function clearFilters() {
    setCategory('')
    setSubtype('')
    setSearch('')
  }

  // Category pills (on the green header)
  const pillClass = (active) =>
    `inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? 'border-white bg-white text-[#1B5E4F] shadow-sm'
        : 'border-white/25 bg-white/5 text-white/85 hover:border-white/60 hover:bg-white/10 hover:text-white'
    }`

  // Little count bubble inside a pill
  const countClass = (active) =>
    `rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
      active ? 'bg-[#1B5E4F] text-white' : 'bg-white/15 text-white'
    }`

  // Sub-type chips (on the green header)
  const chipClass = (active) =>
    `inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs transition-colors ${
      active ? 'bg-white text-[#1B5E4F]' : 'bg-white/10 text-white/85 hover:bg-white/20 hover:text-white'
    }`

  return (
    <main>
      {/* ---------- Green header: title, search, filters ---------- */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] text-white">
        {/* decoration: soft glows, a dot grid and a big book icon */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1.2px, transparent 1.4px)',
              backgroundSize: '26px 26px',
              WebkitMaskImage: 'radial-gradient(ellipse at 85% 20%, black 0%, transparent 65%)',
              maskImage: 'radial-gradient(ellipse at 85% 20%, black 0%, transparent 65%)',
            }}
          />
          <BookIcon size={260} strokeWidth={0.6} className="absolute -right-6 top-6 hidden text-white/[0.07] md:block" />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9]">
            <BookIcon size={14} />
            Publications
          </p>
          <h1 className="mt-2 text-3xl font-bold">Reports &amp; Publications</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Policy frameworks, studies, technical reports, industry insights and advisory papers.
          </p>

          {/* quick facts */}
          {!loading && !error && (
            <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-medium">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                <FileIcon size={14} className="text-[#9FD8C9]" />
                {items.length} {items.length === 1 ? 'publication' : 'publications'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                <LayersIcon size={14} className="text-[#9FD8C9]" />
                {PUBLICATION_CATEGORIES.length} categories
              </span>
            </div>
          )}

          {/* search */}
          <div className="relative mt-8">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search publications…"
              className="w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-11 pr-11 text-white placeholder-white/55 outline-none backdrop-blur-sm transition focus:border-white/70 focus:bg-white/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>

          {/* category pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => selectCategory('')} className={pillClass(!category)}>
              <LayersIcon size={16} />
              All
              <span className={countClass(!category)}>{items.length}</span>
            </button>
            {PUBLICATION_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.key] || TagIcon
              const active = category === c.key
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => selectCategory(c.key)}
                  className={pillClass(active)}
                >
                  <Icon size={16} />
                  {c.label}
                  <span className={countClass(active)}>{counts[c.key] || 0}</span>
                </button>
              )
            })}
          </div>

          {/* sub-type chips of the chosen category */}
          {activeCategory && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 pr-1 text-xs font-medium text-white/60">
                <FilterIcon size={13} />
                Type
              </span>
              <button type="button" onClick={() => setSubtype('')} className={chipClass(!subtype)}>
                All types
              </button>
              {activeCategory.subtypes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubtype(s)}
                  className={chipClass(subtype === s)}
                >
                  <TagIcon size={12} />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Light green results area ---------- */}
      <section className="min-h-[60vh] bg-[#F1F6F4]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
            >
              <AlertIcon size={20} className="shrink-0" />
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-[#1B5E4F]">
                  <FileIcon size={16} />
                  {filtered.length} {filtered.length === 1 ? 'publication' : 'publications'}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#1B5E4F]/25 bg-white px-3 py-1 text-xs font-semibold text-[#1B5E4F] transition hover:border-[#1B5E4F] hover:bg-[#E6F1EE]"
                  >
                    <CloseIcon size={13} />
                    Clear filters
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#1B5E4F]/30 bg-white/70 px-6 py-16 text-center text-gray-600">
                  <span className="grid size-14 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
                    <InboxIcon size={28} />
                  </span>
                  <p className="font-medium text-[#0D3A31]">No publications found.</p>
                  <p className="text-sm">Try a different search or category.</p>
                </div>
              ) : (
                <ul className="space-y-5">
                  {filtered.map((p) => (
                    <li key={p.id}>
                      <PublicationCard p={p} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}