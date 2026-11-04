// src/pages/admin/AdminPublications.jsx
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllPublications, deletePublication } from '../../services/publicationsService'
import { getCategory } from '../../constants/publications'
import { IconCheckCircle, IconEdit, IconBook } from '../../components/icons'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
]

const FILE_TYPES = {
  pdf: { color: '#DC2626', label: 'PDF' },
  doc: { color: '#2563EB', label: 'DOC' },
  docx: { color: '#2563EB', label: 'DOCX' },
  xls: { color: '#15803D', label: 'XLS' },
  xlsx: { color: '#15803D', label: 'XLSX' },
  ppt: { color: '#D97706', label: 'PPT' },
  pptx: { color: '#D97706', label: 'PPTX' },
  csv: { color: '#15803D', label: 'CSV' },
  txt: { color: '#64748B', label: 'TXT' },
}

function FileTypeBadge({ ext }) {
  const key = (ext || '').toLowerCase()
  const meta = FILE_TYPES[key] || { color: '#64748B', label: (ext || 'FILE').toUpperCase() }

  return (
    <span className="flex w-fit items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
          fill={meta.color}
          fillOpacity="0.12"
          stroke={meta.color}
          strokeWidth="1.5"
        />
        <path d="M14 2v6h6" stroke={meta.color} strokeWidth="1.5" fill="none" />
      </svg>
      <span className="text-[11px] font-semibold tracking-wide" style={{ color: meta.color }}>
        {meta.label}
      </span>
    </span>
  )
}

export default function AdminPublications() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')
  const activeTab = statusFilter === 'published' || statusFilter === 'draft' ? statusFilter : 'all'

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

  const filteredItems = statusFilter
    ? items.filter((p) => p.status === statusFilter)
    : items

  function selectTab(key) {
    if (key === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ status: key })
    }
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

  const totalCount = items.length
  const publishedCount = items.filter((p) => p.status === 'published').length
  const draftCount = items.filter((p) => p.status === 'draft').length
  const tabCounts = { all: totalCount, published: publishedCount, draft: draftCount }

  return (
    <main className="px-16 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
              <IconBook className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage Publications</h1>
              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Share Peakstar's research, reports, and reference papers | publish finished work and keep drafts organized until they're ready.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <Link
              to="/admin/publications/new"
              className="flex items-center gap-1.5 rounded-md bg-[#1B5E4F] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#154A3F]"
            >
              <IconPlus className="h-4 w-4" />
              New Publication
            </Link>
          </div>
        </div>

        <div className="mt-5 inline-flex rounded-lg bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => selectTab(tab.key)}
              className={
                activeTab === tab.key
                  ? 'cursor-pointer rounded-md bg-[#1B5E4F] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition'
                  : 'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900'
              }
            >
              {tab.label} <span className={activeTab === tab.key ? 'text-white/70' : 'text-gray-400'}>({tabCounts[tab.key]})</span>
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="mt-8 text-gray-500">Loading…</p>
        ) : (
          <div className="mt-5 rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            {filteredItems.length === 0 ? (
              <p className="py-10 text-center text-gray-500">
                {activeTab !== 'all' ? `No ${activeTab === 'published' ? 'published' : 'draft'} publications.` : 'No publications yet.'}
              </p>
            ) : (
              <>
                {/* ← added: column headers so the left-aligned grid columns below make sense at a glance */}
                <div className="hidden grid-cols-[minmax(0,1fr)_110px_110px_84px] gap-4 border-b border-gray-100 px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 sm:grid">
                  <span>Publication</span>
                  <span>File</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                <ul className="divide-y divide-gray-100">
                  {filteredItems.map((p) => {
                    const isPublished = p.status === 'published'
                    const categoryLabel = getCategory(p.category)?.label || p.category
                    return (
                      // ← changed: row is now a grid with fixed column widths, each
                      // column's content left-aligned (justify-self-start), so the
                      // file-type icon, status pill, and action icons line up in
                      // neat columns down the list instead of floating per-title-length
                      <li
                        key={p.id}
                        className="grid grid-cols-[minmax(0,1fr)_110px_110px_84px] items-center gap-4 px-5 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: isPublished ? '#1B5E4F' : '#94A3B8' }}
                          >
                            {isPublished ? (
                              <IconCheckCircle className="h-3 w-3 text-white" />
                            ) : (
                              <IconEdit className="h-3 w-3 text-white" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{p.title}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                              <IconTag className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              <span className="truncate">
                                {categoryLabel}
                                {p.subtype && ` · ${p.subtype}`}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="justify-self-start">
                          <FileTypeBadge ext={p.file_ext} />
                        </div>

                        <div className="justify-self-start">
                          <span
                            className={
                              isPublished
                                ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                                : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                            }
                          >
                            {p.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-self-start gap-1">
                          <Link
                            to={`/admin/publications/${p.id}/edit`}
                            aria-label="Edit publication"
                            title="Edit"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#1B5E4F] transition hover:bg-[#EAF5F1]"
                          >
                            <IconEdit className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            aria-label="Delete publication"
                            title="Delete"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-red-600 transition hover:bg-red-50"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function IconPlus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IconTag(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconTrash(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}
function IconArrowLeft(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}