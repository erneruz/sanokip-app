// src/components/ProjectModal.jsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sanitizeHtml, htmlToPlainText } from '../utils/richText'
import ProjectStatusBadge from './ProjectStatusBadge'

/*
  Peak Star brand colours (taken from the logo)
    deep green   #1B5E4F   buttons, tags
    darker green #0D3A31   headings
    mid green    #2F8F7A   small accents and icons
    pale green   #E6F1EE   soft tags and highlights
    page tint    #F1F6F4   soft panels
*/

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

// "11 months", "1 year 2 months" ... from the start and end dates
function formatDuration(start, end) {
  if (!start || !end) return null

  const a = new Date(start)
  const b = new Date(end)
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  if (b.getDate() >= a.getDate()) months += 1
  if (months < 1) return null

  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
  if (rest) parts.push(`${rest} ${rest === 1 ? 'month' : 'months'}`)
  return parts.join(' ')
}

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

function MapPinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  )
}

function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  )
}

function HourglassIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 2h12M6 22h12" />
      <path d="M7 2v4a5 5 0 0 0 2 4l3 2-3 2a5 5 0 0 0-2 4v4M17 2v4a5 5 0 0 1-2 4l-3 2 3 2a5 5 0 0 1 2 4v4" />
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

function ImageIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-9 9" />
    </Svg>
  )
}

function MailIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
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

export default function ProjectModal({ project, onClose }) {
  // Close with Escape and stop the page scrolling behind the popup
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  if (!project) return null

  const dateRange = formatDateRange(project.start_date, project.end_date)
  const duration = formatDuration(project.start_date, project.end_date)

  // description is rich HTML (from the editor's Quill field): sanitize it and
  // render it as real HTML
  const hasDescription = htmlToPlainText(project.description).length > 0
  const descriptionHtml = sanitizeHtml(project.description)

  // small "facts" tiles under the title: only the ones that have data
  const facts = [
    project.location && { key: 'location', label: 'Location', value: project.location, Icon: MapPinIcon },
    dateRange && { key: 'timeline', label: 'Timeline', value: dateRange, Icon: CalendarIcon },
    duration && { key: 'duration', label: 'Duration', value: duration, Icon: HourglassIcon },
  ].filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <style>{`
        @keyframes project-pop {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes project-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* backdrop */}
      <div
        className="absolute inset-0 bg-[#0D3A31]/65 backdrop-blur-sm"
        style={{ animation: 'project-fade 0.2s ease-out' }}
        onClick={onClose}
      />

      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        style={{ animation: 'project-pop 0.28s ease-out' }}
      >
        {/* ── Close button ── */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/95 text-[#0D3A31] shadow-md backdrop-blur-sm transition duration-200 hover:rotate-90 hover:bg-[#E6F1EE] hover:text-[#1B5E4F] active:scale-90"
        >
          <CloseIcon size={16} />
        </button>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto">
          {/* Image */}
          <div className="relative">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="h-60 w-full object-cover sm:h-72"
              />
            ) : (
              <div className="flex h-60 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-sm text-white/70 sm:h-72">
                <ImageIcon size={30} />
                No image available
              </div>
            )}

            {/* soft shade so the badge always reads well */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent"
            />

            <div className="absolute left-5 top-5">
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 pt-7 sm:px-8 md:px-10">
            <h2 className="text-2xl font-bold leading-tight text-[#0D3A31] md:text-3xl">
              {project.title}
            </h2>

            <div className="mt-3 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />

            {/* facts */}
            {facts.length > 0 && (
              <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {facts.map(({ key, label, value, Icon }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-[#1B5E4F]/10 bg-[#F1F6F4] px-3.5 py-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#2F8F7A] shadow-sm ring-1 ring-[#1B5E4F]/10">
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#2F8F7A]">
                        {label}
                      </dt>
                      <dd className="truncate text-sm font-medium text-[#0D3A31]">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}

            {/* description */}
            <div className="mt-7">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#1B5E4F]">
                <FileTextIcon size={16} className="text-[#2F8F7A]" />
                About this project
                <span className="h-px flex-1 bg-[#1B5E4F]/15" />
              </h3>

              <div className="mt-4">
                {hasDescription ? (
                  <div
                    className="break-words text-[15px] leading-relaxed text-gray-700 [overflow-wrap:anywhere] [&_a]:font-medium [&_a]:text-[#1B5E4F] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#2F8F7A] [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#0D3A31] [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0D3A31] [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-[#0D3A31] [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:font-semibold [&_ol]:marker:text-[#2F8F7A] [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[#0D3A31] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[#2F8F7A]"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                ) : (
                  <p className="rounded-xl border border-dashed border-[#1B5E4F]/25 bg-[#F8FBFA] px-4 py-6 text-center text-sm text-gray-500">
                    No description available for this project yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1B5E4F]/10 bg-[#F8FBFA] px-6 py-4 sm:px-8 md:px-10">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-[#1B5E4F] transition hover:bg-[#E6F1EE] active:scale-95"
          >
            Close
          </button>

          <Link
            to="/about"
            onClick={onClose}
            className="group inline-flex items-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95"
          >
            <MailIcon size={16} />
            Talk to us about this project
            <ArrowRightIcon size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}