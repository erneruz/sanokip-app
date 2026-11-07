// src/components/PartnersMarquee.jsx
import { Link } from 'react-router-dom'
import { partners } from './partners.data'

/* ---------- small icons (drawn here, no extra library) ---------- */
function Svg({ size = 16, className = '', strokeWidth = 2, children }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function LinkIcon(props) {
  return (
    <Svg {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  )
}

function GlobeIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </Svg>
  )
}

function ShieldCheckIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  )
}

function ArrowRightIcon(props) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </Svg>
  )
}

export default function PartnersMarquee() {
  // Eight copies of the list, so the track always stays wider than the screen.
  // The animation slides the track by exactly one quarter of its width, which
  // is two copies, then restarts, so the loop never shows a jump.
  const track = [
    ...partners, ...partners, ...partners, ...partners,
    ...partners, ...partners, ...partners, ...partners,
  ]

  return (
    <section className="relative isolate overflow-hidden border-t border-[#1B5E4F]/10 bg-[#F1F6F4]">
      {/* Scroll animation, defined here so this file is self-contained.
          To change the speed, edit the "20s" below: bigger = slower. */}
      <style>{`
        @keyframes partners-slide {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }
        .partners-track { animation: partners-slide 20s linear infinite; }
        .partners-viewport:hover .partners-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .partners-track { animation: none; }
        }
      `}</style>

      {/* only the faint dot pattern is kept */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #1B5E4F 1.2px, transparent 1.4px)',
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* ---------- heading ---------- */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F1EE] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15">
            <LinkIcon size={14} />
            Our Partners
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0D3A31] md:text-4xl">
            Stronger Together,{' '}
            <span className="bg-gradient-to-r from-[#1B5E4F] to-[#2F8F7A] bg-clip-text text-transparent">
              Mapping Further
            </span>
          </h2>

          <div className="mx-auto mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />

          <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
            We work alongside innovators, institutions and communities across Rwanda
            and beyond, turning shared knowledge into geospatial solutions that last.
          </p>

          {/* quick facts */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium text-[#1B5E4F]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-[#1B5E4F]/10">
              <LinkIcon size={14} className="text-[#2F8F7A]" />
              {partners.length} trusted partners
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-[#1B5E4F]/10">
              <GlobeIcon size={14} className="text-[#2F8F7A]" />
              Rwanda &amp; beyond
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-[#1B5E4F]/10">
              <ShieldCheckIcon size={14} className="text-[#2F8F7A]" />
              Built on trust
            </span>
          </div>
        </div>

        {/* ---------- scrolling logos ---------- */}
        {/* ← changed: gap between logos raised from "px-6 sm:px-7" to
            "px-8 sm:px-9". To change it again, edit those two numbers
            (bigger number = more space between logos). */}
        <div className="partners-viewport mt-12 overflow-hidden py-4">
          <div className="partners-track flex w-max items-center">
            {track.map((partner, i) => (
              <div key={`${partner.name}-${i}`} className="shrink-0 px-8 sm:px-9">
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={partner.name}
                  aria-label={partner.name}
                  className="group flex h-20 items-center justify-center"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-16 w-auto max-w-[9rem] object-contain opacity-75 grayscale transition duration-300 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- call to action ---------- */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">Want to collaborate with Peakstar?</p>
          <Link
            to="/about"
            className="group mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95"
          >
            Become a partner
            <ArrowRightIcon
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}