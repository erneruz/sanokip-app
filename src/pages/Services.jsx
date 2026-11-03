// src/pages/Services.jsx
import { useEffect, useState } from 'react'
import { getServiceLinesWithServices } from '../services/servicesService'
import ServiceModal from '../components/ServiceModal'
import ServiceCard from '../components/ServiceCard'

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
      <section className="max-w-6xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
        {loading && <p className="text-gray-500">Loading services…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && visibleServices.length === 0 && (
          <p className="text-gray-500">No services in this category yet.</p>
        )}

        <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
          {visibleServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onExplore={setSelectedService}
            />
          ))}
        </div>
      </section>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          allServices={allServices}
          onClose={() => setSelectedService(null)}
          onSelectService={setSelectedService}
        />
      )}
    </div>
  )
}