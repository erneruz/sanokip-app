import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllPublications, deletePublication } from '../../services/publicationsService'
import { getCategory } from '../../constants/publications'

export default function AdminPublications() {
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

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Publications</h1>
        <div className="flex gap-3">
          <Link to="/admin" className="rounded-md border border-gray-300 px-4 py-2 text-sm">
            Back to Posts
          </Link>
          <Link
            to="/admin/publications/new"
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            New Publication
          </Link>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-gray-500">Loading…</p>}

      <ul className="mt-8 divide-y divide-gray-200 rounded-md border border-gray-200">
        {items.map((p) => (
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
              <Link to={`/admin/publications/${p.id}/edit`} className="text-blue-600 hover:underline">
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
        {!loading && items.length === 0 && (
          <li className="p-6 text-center text-gray-500">No publications yet.</li>
        )}
      </ul>
    </main>
  )
}