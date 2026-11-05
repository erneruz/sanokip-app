// src/pages/admin/AdminServices.jsx
import { useState, useEffect } from 'react'
import {
  getServiceLinesWithServices,
  createServiceLine,
  deleteServiceLine,
  deleteService,
} from '../../services/servicesService'
import ServiceEditor from './ServiceEditor'

// ── small inline icons, kept local to this page ──────────────────────────

function IconWrench(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26" />
    </svg>
  )
}
function IconPlus(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}
function IconTag(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  )
}
function IconPencil(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 19.5h-15" />
    </svg>
  )
}
function IconTrash(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}
function IconImage(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5l4.72-4.72a1.5 1.5 0 012.12 0l2.72 2.72m0 0l2.47-2.47a1.5 1.5 0 012.12 0L21 16.5M3 7.5h18M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5m-18 0v9A1.5 1.5 0 004.5 18h15a1.5 1.5 0 001.5-1.5v-9"
      />
    </svg>
  )
}

export default function AdminServices() {
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState(undefined) // undefined = closed, null = new, object = edit
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all')

  async function load() {
    setLoading(true)
    try {
      setLines(await getServiceLinesWithServices())
    } catch (err) {
      console.error('Failed to load services:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    try {
      const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      await createServiceLine({ name: newCategoryName.trim(), slug, display_order: lines.length + 1 })
      setNewCategoryName('')
      await load()
    } catch (err) {
      console.error('Failed to add category:', err)
      alert('Could not add this category — check the name is unique.')
    } finally {
      setAddingCategory(false)
    }
  }

  async function handleDeleteCategory(line) {
    if (!window.confirm(`Delete "${line.name}" and all ${line.services.length} services in it? This can't be undone.`)) return
    try {
      await deleteServiceLine(line.id)
      if (activeCategoryFilter === line.id) setActiveCategoryFilter('all')
      await load()
    } catch (err) {
      console.error('Failed to delete category:', err)
    }
  }

  async function handleDeleteService(service) {
    if (!window.confirm(`Delete "${service.name}"?`)) return
    try {
      await deleteService(service.id)
      await load()
    } catch (err) {
      console.error('Failed to delete service:', err)
    }
  }

  function handleEditorSaved() {
    setEditingService(undefined)
    load()
  }

  const allServices = lines.flatMap((line) =>
    line.services.map((service) => ({ ...service, categoryId: line.id, categoryName: line.name }))
  )

  const visibleServices =
    activeCategoryFilter === 'all'
      ? allServices
      : allServices.filter((s) => s.categoryId === activeCategoryFilter)

  return (
    // ← changed: padding scales down on small screens instead of fixed px-8 py-10
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-white rounded-lg w-9 h-9 bg-[#1B5E4F]">
            <IconWrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="text-sm text-gray-500">Manage categories and the services within each one.</p>
          </div>
        </div>
        <button
          onClick={() => setEditingService(null)}
          disabled={lines.length === 0}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#1B5E4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconPlus className="w-4 h-4" />
          New Service
        </button>
      </div>

      {/* Add a category */}
      <form
        onSubmit={handleAddCategory}
        className="flex flex-wrap items-end gap-3 p-4 mt-6 bg-white shadow-sm rounded-xl ring-1 ring-gray-200 sm:p-5"
      >
        <div className="flex-1 min-w-[220px]">
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <IconTag className="w-3.5 h-3.5" />
            New Category Name
          </label>
          <input
            type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Mapping and Cartography"
            className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:border-[#1B5E4F] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={addingCategory}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <IconPlus className="w-4 h-4" />
          Add Category
        </button>
      </form>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : (
        <>
          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2 mt-8">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#1B5E4F] text-white border-[#1B5E4F]'
                  : 'border-gray-300 text-gray-600 hover:border-[#1B5E4F] hover:text-[#1B5E4F]'
              }`}
            >
              All <span className="opacity-60">({allServices.length})</span>
            </button>
            {lines.map((line) => (
              <span
                key={line.id}
                className={`group flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeCategoryFilter === line.id
                    ? 'bg-[#1B5E4F] text-white border-[#1B5E4F]'
                    : 'border-gray-300 text-gray-600 hover:border-[#1B5E4F] hover:text-[#1B5E4F]'
                }`}
                onClick={() => setActiveCategoryFilter(line.id)}
              >
                {line.name} <span className="opacity-60">({line.services.length})</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCategory(line)
                  }}
                  className={`cursor-pointer leading-none ${
                    activeCategoryFilter === line.id ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-red-600'
                  }`}
                  aria-label={`Delete ${line.name}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Services grid */}
          {visibleServices.length === 0 ? (
            <div className="flex flex-col items-center py-20 mt-6 text-center bg-white border border-gray-200 border-dashed rounded-xl">
              <IconImage className="w-10 h-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-400">No services here yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleServices.map((service) => (
                <div
                  key={service.id}
                  className="overflow-hidden transition bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
                >
                  <div className="w-full h-32 overflow-hidden bg-gray-100">
                    {service.image_url ? (
                      <img src={service.image_url} alt="" className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <IconImage className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                      {service.categoryName}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900 line-clamp-2">
                      {service.name}
                    </p>

                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-100">
                      <button
                        onClick={() => setEditingService(service)}
                        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-[#1B5E4F] hover:bg-[#EAF5F1]"
                      >
                        <IconPencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(service)}
                        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {editingService !== undefined && (
        <ServiceEditor
          serviceLines={lines}
          service={editingService}
          onClose={() => setEditingService(undefined)}
          onSaved={handleEditorSaved}
        />
      )}
    </main>
  )
}