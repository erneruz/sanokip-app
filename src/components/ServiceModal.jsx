// src/components/ServiceModal.jsx
import { useEffect } from 'react'

function PlaceholderImage({ className }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <svg
        className="w-12 h-12 text-gray-300"
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

export default function ServiceModal({ service, allServices, onClose }) {
  // Close on Escape, lock background scroll while open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!service) return null

  const related = allServices
    .filter((s) => s.categoryId === service.categoryId && s.id !== service.id)
    .slice(0, 3)

  const requestHref = `mailto:info@peakstar.rw?subject=${encodeURIComponent(
    `Service request: ${service.name}`
  )}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-gray-900 shadow"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-56 object-cover rounded-t-lg"
          />
        ) : (
          <PlaceholderImage className="w-full h-56 rounded-t-lg" />
        )}

        {/* Body */}
        <div className="p-6">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {service.categoryName}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">{service.name}</h2>

          <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={requestHref}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
            >
              Request this service
            </a>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>

          {related.length > 0 && (
            <div className="pt-6 mt-6 border-t border-gray-100">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Related in {service.categoryName}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <div
                    key={r.id}
                    className="overflow-hidden border border-gray-100 rounded-md"
                  >
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="object-cover w-full h-20" />
                    ) : (
                      <PlaceholderImage className="w-full h-20" />
                    )}
                    <p className="p-2 text-xs font-medium text-gray-800 line-clamp-2">
                      {r.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}