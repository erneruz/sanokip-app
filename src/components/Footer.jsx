// src/components/Footer.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import peakstarLogo from '../assets/images/peakstar-logo-white.png'

const navigate = [
  { label: 'Home', to: '/' }, // ← changed: Home now has its own page (it used to go to /blog)
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog & News', to: '/blog' },
  { label: 'Publications', to: '/publications' },
]

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              className="footer-link text-sm text-gray-300 transition-colors duration-200 hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="relative overflow-hidden text-white">
      <style>{`
        @keyframes footer-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(-3px) rotate(-2deg); }
          30% { transform: translateX(3px) rotate(2deg); }
          45% { transform: translateX(-2px) rotate(-1deg); }
          60% { transform: translateX(2px) rotate(1deg); }
          80% { transform: translateX(-1px) rotate(0deg); }
        }
        .footer-link { display: inline-block; }
        .footer-link:hover { animation: footer-shake 0.45s ease; font-weight: 600; }

        /* ← added: shine sweep across the Entertainment button on hover */
        @keyframes footer-cta-shine {
          0% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        .footer-cta-shine { transform: translateX(-120%) skewX(-20deg); }
        .footer-cta:hover .footer-cta-shine { animation: footer-cta-shine 0.85s ease; }

        /* ← added: stars + balloons that blow outward from the Entertainment
           button on hover */
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

      <div className="h-1 bg-gradient-to-r from-[#0F3D32] via-[#1B5E4F] to-[#2F9678]" />

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/galaxy-footer.jpeg')",
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F3D32]/93 via-[#1B5E4F]/85 to-[#0F3D32]/95" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
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

          <FooterColumn title="Navigate" links={navigate} />

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Subscribe</h3>
            <p className="text-sm leading-relaxed text-gray-300">
              Occasional updates on new projects, publications, and insights | no spam.
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
                  className="w-full bg-transparent py-1.5 text-sm text-[#0F3D32] placeholder-gray-400 outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E4F] to-[#2F9678] text-white shadow-sm transition hover:scale-105 hover:shadow-md"
                >
                  <IconArrowRight className="h-4 w-4" />
                </button>
              </div>
              {subscribed && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-[#7AC9AA]">
                  <IconCheck className="h-3.5 w-3.5 shrink-0" />
                  Thanks — you're on the list!
                </p>
              )}
            </form>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Beyond Engineering</h3>
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

      <div className="relative border-t border-white/10 bg-[#0C3229]/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-300 md:flex-row">
          <p>© {year} Peakstar Ltd· A Registered Private Company in Rwanda</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="footer-link transition-colors hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="footer-link transition-colors hover:text-white">Terms & Conditions</Link>
            <Link to="/faqs" className="footer-link transition-colors hover:text-white">FAQs</Link>
            <Link to="/sitemap" className="footer-link transition-colors hover:text-white">Sitemap</Link>
            <Link to="/accessibility" className="footer-link transition-colors hover:text-white">Accessibility Statement</Link>
          </div>
        </div>
      </div>
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
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-200 ring-1 ring-white/20 backdrop-blur-sm transition duration-200 hover:bg-white/20 hover:text-white hover:ring-white/40"
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
function IconCheck(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
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