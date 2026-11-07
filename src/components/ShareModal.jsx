// src/components/ShareModal.jsx
import { useState, useEffect, useRef } from 'react'

// Copies text to the clipboard. Falls back for older browsers / plain http.
async function copyText(text, inputEl) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      if (inputEl) {
        inputEl.select()
        return document.execCommand('copy')
      }
    } catch {
      // ignore, handled below
    }
    return false
  }
}

export default function ShareModal({ open, onClose, url, title }) {
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState('')
  const inputRef = useRef(null)

  // Close with Escape and stop the page scrolling behind the popup
  useEffect(() => {
    if (!open) return

    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  // Every time the popup opens, start clean
  useEffect(() => {
    if (open) {
      setCopied(false)
      setNotice('')
    }
  }, [open])

  if (!open) return null

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function handleCopy() {
    const ok = await copyText(url, inputRef.current)
    if (ok) {
      setCopied(true)
      setNotice('')
      setTimeout(() => setCopied(false), 2000)
    } else {
      setNotice('Could not copy automatically. Select the link and copy it.')
    }
  }

  // Instagram has no web "share this link" address, so we copy the link
  // and open Instagram so it can be pasted in a story, bio or message.
  async function handleInstagram() {
    const ok = await copyText(url, inputRef.current)
    setNotice(
      ok
        ? 'Link copied. Instagram does not allow sharing links directly from websites, so paste it in your story, bio or a message.'
        : 'Copy the link below, then paste it in your Instagram story, bio or a message.'
    )
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url })
    } catch {
      // the person closed the system sheet: nothing to do
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  // One entry per row. `href` = opens a link, `onClick` = runs an action.
  const items = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      hint: 'Send to a chat or group',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: <WhatsAppIcon />,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      hint: 'Post on your timeline',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookIcon />,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      hint: 'Share with your network',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <LinkedInIcon />,
    },
    {
      key: 'x',
      label: 'X',
      hint: 'Post on X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <XIcon />,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      hint: 'Send in Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <TelegramIcon />,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      hint: 'Copy the link for a story or bio',
      onClick: handleInstagram,
      icon: <InstagramIcon />,
    },
    {
      key: 'email',
      label: 'Email',
      hint: 'Send by email',
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${title}\n\n${url}`)}`,
      sameTab: true,
      icon: <MailIcon />,
    },
    ...(canNativeShare
      ? [
          {
            key: 'more',
            label: 'More apps',
            hint: 'Other apps on your device',
            onClick: handleNativeShare,
            icon: <MoreIcon />,
          },
        ]
      : []),
  ]

  const rowClass =
    'group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#F1F6F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E4F]'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share this article"
    >
      <style>{`
        @keyframes share-pop {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes share-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div
        className="absolute inset-0 bg-[#0D3A31]/60 backdrop-blur-sm"
        style={{ animation: 'share-fade 0.2s ease-out' }}
        onClick={onClose}
      />

      <div
        className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        style={{ animation: 'share-pop 0.25s ease-out' }}
      >
        {/* header */}
        <div className="flex items-center justify-between bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] px-5 py-4 text-white">
          <h4 className="flex items-center gap-2.5 font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-white/15">
              <ShareIcon className="h-[18px] w-[18px]" />
            </span>
            Share this article
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 cursor-pointer place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-5 pt-4">
          {/* which article is being shared */}
          <p className="line-clamp-2 rounded-lg bg-[#F1F6F4] px-3 py-2 text-sm font-medium text-[#0D3A31]">
            {title}
          </p>

          {/* networks, one per row */}
          <ul className="mt-3 min-h-0 flex-1 divide-y divide-[#1B5E4F]/5 overflow-y-auto">
            {items.map((item) => {
              const inner = (
                <>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F] transition-colors duration-200 group-hover:bg-[#1B5E4F] group-hover:text-white">
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[#0D3A31] group-hover:text-[#1B5E4F]">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-gray-500">{item.hint}</span>
                  </span>

                  <ChevronRightIcon className="h-4 w-4 shrink-0 -translate-x-1 text-[#2F8F7A] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                </>
              )

              return (
                <li key={item.key}>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.sameTab ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className={rowClass}
                    >
                      {inner}
                    </a>
                  ) : (
                    <button type="button" onClick={item.onClick} className={rowClass}>
                      {inner}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          {notice && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-[#E6F1EE] px-3 py-2 text-xs text-[#14493E]">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2F8F7A]" />
              {notice}
            </p>
          )}

          {/* link bar with copy button */}
          <div className="mt-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2F8F7A]">
              <LinkIcon className="h-3.5 w-3.5" />
              Or copy the link
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-[#1B5E4F]/20 bg-[#F8FBFA] p-1.5 pl-3 focus-within:border-[#1B5E4F] focus-within:ring-1 focus-within:ring-[#1B5E4F]">
              <input
                ref={inputRef}
                type="text"
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                aria-label="Link to this article"
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95 ${
                  copied ? 'bg-[#2F8F7A]' : 'bg-[#1B5E4F] hover:bg-[#154A3E]'
                }`}
              >
                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- icons: one outline style, same as the rest of the website ---------- */

function IconBase({ className = 'h-5 w-5', children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function ShareIcon({ className }) {
  return (
    <IconBase className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </IconBase>
  )
}

function CloseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function LinkIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </IconBase>
  )
}

function CopyIcon({ className }) {
  return (
    <IconBase className={className}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </IconBase>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

function InfoIcon({ className }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </IconBase>
  )
}

function WhatsAppIcon() {
  return (
    <IconBase>
      <path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.6L3 21Z" />
      <path d="M9 8.5c0 3 3 6 6 6l1.2-1.4-2-1-.9.7c-.8-.4-1.7-1.3-2.1-2.1l.7-.9-1-2L9 8.5Z" />
    </IconBase>
  )
}

function FacebookIcon() {
  return (
    <IconBase>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" />
    </IconBase>
  )
}

function LinkedInIcon() {
  return (
    <IconBase>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </IconBase>
  )
}

function XIcon() {
  return (
    <IconBase>
      <path d="M4 4l16 16M20 4 4 20" />
    </IconBase>
  )
}

function TelegramIcon() {
  return (
    <IconBase>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </IconBase>
  )
}

function InstagramIcon() {
  return (
    <IconBase>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </IconBase>
  )
}

function MailIcon() {
  return (
    <IconBase>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </IconBase>
  )
}

function MoreIcon() {
  return (
    <IconBase>
      <circle cx="5.5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="18.5" cy="12" r="1" />
    </IconBase>
  )
}