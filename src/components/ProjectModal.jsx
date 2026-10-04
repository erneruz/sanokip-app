// src/components/ProjectModal.jsx
import { useEffect } from 'react'

const STATUS_CONFIG = {
  completed: { label: 'Completed', className: 'bg-gray-900 text-white' },
  ongoing: { label: 'Ongoing', className: 'bg-blue-600 text-white' },
  upcoming: { label: 'Upcoming', className: 'bg-white text-gray-700 ring-1 ring-gray-300' },
}

function formatMonthYear(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatDateRange(start, end) {
  const startLabel = formatMonthYear(start)
  const endLabel = formatMonthYear(end)
  if (!startLabel) return null
  if (!endLabel) return `Started ${startLabel}`
  return `${startLabel} – ${endLabel}`
}

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!project) return null

  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.completed
  const dateRange = formatDateRange(project.start_date, project.end_date)

  // ── split the description into paragraphs on blank lines, so admin-entered
  //    spacing (one blank line between paragraphs) renders as real paragraph gaps ──
  const paragraphs = (project.description ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Close button ── */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-sm transition hover:bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto">
          {/* Image */}
          <div className="relative">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                No image available
              </div>
            )}
            <span className={`absolute left-5 top-5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-sm ${status.className}`}>
              {status.label}
            </span>
          </div>

          {/* Content */}
          <div className="px-8 py-8 md:px-10">
            {(project.location || dateRange) && (
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                {[project.location, dateRange].filter(Boolean).join(' · ')}
              </p>
            )}

            <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
              {project.title}
            </h2>

            <div className="mt-6 border-t border-gray-100 pt-6">
              {paragraphs.length > 0 ? (
                <div className="space-y-5">
                  {paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-[15px] leading-relaxed text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No description available for this project yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}