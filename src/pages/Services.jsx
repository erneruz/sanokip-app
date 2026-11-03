// src/pages/Services.jsx
import { useEffect, useState } from 'react'
import { getServiceLinesWithServices } from '../services/servicesService'
import ServiceModal from '../components/ServiceModal'

function PlaceholderImage({ className }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <svg
        className="w-10 h-10 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5l4.72-4.72a1.5 1.5 0 012.12 0l2.72 2.72m0 0l2.47-2.47a1.5 1.5 0 012.12 0L21 16.5M3 7.5h18M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5m-18 0v9A1.5 1.5 0 004.5 18h15a1.5 1.5 0 001.5-1.5v-9"
        />
      </svg>
    </div>
  )
}

export default function Services() {
  const [serviceLines, setServiceLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getServiceLinesWithServices()
      .then((data) => {
        if (!cancelled) setServiceLines(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = serviceLines.map((line) => ({ id: line.id, name: line.name }))

  const allServices = serviceLines.flatMap((line) =>
    (line.services ?? []).map((s) => ({
      ...s,
      categoryId: line.id,
      categoryName: line.name,
    }))
  )

  const visibleServices =
    activeCategory === 'all'
      ? allServices
      : allServices.filter((s) => s.categoryId === activeCategory)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-black to-gray-700 text-white">
        <div className="max-w-6xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Our Services</h1>
          <p className="max-w-2xl mt-3 text-gray-300">
            Mapping, planning, surveying and geospatial solutions, organized by category.
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 text-sm rounded-md border transition ${
                activeCategory === 'all'
                  ? 'bg-white text-black border-white'
                  : 'border-gray-500 text-gray-200 hover:border-white hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 text-sm rounded-md border transition ${
                  activeCategory === cat.id
                    ? 'bg-white text-black border-white'
                    : 'border-gray-500 text-gray-200 hover:border-white hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
        {loading && <p className="text-gray-500">Loading services…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && visibleServices.length === 0 && (
          <p className="text-gray-500">No services in this category yet.</p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col overflow-hidden bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="object-cover w-full h-40"
                />
              ) : (
                <PlaceholderImage className="w-full h-40" />
              )}

              <div className="flex flex-col flex-1 p-4">
                <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                  {service.categoryName}
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-1">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {service.description}
                </p>

                <button
                  onClick={() => setSelectedService(service)}
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-black hover:underline"
                >
                  Explore More
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          allServices={allServices}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  )
}