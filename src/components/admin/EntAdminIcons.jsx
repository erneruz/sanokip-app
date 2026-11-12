// src/components/admin/EntAdminIcons.jsx
// Small icons used by the Peak Star Entertainment admin area.
function Svg({ children, ...props }) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconUsersGlyph = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20v-1a5.5 5.5 0 0 1 5.5-5.5h2a5.5 5.5 0 0 1 5.5 5.5v1M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20v-1a5.5 5.5 0 0 0-3.5-5.1" />
  </Svg>
)
export const IconNews = (p) => (
  <Svg {...p}>
    <path d="M4 5h13a1 1 0 0 1 1 1v12a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5Z" />
    <path d="M18 9h2v9a2 2 0 0 1-2 2M8 9h6M8 13h6M8 17h3" />
  </Svg>
)
export const IconStoryStar = (p) => (
  <Svg {...p}>
    <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z" />
  </Svg>
)
export const IconOpportunity = (p) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
  </Svg>
)
export const IconQuote = (p) => (
  <Svg {...p}>
    <path d="M9 7H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v-6H6M20 7h-3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v-6h-3" />
  </Svg>
)
export const IconVideo = (p) => (
  <Svg {...p}>
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="m22 8-6 4 6 4V8Z" />
  </Svg>
)
export const IconPublication = (p) => (
  <Svg {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z" />
    <path d="M4 19a2 2 0 0 0 2 2h12M9 8h6" />
  </Svg>
)
export const IconShield = (p) => (
  <Svg {...p}>
    <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
)
export const IconEye = (p) => (
  <Svg {...p}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)
export const IconFamily = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="7" r="3" />
    <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
    <circle cx="18" cy="10" r="2" />
    <path d="M18 14.5a3.5 3.5 0 0 1 3 3.5v1" />
  </Svg>
)
export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
)
export const IconClipboard = (p) => (
  <Svg {...p}>
    <rect x="6" y="3" width="12" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Svg>
)
export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
)
export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m5 12 5 5 9-10" />
  </Svg>
)
export const IconBan = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m5.6 5.6 12.8 12.8" />
  </Svg>
)
export const IconTrash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
)
export const IconGlobe = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Svg>
)
export const IconKey = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9M16 7l3 3" />
  </Svg>
)

// one icon per Entertainment member role
export const ROLE_ICONS = {
  visitor: IconEye,
  talent: IconStoryStar,
  guardian: IconFamily,
  scout: IconSearch,
  manager: IconClipboard,
  partner: IconOpportunity,
}

// one icon per content type
export const KIND_ICONS = {
  news: IconNews,
  story: IconStoryStar,
  opportunity: IconOpportunity,
  testimonial: IconQuote,
  video: IconVideo,
  publication: IconPublication,
}