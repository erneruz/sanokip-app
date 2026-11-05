// src/components/ServiceCard.jsx
import { htmlToPlainText } from '../utils/richText'

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

export default function ServiceCard({ service, onExplore }) {
  return (
    <div className="relative w-full group aspect-[6/5]">
      {/* Image panel — enlarged, spans the full height of the card, tilts slightly on hover */}
      <div
        className="absolute inset-y-0 left-0 w-[58%] overflow-hidden rounded-xl shadow-sm transition-transform duration-500 ease-out origin-bottom-left group-hover:-rotate-2 group-hover:scale-[1.03]"
      >
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <PlaceholderImage className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content panel — overlapping, light gray, tilts the opposite way on hover */}
      <div
        className="absolute right-0 top-[14%] bottom-[14%] flex w-[72%] flex-col justify-center rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-md transition-all duration-500 ease-out origin-top-right group-hover:rotate-1 group-hover:shadow-xl group-hover:-translate-y-1"
      >
        <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          {service.categoryName}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug text-gray-900 line-clamp-1">
          {service.name}
        </h3>
        <span className="block h-[3px] w-8 bg-black mt-2 mb-3 transition-all duration-300 group-hover:w-12" />
        {/* ← changed: strip HTML tags down to plain text before truncating, instead of
            printing the raw rich-text HTML (<p>, &nbsp;, etc.) straight into the card */}
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
          {htmlToPlainText(service.description)}
        </p>

        <button
          onClick={() => onExplore(service)}
          className="inline-flex items-center self-start gap-1 mt-4 text-sm font-semibold text-black cursor-pointer"
        >
          Explore Service
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}