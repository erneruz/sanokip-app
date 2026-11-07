// src/components/ServiceModal.jsx
import { useEffect, useRef, useState } from 'react'
import ServiceRequestForm from './ServiceRequestForm'
import { sanitizeHtml, htmlToPlainText } from '../utils/richText'

/* ---------- icons ---------- */
function Svg({ size = 16, className = '', strokeWidth = 2, children }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function CloseIcon(props) {
  return (
    <Svg strokeWidth={2.5} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  )
}

function TagIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </Svg>
  )
}

function FileTextIcon(props) {
  return (
    <Svg {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
    </Svg>
  )
}

function LayersIcon(props) {
  return (
    <Svg {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </Svg>
  )
}

function SendIcon(props) {
  return (
    <Svg {...props}>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </Svg>
  )
}

function ArrowRightIcon(props) {
  return (
    <Svg strokeWidth={2.5} {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </Svg>
  )
}

function PlaceholderImage({ className }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] ${className}`}>
      <svg
        className="h-14 w-14 text-white/50"
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

  // description is rich-text HTML (from the Quill editor): sanitize it and
  // render it as HTML instead of printing it as raw text
  const descriptionHtml = sanitizeHtml(service.description)
  const hasDescription = htmlToPlainText(service.description).length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[#0D3A31]/65 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl transition-all duration-300 ease-out ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/95 text-[#0D3A31] shadow-lg backdrop-blur-sm transition duration-200 hover:rotate-90 hover:bg-[#E6F1EE] hover:text-[#1B5E4F] active:scale-90"
        >
          <CloseIcon size={16} />
        </button>

        {/* Hero image with category + title overlaid: stays visible in both views */}
        <div className="relative h-64 overflow-hidden rounded-t-3xl sm:h-80">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <PlaceholderImage className="h-full w-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D3A31]/90 via-[#0D3A31]/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#9FD8C9] backdrop-blur-sm">
              <TagIcon size={12} />
              {service.categoryName}
            </span>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl">
              {service.name}
            </h2>
            <div className="mt-3 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />
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
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#1B5E4F]">
              <FileTextIcon size={16} className="text-[#2F8F7A]" />
              About this service
              <span className="h-px flex-1 bg-[#1B5E4F]/15" />
            </h3>

            <div className="mt-5">
              {hasDescription ? (
                // sanitized HTML, with break-words as a safety net against the Quill &nbsp; overflow bug
                <div
                  className="max-w-none break-words text-base leading-loose text-gray-700 [&_a]:font-medium [&_a]:text-[#1B5E4F] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#2F8F7A] [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0D3A31] [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-[#0D3A31] [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:font-semibold [&_ol]:marker:text-[#2F8F7A] [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[#0D3A31] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#2F8F7A]"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <p className="rounded-xl border border-dashed border-[#1B5E4F]/25 bg-[#F8FBFA] px-4 py-6 text-center text-sm text-gray-500">
                  No description yet.
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#1B5E4F]/10 pt-8">
              <button
                onClick={() => setView('request')}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95"
              >
                <SendIcon size={16} />
                Request this service
                <ArrowRightIcon size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                onClick={handleClose}
                className="cursor-pointer rounded-lg bg-[#E6F1EE] px-5 py-2.5 text-sm font-semibold text-[#1B5E4F] transition hover:bg-[#d8ebe5] active:scale-95"
              >
                Close
              </button>
            </div>

            {related.length > 0 && (
              <div className="mt-8 border-t border-[#1B5E4F]/10 pt-8">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#1B5E4F]">
                  <LayersIcon size={16} className="text-[#2F8F7A]" />
                  Other services in {service.categoryName}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onSelectService?.(r)}
                      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#1B5E4F]/10 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#1B5E4F]/30 hover:shadow-md"
                    >
                      <div className="h-24 w-full shrink-0 overflow-hidden">
                        {r.image_url ? (
                          <img
                            src={r.image_url}
                            alt={r.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <PlaceholderImage className="h-full w-full" />
                        )}
                      </div>
                      <p className="line-clamp-2 flex-1 p-3 text-xs font-semibold text-[#0D3A31] transition-colors group-hover:text-[#1B5E4F]">
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