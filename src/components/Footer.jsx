// src/components/Footer.jsx
import { Link } from 'react-router-dom'

const navigate = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: "Map'n Kawa", to: '/mapn-kawa' },
  { label: 'Blog & Reports', to: '/blog' },
]

const company = [
  { label: 'Reports & Publications', to: '/reports' },
  { label: 'Community', to: '/community' },
  { label: 'Careers', to: '/careers' },
  { label: 'Partners', to: '/partners' },
  { label: 'Contact', to: '/contact' },
]

const legal = [
  { label: 'Sanokip CBC - Community Benefit Company', to: null },
  { label: 'HQ: KK 513 St, Kicukiro District, Kigali, Rwanda', to: null },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
]

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 font-bold text-white">{title}</h3>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link to={item.to} className="text-gray-300 hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-300">{item.label}</span>
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
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand block */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              {/* swap for your real logo asset */}
              <div className="h-8 w-8 rounded-full border-2 border-white" />
              <span className="text-lg font-semibold">Sanokip</span>
            </div>
            <p className="text-sm text-gray-300">
              Mapping Rwanda's ground truth - geospatial technology and data
              services, reinvested in Rwanda's future.
            </p>
            <div className="mt-5 flex gap-3">
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <LinkedInIcon />
              </SocialIcon>
              <SocialIcon href="https://x.com" label="X">
                <XIcon />
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <InstagramIcon />
              </SocialIcon>
            </div>
          </div>

          <FooterColumn title="Navigate" links={navigate} />
          <FooterColumn title="Reports & Publications" links={company} />
          <FooterColumn title="Legal / Corporate" links={legal} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-400 md:flex-row">
          <p>© {year} Sanokip CBC · A Registered Community Benefit Company in Rwanda</p>
          <div className="flex gap-6">
            <Link to="/faqs" className="hover:text-white">FAQs</Link>
            <Link to="/sitemap" className="hover:text-white">Sitemap</Link>
            <Link to="/accessibility" className="hover:text-white">Accessibility Statement</Link>
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
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
    >
      {children}
    </a>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8.5 8h3.8v2.2h.06c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.77 2.65 4.77 6.1V24h-4v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.78V24h-4V8z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 1.2h3.7l-8.1 9.2 9.5 12.4h-7.4l-5.8-7.6-6.6 7.6H.6l8.6-9.9L0 1.2h7.6l5.3 7 6-7zm-1.3 19.3h2L6.5 3.4h-2l13.1 17.1z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.3.15 4.8 1.7 5 5 .06 1.3.07 1.6.07 4.8s0 3.5-.07 4.8c-.15 3.3-1.7 4.8-5 5-1.3.06-1.6.07-4.9.07s-3.6 0-4.9-.07c-3.3-.15-4.8-1.7-5-5C2.04 15.6 2 15.3 2 12s0-3.5.07-4.8c.15-3.3 1.7-4.8 5-5C8.4 2.2 8.7 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.8.07-2.4.1-3.5 1.2-3.6 3.6-.06 1.3-.07 1.6-.07 4.8s0 3.5.07 4.8c.1 2.4 1.2 3.5 3.6 3.6 1.3.06 1.6.07 4.8.07s3.5 0 4.8-.07c2.4-.1 3.5-1.2 3.6-3.6.06-1.3.07-1.6.07-4.8s0-3.5-.07-4.8c-.1-2.4-1.2-3.5-3.6-3.6-1.3-.06-1.6-.07-4.8-.07zm0 3.1a4.9 4.9 0 110 9.8 4.9 4.9 0 010-9.8zm0 1.8a3.1 3.1 0 100 6.2 3.1 3.1 0 000-6.2zm5.1-2a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3z" />
    </svg>
  )
}