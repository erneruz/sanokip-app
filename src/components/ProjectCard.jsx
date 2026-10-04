// src/components/ProjectCard.jsx

const STATUS_CONFIG = {
  completed: { label: 'Completed', className: 'bg-gray-900 text-white' },
  ongoing: { label: 'Ongoing', className: 'bg-blue-600 text-white' },
  upcoming: { label: 'Upcoming', className: 'bg-white text-gray-700 ring-1 ring-gray-300' },
}

export default function ProjectCard({ project, onOpen }) {
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.completed

  return (
    // ── changed: was a <Link> to /projects/:slug; now a clickable card that opens the detail modal ──
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(project)
        }
      }}
      className="project-card-link group block cursor-pointer"
    >
      <style>{`
        @keyframes project-card-settle {
          0% { transform: translateY(0) rotate(0deg); }
          40% { transform: translateY(-7px) rotate(-0.4deg); }
          70% { transform: translateY(-6px) rotate(0.3deg); }
          100% { transform: translateY(-6px) rotate(0deg); }
        }
        .project-card-link:hover .project-card {
          animation: project-card-settle 0.45s ease-out forwards;
        }
      `}</style>

      <article className="project-card h-full overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 ease-out hover:shadow-2xl">
        <div className="relative overflow-hidden">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
              No image available
            </div>
          )}

          <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-600">
            {project.title}
          </h3>

          {/* ── changed: project.summary → project.description, still clamped to 3 lines here ── */}
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {project.description}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            {project.location && (
              <p className="text-xs text-gray-500">{project.location}</p>
            )}
            <span className="flex items-center gap-1 text-xs font-medium text-gray-900 transition-transform duration-300 group-hover:translate-x-0.5">
              View Project
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </div>
  )
}