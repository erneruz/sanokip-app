// src/components/ProjectCard.jsx
import { htmlToPlainText } from '../utils/richText'
import ProjectStatusBadge from './ProjectStatusBadge'

function MapPinIcon({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function CalendarIcon({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function ImageIcon({ className = '' }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  )
}

function ArrowRightIcon({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

export default function ProjectCard({ project, onOpen }) {
  return (
    <article className="h-full">
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white text-left shadow-[0_1px_2px_rgba(13,58,49,0.06),0_8px_24px_-12px_rgba(13,58,49,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(13,58,49,0.08),0_20px_40px_-14px_rgba(13,58,49,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E4F]"
      >
        {/* image: fixed shape, so every card is the same size */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#DCE9E5]">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-sm text-white/70">
              <ImageIcon />
              No image available
            </div>
          )}

          <div className="absolute left-4 top-4">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-[#0D3A31] transition-colors group-hover:text-[#1B5E4F]">
            {project.title}
          </h3>

          <div className="mt-2.5 h-[3px] w-8 rounded-full bg-[#2F8F7A] transition-all duration-300 group-hover:w-14" />

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {htmlToPlainText(project.description)}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#1B5E4F]/10 pt-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              {project.location && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPinIcon className="shrink-0 text-[#2F8F7A]" />
                  <span className="truncate">{project.location}</span>
                </span>
              )}
              {project.year && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="shrink-0 text-[#2F8F7A]" />
                  {project.year}
                </span>
              )}
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#1B5E4F]">
              View Project
              <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}