// src/components/Footer.jsx
import { Link } from 'react-router-dom'

const navigate = [
  { label: 'Home', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog & News', to: '/blog' },
  { label: 'Publications', to: '/publications' },
]

const company = [
  { label: 'Publications', to: '/publications' },
  { label: 'Careers', to: '/careers' },
  { label: 'Partners', to: '/partners' },
  { label: 'Contact', to: '/contact' },
]

const legal = [
  { label: 'Peakstar CBC - Community Benefit Company', to: null },
  { label: 'HQ: KK 513 St, Kicukiro District, Kigali, Rwanda', to: null },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
]

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link
                to={item.to}
                className="text-sm text-gray-300 transition-colors duration-200 hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm text-gray-300">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden text-white">
      {/* ── Galaxy background image, fixed/"stuck" in place while content scrolls over it ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/galaxy-footer.jpeg')",
          backgroundAttachment: 'fixed', // ← this is what gives the "stuck" / parallax feel
        }}
      />
      {/* Dark overlay so white text stays readable over the bright galaxy core */}
      <div className="absolute inset-0 bg-black/70" />

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand block */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">Peakstar</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              Mapping Rwanda's ground truth — geospatial technology and data
              services, reinvested in Rwanda's future.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <LinkedInIcon />
              </SocialIcon>
              <SocialIcon href="https://x.com" label="X">
                <XIcon />
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <InstagramIcon />
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube">
                <YouTubeIcon />
              </SocialIcon>
              <SocialIcon href="https://flickr.com" label="Flickr">
                <FlickrIcon />
              </SocialIcon>
            </div>
          </div>

          <FooterColumn title="Navigate" links={navigate} />
          <FooterColumn title="Company" links={company} />
          <FooterColumn title="Legal / Corporate" links={legal} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-300 md:flex-row">
          <p>© {year} Peakstar Ltd· A Registered Private Company in Rwanda</p>
          <div className="flex gap-6">
            <Link to="/faqs" className="transition-colors hover:text-white">FAQs</Link>
            <Link to="/sitemap" className="transition-colors hover:text-white">Sitemap</Link>
            <Link to="/accessibility" className="transition-colors hover:text-white">Accessibility Statement</Link>
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