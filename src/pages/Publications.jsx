import { useEffect, useMemo, useState } from 'react'
import { getPublishedPublications } from '../services/publicationsService'
import {
  PUBLICATION_CATEGORIES,
  getCategory,
  formatFileSize,
  fileBadgeClass,
} from '../constants/publications'

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

  const tabClass = (active) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? 'border-black bg-black text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
    }`

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">Reports & Publications</h1>
      <p className="mt-2 text-gray-500">
        Policy frameworks, studies, technical reports, industry insights and advisory papers.
      </p>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search publications…"
        className="mt-8 w-full rounded-md border border-gray-300 px-3 py-2"
      />

      {/* Category filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => selectCategory('')} className={tabClass(!category)}>
          All
        </button>
        {PUBLICATION_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => selectCategory(c.key)}
            className={tabClass(category === c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Sub-type filters */}
      {activeCategory && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSubtype('')}
            className={`rounded-md px-3 py-1 text-xs ${
              !subtype ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All types
          </button>
          {activeCategory.subtypes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubtype(s)}
              className={`rounded-md px-3 py-1 text-xs ${
                subtype === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="mt-8">
        {loading && <p className="text-gray-500">Loading publications…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-gray-500">No publications found.</p>
        )}

        <ul className="space-y-4">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 sm:flex-row sm:items-start"
            >
              <span
                className={`inline-flex h-12 w-14 shrink-0 items-center justify-center rounded-md text-xs font-bold uppercase ${fileBadgeClass(
                  p.file_ext
                )}`}
              >
                {p.file_ext || 'file'}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">
                  {getCategory(p.category)?.label || p.category}
                  {p.subtype && ` · ${p.subtype}`}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-gray-900">{p.title}</h2>
                {p.description && <p className="mt-1 text-sm text-gray-600">{p.description}</p>}
                <p className="mt-2 text-xs text-gray-400">
                  {p.authors && `${p.authors} · `}
                  {p.publication_date &&
                    new Date(p.publication_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  {p.file_size ? ` · ${formatFileSize(p.file_size)}` : ''}
                </p>
              </div>

              <a
                href={p.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-md bg-black px-4 py-2 text-center text-sm text-white hover:bg-gray-800"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}