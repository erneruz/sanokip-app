// src/components/ServiceCard.jsx
import { htmlToPlainText } from '../utils/richText'

function TagIcon({ className = '' }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </svg>
  )
}

function ArrowRightIcon({ className = '' }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

function PlaceholderImage({ className }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] ${className}`}>
      <svg
        className="h-10 w-10 text-white/60"
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

export default function ServiceCard({ service, onExplore }) {
  return (
    <div className="group relative aspect-[6/5] w-full">
      {/* Image panel: spans the full height of the card, tilts slightly on hover */}
      <div
        className="absolute inset-y-0 left-0 w-[58%] origin-bottom-left overflow-hidden rounded-2xl shadow-md ring-1 ring-[#1B5E4F]/10 transition-transform duration-500 ease-out group-hover:-rotate-2 group-hover:scale-[1.03]"
      >
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <PlaceholderImage className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D3A31]/45 via-transparent to-transparent" />
      </div>

      {/* Content panel: overlaps the image and tilts the opposite way on hover */}
      <div
        className="absolute bottom-[14%] right-0 top-[14%] flex w-[72%] origin-top-right flex-col justify-center rounded-2xl border border-[#1B5E4F]/10 bg-white p-4 shadow-[0_8px_24px_-8px_rgba(13,58,49,0.25)] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-1 group-hover:shadow-[0_20px_40px_-12px_rgba(13,58,49,0.4)] sm:p-6"
      >
        <span className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full bg-[#E6F1EE] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1B5E4F]">
          <TagIcon className="shrink-0 text-[#2F8F7A]" />
          <span className="truncate">{service.categoryName}</span>
        </span>

        <h3 className="mt-2.5 line-clamp-1 text-lg font-bold leading-snug text-[#0D3A31] transition-colors group-hover:text-[#1B5E4F]">
          {service.name}
        </h3>

        <span className="mb-3 mt-2 block h-[3px] w-8 rounded-full bg-[#2F8F7A] transition-all duration-300 group-hover:w-14" />

        {/* strip the rich-text HTML down to plain text before cutting it short */}
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 sm:line-clamp-3">
          {htmlToPlainText(service.description)}
        </p>

        <button
          onClick={() => onExplore(service)}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 self-start rounded-lg bg-[#E6F1EE] px-3.5 py-2 text-sm font-semibold text-[#1B5E4F] transition duration-200 hover:bg-[#1B5E4F] hover:text-white active:scale-95"
        >
          Explore Service
          <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}