// src/pages/admin/AdminPublications.jsx
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllPublications, deletePublication } from '../../services/publicationsService'
import { getCategory } from '../../constants/publications'

export default function AdminPublications() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setItems(await getAllPublications())
    } catch (err) {
      console.error('Failed to load publications:', err)
      setError('Unable to load publications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ← added: filter by the ?status= query param, same pattern as AdminPosts.jsx
  const filteredItems = statusFilter
    ? items.filter((p) => p.status === statusFilter)
    : items

  function clearFilter() {
    setSearchParams({})
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.title}"? This also removes the file.`)) return
    try {
      await deletePublication(item)
      setItems((prev) => prev.filter((p) => p.id !== item.id))
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Unable to delete this publication.')
    }
  }

  const statusLabel = statusFilter === 'published' ? 'Published' : statusFilter === 'draft' ? 'Drafts' : null

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publications</h1>

          {/* ← added: active-filter chip, same pattern as AdminPosts.jsx */}
          {statusLabel && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#1B5E4F] py-1 pl-3 pr-1 text-xs font-medium text-white">
              <span>{statusLabel} ({filteredItems.length})</span>
              <button
                onClick={clearFilter}
                aria-label={`Clear ${statusLabel} filter`}
                className="cursor-pointer rounded-full p-1 opacity-70 transition hover:bg-white/20 hover:opacity-100"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link to="/admin" className="rounded-md border border-gray-300 px-4 py-2 text-sm">
            Back to Posts
          </Link>
          <Link
            to="/admin/publications/new"
            className="rounded-md bg-[#1B5E4F] px-4 py-2 text-sm text-white hover:bg-[#154A3F]"
          >
            New Publication
          </Link>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-gray-500">Loading…</p>}

      <ul className="mt-8 divide-y divide-gray-200 rounded-md border border-gray-200">
        {filteredItems.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{p.title}</p>
              <p className="text-xs text-gray-500">
                {getCategory(p.category)?.label || p.category}
                {p.subtype && ` · ${p.subtype}`} · {p.file_ext?.toUpperCase()} ·{' '}
                <span className={p.status === 'published' ? 'text-green-600' : 'text-amber-600'}>
                  {p.status}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <Link to={`/admin/publications/${p.id}/edit`} className="text-[#1B5E4F] hover:underline">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(p)}
                className="cursor-pointer text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {!loading && filteredItems.length === 0 && (
          <li className="p-6 text-center text-gray-500">
            {statusLabel ? `No ${statusLabel.toLowerCase()} publications.` : 'No publications yet.'}
          </li>
        )}
      </ul>
    </main>
  )
}