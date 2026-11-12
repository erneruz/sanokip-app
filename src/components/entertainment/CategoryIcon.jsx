// src/components/entertainment/CategoryIcon.jsx
// One small icon for each talent category (used by the navbar menu and the profile pages).
function Svg({ size = 18, className = '', children }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
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

export default function CategoryIcon({ slug, size = 18, className = '' }) {
  switch (slug) {
    case 'music':
      return (
        <Svg size={size} className={className}>
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
        </Svg>
      )
    case 'movie':
      return (
        <Svg size={size} className={className}>
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path d="m3 8 3.5-5 3.5 5M10 8l3.5-5L17 8M13.5 8l3.5-5 4 5" />
        </Svg>
      )
    case 'dance':
      return (
        <Svg size={size} className={className}>
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
          <path d="M19 16v4M17 18h4" />
        </Svg>
      )
    case 'football':
      return (
        <Svg size={size} className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="m12 8 3.5 2.5-1.3 4.2H9.8L8.5 10.5 12 8Z" />
          <path d="M12 3v5M20.5 9.5l-5 1M17.5 19l-3.3-4.3M6.5 19l3.3-4.3M3.5 9.5l5 1" />
        </Svg>
      )
    case 'basketball':
      return (
        <Svg size={size} className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3v18M5.5 5.5c3 3 3 10 0 13M18.5 5.5c-3 3-3 10 0 13" />
        </Svg>
      )
    case 'volleyball':
      return (
        <Svg size={size} className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c0 6-3 9-9 9M12 3c2 3 5 5 8.5 5M20.5 15.5C15 15 11 17 9 21M5 18.5c3-4.5 8-6 15.5-3" />
        </Svg>
      )
    case 'athletics':
      return (
        <Svg size={size} className={className}>
          <circle cx="12" cy="14" r="7" />
          <path d="M12 14v-4M9 2h6M12 2v3M18.5 6.5 20 5" />
        </Svg>
      )
    case 'comedy':
      return (
        <Svg size={size} className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14.5c1 1.8 2.3 2.5 4 2.5s3-.7 4-2.5" />
          <path d="M9 9.5h.01M15 9.5h.01" strokeWidth={3} />
        </Svg>
      )
    default:
      return (
        <Svg size={size} className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </Svg>
      )
  }
}