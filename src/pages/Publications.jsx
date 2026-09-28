import { useEffect, useMemo, useState } from 'react'
import { getPublishedPublications } from '../services/publicationsService'
import {
  PUBLICATION_CATEGORIES,
  getCategory,
  formatFileSize,
  fileBadgeClass,
} from '../constants/publications'

// Soft two-layer shadow that lifts a little on hover
const CARD_SHADOW =
  'shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_30px_-12px_rgba(0,0,0,0.18)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_20px_40px_-16px_rgba(0,0,0,0.28)]'

/* ---------- small inline icons ---------- */
function SearchIcon({ className = '' }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function DownloadIcon({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

function UserIcon({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

function CalendarIcon({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function FileIcon({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

/* ---------- a single publication card ---------- */
function PublicationCard({ p }) {
  const [expanded, setExpanded] = useState(false)

  const description = p.description || ''
  const isLong = description.length > 220
  const categoryLabel = getCategory(p.category)?.label || p.category

  const date = p.publication_date
    ? new Date(p.publication_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition duration-300 hover:-translate-y-0.5 ${CARD_SHADOW}`}
    >
      <div className="flex gap-5 p-6">
        <span
          className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase ${fileBadgeClass(
            p.file_ext
          )}`}
        >
          {p.file_ext || 'file'}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black px-2.5 py-0.5 text-[11px] font-medium text-white">
              {categoryLabel}
            </span>
            {p.subtype && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                {p.subtype}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-lg font-semibold leading-snug text-gray-900">{p.title}</h2>

          {description && (
            <>
              <p
                className={`mt-2 text-sm leading-relaxed text-gray-600 ${
                  expanded ? '' : 'line-clamp-3'
                }`}
              >
                {description}
              </p>
              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1.5 cursor-pointer text-xs font-medium text-gray-900 underline-offset-4 hover:underline"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer: meta on the left, download on the right */}
      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500">
          {p.authors && (
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="text-gray-400" />
              {p.authors}
            </span>
          )}
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="text-gray-400" />
              {date}
            </span>
          )}
          {p.file_size ? (
            <span className="inline-flex items-center gap-1.5">
              <FileIcon className="text-gray-400" />
              {formatFileSize(p.file_size)}
            </span>
          ) : null}
        </div>

        <a
          href={p.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-gray-800 hover:shadow-md active:scale-95"
        >
          <DownloadIcon className="transition-transform duration-200 group-hover:translate-y-0.5" />
          Download
        </a>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="flex gap-5">
        <div className="h-14 w-14 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-5/6 rounded bg-gray-200" />
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
          (p.description || '').toLowerCase().includes(q))
    )
  }, [items, category, subtype, search])

  function selectCategory(key) {
    setCategory(key)
    setSubtype('')
  }

  // Category pills (on the black background)
  const pillClass = (active) =>
    `cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? 'border-white bg-white text-black'
        : 'border-white/25 bg-transparent text-gray-300 hover:border-white/60 hover:text-white'
    }`

  // Sub-type chips (on the black background)
  const chipClass = (active) =>
    `cursor-pointer rounded-md px-3 py-1 text-xs transition-colors ${
      active ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
    }`

  return (
    <main>
      {/* ---------- Black header: title, search, filters ---------- */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-xs uppercase tracking-wider text-gray-400">Publications</p>
          <h1 className="mt-2 text-3xl font-bold">Reports & Publications</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Policy frameworks, studies, technical reports, industry insights and advisory papers.
          </p>

          <div className="relative mt-8">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search publications…"
              className="w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-11 pr-4 text-white placeholder-gray-400 outline-none transition focus:border-white/60 focus:bg-white/15"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => selectCategory('')} className={pillClass(!category)}>
              All
            </button>
            {PUBLICATION_CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => selectCategory(c.key)}
                className={pillClass(category === c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="mt-3 flex flex-wrap gap-2">
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
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Gray results area ---------- */}
      <section className="min-h-[60vh] bg-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-10">
          {error && <p className="text-red-600">{error}</p>}

          {loading && (
            <div className="space-y-5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="mb-5 text-sm text-gray-500">
                {filtered.length} {filtered.length === 1 ? 'publication' : 'publications'}
              </p>

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center text-gray-500">
                  No publications found. Try a different search or category.
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