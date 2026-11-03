// src/pages/admin/AdminServices.jsx
import { useState, useEffect } from 'react'
import {
  getServiceLinesWithServices,
  createServiceLine,
  deleteServiceLine,
  deleteService,
} from '../../services/servicesService'
import ServiceEditor from './ServiceEditor'

export default function AdminServices() {
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState(undefined) // undefined = closed, null = new, object = edit
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

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
    line.services.map((service) => ({ ...service, categoryName: line.name }))
  )

  return (
    <main className="px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">Manage categories and the services within each one.</p>
        </div>
        <button
          onClick={() => setEditingService(null)}
          disabled={lines.length === 0}
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          + New Service
        </button>
      </div>

      {/* Add a category */}
      <form onSubmit={handleAddCategory} className="mt-6 flex flex-wrap items-end gap-3 rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500">New Category Name</label>
          <input
            type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Mapping and Cartography"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <button type="submit" disabled={addingCategory}
          className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          + Add Category
        </button>
      </form>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : (
        <>
          {/* Category chips with delete */}
          <div className="mt-8 flex flex-wrap gap-2">
            {lines.map((line) => (
              <span key={line.id} className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                {line.name} <span className="text-gray-400">({line.services.length})</span>
                <button onClick={() => handleDeleteCategory(line)} className="cursor-pointer text-gray-400 hover:text-red-600">✕</button>
              </span>
            ))}
          </div>

          {/* Flat services list */}
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {allServices.length === 0 ? (
              <p className="text-sm text-gray-400">No services yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {allServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {service.image_url ? (
                        <img src={service.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-100" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-400">{service.categoryName}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-4 pl-4">
                      <button onClick={() => setEditingService(service)} className="cursor-pointer text-sm text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteService(service)} className="cursor-pointer text-sm text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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