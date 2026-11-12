// src/components/entertainment/SocialIcon.jsx
// Simple line icons for the social media places (see constants/socialLinks.js).
export default function SocialIcon({ name, size = 18, className = '' }) {
  const body = {
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" strokeWidth={3} />
      </>
    ),
    tiktok: (
      <>
        <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
      </>
    ),
    youtube: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="m10 9.5 5 2.5-5 2.5v-5Z" />
      </>
    ),
    facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5A.5.5 0 0 1 14 8Z" />,
    x: <path d="M4 4l16 16M20 4 4 20" />,
    linkedin: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 10v6M8 7.5h.01M12 16v-6M12 12.5a2.5 2.5 0 0 1 5 0V16" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6L3 21Z" />
        <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.2-1.8-1-.8.6a3.3 3.3 0 0 1-1.8-1.8l.6-.8-1-1.8L9 9.5Z" />
      </>
    ),
    website: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
      </>
    ),
  }[name]

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
      {body}
    </svg>
  )
}