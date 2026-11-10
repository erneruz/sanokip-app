// src/components/Footer.jsx
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import peakstarLogo from '../assets/images/peakstar-logo-white.png'
import { subscribeToUpdates, unsubscribeByToken } from '../services/subscribersService'

const navigate = [
  { label: 'Home', to: '/' }, // Home has its own page (it used to go to /blog)
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog & News', to: '/blog' },
  { label: 'Publications', to: '/publications' },
]

// ── true once the element has scrolled into view (and stays true) ─────────
function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

// small column title with a green line that grows when the footer appears
function FooterHeading({ children }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white">{children}</h3>
      <span className="footer-title-line mt-2 block h-[3px] rounded-full bg-gradient-to-r from-[#4FB28E] to-[#9FD8C9]" />
    </div>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            <Link to={item.to} className="footer-link text-sm text-gray-300">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Fixed "back to top" button ─────────────────────────────────────────────
// Hidden on the hero, appears right after you scroll past it. The ring around
// it fills up as you scroll down the page.
function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      // 0.75 = the button shows once you are 75% of a screen below the top (past the hero)
      setVisible(y > window.innerHeight * 0.75)
      setProgress(max > 0 ? Math.min(1, y / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  function goTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const circumference = 2 * Math.PI * 21

  return createPortal(
    <button
      type="button"
      onClick={goTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      className={
        'footer-top-btn group fixed bottom-5 right-5 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-xl shadow-black/30 ring-1 ring-white/20 transition-all duration-500 hover:scale-110 hover:from-[#1B5E4F] hover:to-[#2F9678] sm:bottom-7 sm:right-7 ' +
        (visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-6 scale-75 opacity-0')
      }
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="21" stroke="white" strokeOpacity="0.15" strokeWidth="2.5" />
        <circle
          cx="24"
          cy="24"
          r="21"
          stroke="#9FD8C9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.15s linear' }}
        />
      </svg>
      <IconArrowUp className="footer-top-arrow relative h-5 w-5" />
    </button>,
    document.body
  )
}

// ── Card shown when someone opens the unsubscribe link from an email ───────
function UnsubscribeNotice({ state, onClose }) {
  if (!state) return null

  const content = {
    loading: { title: 'Please wait…', text: 'Updating your subscription.' },
    done: {
      title: "You've been unsubscribed",
      text: 'You will not receive any more updates from Peak Star Engineering. You can subscribe again at any time from the footer.',
    },
    invalid: {
      title: 'This link is not valid',
      text: 'The unsubscribe link may be old or incomplete. Please use the link from your latest email.',
    },
  }[state]

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0A2E27]/60 p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
          {state === 'invalid' ? <IconMail className="h-5 w-5" /> : <IconCheck className="h-5 w-5" />}
        </div>
        <h2 className="mt-4 text-lg font-bold text-[#0F3D32]">{content.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{content.text}</p>
        {state !== 'loading' && (
          <button
            onClick={onClose}
            className="mt-6 inline-flex h-10 cursor-pointer items-center rounded-lg bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] px-5 text-sm font-semibold text-white transition hover:from-[#0D3A31] hover:to-[#2F9678]"
          >
            Close
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subMessage, setSubMessage] = useState(null) // { type: 'ok' | 'info' | 'error', text }
  const [unsubState, setUnsubState] = useState(null) // null | 'loading' | 'done' | 'invalid'
  const [footerRef, inView] = useInView(0.1)

  // Opened from the "Unsubscribe" link in an email: /?unsubscribe=<token>
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('unsubscribe')
    if (!token) return

    setUnsubState('loading')
    unsubscribeByToken(token)
      .then((ok) => setUnsubState(ok ? 'done' : 'invalid'))
      .catch(() => setUnsubState('invalid'))

    // remove the token from the address bar
    const url = new URL(window.location.href)
    url.searchParams.delete('unsubscribe')
    window.history.replaceState({}, '', url.pathname + url.search + url.hash)
  }, [])

  async function handleSubscribe(e) {
    e.preventDefault()
    const value = email.trim()
    if (!value || submitting) return

    setSubmitting(true)
    setSubMessage(null)
    try {
      const result = await subscribeToUpdates(value)
      if (result === 'already') {
        setSubMessage({ type: 'info', text: "You're already subscribed. Thank you!" })
      } else {
        setSubMessage({ type: 'ok', text: "Thanks, you're on the list! You'll hear from us about new updates." })
      }
      setEmail('')
    } catch (err) {
      const invalid = String(err?.message ?? '').includes('invalid_email')
      setSubMessage({
        type: 'error',
        text: invalid ? 'Please enter a valid email address.' : 'Something went wrong. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer ref={footerRef} className={'relative overflow-hidden text-white ' + (inView ? 'footer-in' : '')}>
      <style>{`
        /* ── hover on links: a green line slides in and pushes the text right ── */
        .footer-link {
          display: inline-flex;
          align-items: center;
          transition: color 0.2s ease, transform 0.25s ease;
        }
        .footer-link::before {
          content: '';
          height: 2px;
          width: 0;
          margin-right: 0;
          border-radius: 2px;
          background: linear-gradient(90deg, #4FB28E, #9FD8C9);
          transition: width 0.25s ease, margin-right 0.25s ease;
        }
        .footer-link:hover { color: #fff; transform: translateX(2px); }
        .footer-link:hover::before { width: 14px; margin-right: 8px; }

        /* bottom links: a gradient underline draws itself from the left */
        .footer-underline { position: relative; display: inline-block; }
        .footer-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, #4FB28E, #9FD8C9);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }
        .footer-underline:hover::after { transform: scaleX(1); transform-origin: left; }

        /* ── scroll motion: blocks rise into place when the footer appears ── */
        .footer-reveal {
          opacity: 0;
          transform: translate(var(--fx, 0px), var(--fy, 32px));
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
          transition-delay: var(--d, 0s);
        }
        .footer-in .footer-reveal { opacity: 1; transform: none; }

        .footer-title-line { width: 0; transition: width 0.8s ease 0.5s; }
        .footer-in .footer-title-line { width: 28px; }

        /* shimmering top bar */
        @keyframes footer-bar-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .footer-bar { background-size: 200% 100%; animation: footer-bar-shimmer 6s linear infinite; }

        /* slowly drifting map lines */
        @keyframes footer-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-26px, 10px); }
        }
        .footer-drift { animation: footer-drift 16s ease-in-out infinite; }

        /* social icons lift and turn green */
        .footer-social { transition: transform 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease; }
        .footer-social:hover {
          transform: translateY(-4px);
          background-color: #2F9678;
          box-shadow: 0 8px 18px -6px rgba(0, 0, 0, 0.45);
        }

        /* back-to-top arrow bounces on hover */
        @keyframes footer-top-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .footer-top-btn:hover .footer-top-arrow { animation: footer-top-bounce 0.7s ease infinite; }

        @media (prefers-reduced-motion: reduce) {
          .footer-reveal { opacity: 1; transform: none; transition: none; }
          .footer-title-line { width: 28px; transition: none; }
          .footer-bar, .footer-drift { animation: none; }
        }

        /* shine sweep across the Entertainment button on hover */
        @keyframes footer-cta-shine {
          0% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        .footer-cta-shine { transform: translateX(-120%) skewX(-20deg); }
        .footer-cta:hover .footer-cta-shine { animation: footer-cta-shine 0.85s ease; }

        /* stars + balloons that blow outward from the Entertainment button on hover */
        .footer-cta-particle {
          position: absolute;
          opacity: 0;
          font-size: 15px;
          line-height: 1;
          pointer-events: none;
          will-change: transform, opacity;
        }
        .footer-cta:hover .footer-cta-particle { animation-fill-mode: forwards; animation-timing-function: ease-out; }
        .footer-cta-p1 { left: 14%; top: 10%; }
        .footer-cta:hover .footer-cta-p1 { animation: footer-cta-burst-a 0.9s both; }
        .footer-cta-p2 { left: 34%; top: 0%; }
        .footer-cta:hover .footer-cta-p2 { animation: footer-cta-burst-b 1s 0.05s both; }
        .footer-cta-p3 { left: 58%; top: 5%; }
        .footer-cta:hover .footer-cta-p3 { animation: footer-cta-burst-c 0.85s 0.1s both; }
        .footer-cta-p4 { left: 78%; top: -2%; }
        .footer-cta:hover .footer-cta-p4 { animation: footer-cta-burst-a 0.95s 0.08s both; }
        .footer-cta-p5 { left: 92%; top: 30%; }
        .footer-cta:hover .footer-cta-p5 { animation: footer-cta-burst-b 0.9s 0.12s both; }
        .footer-cta-p6 { left: 4%; top: 55%; }
        .footer-cta:hover .footer-cta-p6 { animation: footer-cta-burst-c 1s 0.02s both; }
        @keyframes footer-cta-burst-a {
          0% { opacity: 0; transform: translate(0,0) scale(0.3) rotate(0deg); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translate(-22px,-34px) scale(1.15) rotate(-18deg); }
        }
        @keyframes footer-cta-burst-b {
          0% { opacity: 0; transform: translate(0,0) scale(0.3) rotate(0deg); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translate(8px,-40px) scale(1.2) rotate(12deg); }
        }
        @keyframes footer-cta-burst-c {
          0% { opacity: 0; transform: translate(0,0) scale(0.3) rotate(0deg); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translate(24px,-30px) scale(1.1) rotate(20deg); }
        }
      `}</style>

      <div className="footer-bar h-1 bg-gradient-to-r from-[#0F3D32] via-[#2F9678] to-[#0F3D32]" />

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/galaxy-footer.jpeg')",
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F3D32]/93 via-[#1B5E4F]/85 to-[#0F3D32]/95" />

      {/* soft lights and survey-map lines behind the content */}
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 animate-pulse rounded-full bg-[#2F9678]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 animate-pulse rounded-full bg-[#9FD8C9]/10 blur-3xl" />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g className="footer-drift" fill="none" stroke="#9FD8C9" strokeWidth="1.2">
          <path strokeOpacity="0.12" d="M -60 120 C 200 40, 420 200, 640 110 S 1040 60, 1260 150" />
          <path strokeOpacity="0.09" d="M -60 175 C 190 100, 410 250, 630 165 S 1030 115, 1260 205" />
          <path strokeOpacity="0.07" d="M -60 230 C 180 160, 400 300, 620 220 S 1020 170, 1260 260" />
        </g>
      </svg>

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="footer-reveal" style={{ '--fx': '-28px', '--fy': '0px', '--d': '0.05s' }}>
            <div className="mb-5">
              <img src={peakstarLogo} alt="Peakstar" className="h-14 w-auto" />
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              From precision surveying and land-use planning to remote sensing and
              geospatial analytics, Peakstar turns Rwanda's landscapes into data
              you can build on.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <SocialIcon href="https://linkedin.com" label="LinkedIn"><LinkedInIcon /></SocialIcon>
              <SocialIcon href="https://x.com" label="X"><XIcon /></SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram"><InstagramIcon /></SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube"><YouTubeIcon /></SocialIcon>
              <SocialIcon href="https://flickr.com" label="Flickr"><FlickrIcon /></SocialIcon>
            </div>
            <p className="mt-5 flex items-center gap-1.5 text-xs text-gray-400">
              <IconPin className="h-3.5 w-3.5 shrink-0 text-[#4FB28E]" />
              Kicukiro District, Kigali, Rwanda
            </p>
          </div>

          <div className="footer-reveal" style={{ '--d': '0.2s' }}>
            <FooterColumn title="Navigate" links={navigate} />
          </div>

          <div className="footer-reveal" style={{ '--d': '0.35s' }}>
            <FooterHeading>Subscribe</FooterHeading>
            <p className="text-sm leading-relaxed text-gray-300">
              Get updates on new projects, publications, services and posts | no spam.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4">
              <div className="flex items-center gap-1.5 rounded-xl bg-white p-1.5 pl-3 shadow-sm ring-1 ring-black/5 transition focus-within:ring-2 focus-within:ring-[#2F9678]">
                <IconMail className="h-4 w-4 shrink-0 text-[#1B5E4F]/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  disabled={submitting}
                  className="w-full bg-transparent py-1.5 text-sm text-[#0F3D32] placeholder-gray-400 outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  disabled={submitting}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E4F] to-[#2F9678] text-white shadow-sm transition hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <IconSpinner className="h-4 w-4" /> : <IconArrowRight className="h-4 w-4" />}
                </button>
              </div>

              {subMessage && (
                <p
                  className={
                    'mt-2 flex items-start gap-1.5 text-xs ' +
                    (subMessage.type === 'error' ? 'text-red-300' : 'text-[#7AC9AA]')
                  }
                >
                  {subMessage.type !== 'error' && <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  <span>{subMessage.text}</span>
                </p>
              )}
            </form>
          </div>

          <div className="footer-reveal" style={{ '--fx': '28px', '--fy': '0px', '--d': '0.5s' }}>
            <FooterHeading>Beyond Engineering</FooterHeading>
            <p className="text-sm leading-relaxed text-gray-300">
              Peakstar Engineering is only one side of who we are. Curious what
              else we're building? Explore Peakstar Entertainment.
            </p>
            <a
              href="/entertainment"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-cta group relative mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1B5E4F] to-[#2F9678] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition duration-300 hover:-rotate-2 hover:scale-105 hover:shadow-2xl"
            >
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                <span className="footer-cta-shine absolute inset-y-0 -left-1/2 w-1/2 bg-white/35" />
              </span>

              <span className="footer-cta-particle footer-cta-p1">⭐</span>
              <span className="footer-cta-particle footer-cta-p2">🎈</span>
              <span className="footer-cta-particle footer-cta-p3">✦</span>
              <span className="footer-cta-particle footer-cta-p4">🎈</span>
              <span className="footer-cta-particle footer-cta-p5">✧</span>
              <span className="footer-cta-particle footer-cta-p6">⭐</span>

              <IconTicket className="relative z-10 h-4 w-4 shrink-0" />
              <span className="relative z-10">Explore Peakstar Entertainment</span>
              <IconArrowRight className="relative z-10 h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>

      <div
        className="footer-reveal relative border-t border-white/10 bg-[#0C3229]/70 backdrop-blur-sm"
        style={{ '--fy': '16px', '--d': '0.65s' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-300 md:flex-row">
          <p>© {year} Peakstar Ltd· A Registered Private Company in Rwanda</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="footer-underline transition-colors hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="footer-underline transition-colors hover:text-white">Terms & Conditions</Link>
            <Link to="/faqs" className="footer-underline transition-colors hover:text-white">FAQs</Link>
            <Link to="/sitemap" className="footer-underline transition-colors hover:text-white">Sitemap</Link>
            <Link to="/accessibility" className="footer-underline transition-colors hover:text-white">Accessibility Statement</Link>
          </div>
        </div>
      </div>

      <BackToTop />
      <UnsubscribeNotice state={unsubState} onClose={() => setUnsubState(null)} />
    </footer>
  )
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="footer-social flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-200 ring-1 ring-white/20 backdrop-blur-sm hover:text-white hover:ring-white/40"
    >
      {children}
    </a>
  )
}

function IconPin(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function IconMail(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  )
}
function IconArrowRight(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
function IconArrowUp(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  )
}
function IconCheck(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconSpinner(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" className={`animate-spin ${props.className ?? ''}`}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
function IconTicket(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 1.5 1.5 0 0 0 0 6 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 1.5 1.5 0 0 0 0-6Z" />
      <path d="M10 6v1.2M10 10.4v3.2M10 16.8V18" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8.5 8h3.8v2.2h.06c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.77 2.65 4.77 6.1V24h-4v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.78V24h-4V8z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 1.2h3.7l-8.1 9.2 9.5 12.4h-7.4l-5.8-7.6-6.6 7.6H.6l8.6-9.9L0 1.2h7.6l5.3 7 6-7zm-1.3 19.3h2L6.5 3.4h-2l13.1 17.1z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.3.15 4.8 1.7 5 5 .06 1.3.07 1.6.07 4.8s0 3.5-.07 4.8c-.15 3.3-1.7 4.8-5 5-1.3.06-1.6.07-4.9.07s-3.6 0-4.9-.07c-3.3-.15-4.8-1.7-5-5C2.04 15.6 2 15.3 2 12s0-3.5.07-4.8c.15-3.3 1.7-4.8 5-5C8.4 2.2 8.7 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.8.07-2.4.1-3.5 1.2-3.6 3.6-.06 1.3-.07 1.6-.07 4.8s0 3.5.07 4.8c.1 2.4 1.2 3.5 3.6 3.6 1.3.06 1.6.07 4.8.07s3.5 0 4.8-.07c2.4-.1 3.5-1.2 3.6-3.6.06-1.3.07-1.6.07-4.8s0-3.5-.07-4.8c-.1-2.4-1.2-3.5-3.6-3.6-1.3-.06-1.6-.07-4.8-.07zm0 3.1a4.9 4.9 0 110 9.8 4.9 4.9 0 010-9.8zm0 1.8a3.1 3.1 0 100 6.2 3.1 3.1 0 000-6.2zm5.1-2a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z" />
    </svg>
  )
}

function FlickrIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="7" cy="12" r="5" />
      <circle cx="17" cy="12" r="5" />
    </svg>
  )
}