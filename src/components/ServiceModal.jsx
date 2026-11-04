// src/components/ServiceModal.jsx
import { useEffect, useRef, useState } from 'react'
import ServiceRequestForm from './ServiceRequestForm'

function PlaceholderImage({ className }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <svg
        className="w-14 h-14 text-gray-300"
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

export default function ServiceModal({ service, allServices, onClose, onSelectService }) {
  const [visible, setVisible] = useState(false)
  const [view, setView] = useState('details') // 'details' | 'request'
  const panelRef = useRef(null)

  // Mount animation + Escape to close + lock background scroll
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))

    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset to the details view and scroll to top whenever the displayed service changes
  useEffect(() => {
    setView('details')
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [service?.id])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  if (!service) return null

  const related = allServices
    .filter((s) => s.categoryId === service.categoryId && s.id !== service.id)
    .slice(0, 3)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
        }`}
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute z-10 flex items-center justify-center text-gray-700 transition bg-white rounded-full shadow-lg cursor-pointer top-4 right-4 w-10 h-10 hover:bg-gray-100 hover:text-black"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero image with category + title overlaid — stays visible in both views */}
        <div className="relative h-64 overflow-hidden sm:h-80 rounded-t-2xl">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <PlaceholderImage className="w-full h-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute left-0 right-0 bottom-0 p-6 sm:p-8">
            <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-wide text-white uppercase border rounded-full bg-white/10 border-white/30 backdrop-blur-sm">
              {service.categoryName}
            </span>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl drop-shadow-sm">
              {service.name}
            </h2>
          </div>
        </div>

        {view === 'request' ? (
          <ServiceRequestForm
            service={service}
            onBack={() => setView('details')}
            onClose={handleClose}
          />
        ) : (
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-base leading-loose text-gray-700 whitespace-pre-line">
              {service.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-8 mt-8 border-t border-gray-100">
              <button
                onClick={() => setView('request')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition bg-black rounded-full cursor-pointer hover:bg-gray-800"
              >
                Request this service
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 transition bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            {related.length > 0 && (
              <div className="pt-8 mt-8 border-t border-gray-100">
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                  Other services in {service.categoryName}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onSelectService?.(r)}
                      className="flex flex-col h-full overflow-hidden text-left transition border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="w-full overflow-hidden h-24 shrink-0">
                        {r.image_url ? (
                          <img src={r.image_url} alt={r.name} className="object-cover w-full h-full" />
                        ) : (
                          <PlaceholderImage className="w-full h-full" />
                        )}
                      </div>
                      <p className="flex-1 p-3 text-xs font-medium text-gray-800 line-clamp-2">
                        {r.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}