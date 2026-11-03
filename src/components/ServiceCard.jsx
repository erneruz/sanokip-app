// src/components/ServiceCard.jsx

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
    <div className="relative pb-12 group">
      {/* Background image panel — anchored top-left */}
      <div className="relative w-11/12 overflow-hidden shadow-sm rounded-xl aspect-[4/3]">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <PlaceholderImage className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Content panel — anchored bottom-right, overlapping the image */}
      <div
        className="absolute right-0 w-11/12 p-5 transition-all duration-300 ease-out bg-white border border-gray-100 shadow-md -bottom-4 rounded-xl group-hover:shadow-xl group-hover:-translate-y-1"
      >
        <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          {service.categoryName}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug text-gray-900 line-clamp-1">
          {service.name}
        </h3>
        <span className="block h-[3px] w-8 bg-black mt-2 mb-3 transition-all duration-300 group-hover:w-12" />
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
          {service.description}
        </p>

        <button
          onClick={() => onExplore(service)}
          className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-black"
        >
          Explore More
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