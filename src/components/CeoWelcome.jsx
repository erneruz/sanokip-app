// src/components/CeoWelcome.jsx
// CEO welcome section for the Home page: small, decorated circular portrait.
import { useEffect, useRef, useState } from 'react'
import ceoImg from '../assets/images/claude.webp'

function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}

export default function CeoWelcome() {
  const [ref, seen] = useInView(0.2)

  const slide = (from, delay = 0) => ({
    opacity: seen ? 1 : 0,
    transform: seen ? 'translate3d(0,0,0)' : `translate3d(${from}px,0,0)`,
    transition: `opacity .8s ease ${delay}ms, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
  })

  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-20 lg:py-28">
      <style>{`
        @keyframes ceo-spin { to { transform: rotate(360deg); } }
        @keyframes ceo-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes ceo-glow {
          0%, 100% { opacity: .55; transform: scale(1); }
          50% { opacity: .95; transform: scale(1.08); }
        }
        @keyframes ceo-ping {
          0% { transform: scale(1); opacity: .55; }
          80%, 100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes ceo-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .ceo-ring {
          background: conic-gradient(from 0deg, #0D3A31, #2F8F7A, #9FD8C9, #1B5E4F, #A8E0CE, #0D3A31);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px));
                  mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px));
          animation: ceo-spin 14s linear infinite;
        }
      `}</style>

      {/* soft background shapes */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#E6F1EE] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#E6F1EE] blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[320px_1fr] lg:gap-16">
        {/* ───────── portrait ───────── */}
        <div className="flex justify-center" style={slide(-60)}>
          <div className="relative h-[250px] w-[250px] sm:h-[270px] sm:w-[270px]">
            {/* breathing glow */}
            <div
              className="absolute -inset-6 rounded-full bg-[#9FD8C9]/60 blur-2xl"
              style={{ animation: 'ceo-glow 4.5s ease-in-out infinite' }}
            />

            {/* dashed orbit with three dots, turning the other way */}
            <div
              className="absolute -inset-5 rounded-full border border-dashed border-[#2F8F7A]/50"
              style={{ animation: 'ceo-spin-rev 40s linear infinite' }}
            >
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2F8F7A]" />
              <span className="absolute bottom-[14%] left-[7%] h-2 w-2 rounded-full bg-[#9FD8C9]" />
              <span className="absolute bottom-[14%] right-[7%] h-1.5 w-1.5 rounded-full bg-[#1B5E4F]" />
            </div>

            {/* turning gradient ring */}
            <div className="ceo-ring absolute inset-0 rounded-full" />

            {/* white inner ring + shadow */}
            <div className="absolute inset-[9px] rounded-full bg-white shadow-[0_18px_40px_-12px_rgba(13,58,49,0.45)]" />

            {/* photo */}
            <div className="absolute inset-[15px] overflow-hidden rounded-full bg-[#E6F1EE]">
              <img
                src={ceoImg}
                alt="Mr. Jean Claude Ntirenganya, Chief Executive Officer of Peak Star"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-[#0D3A31]/10" />
            </div>

            {/* award badge */}
            <div
              className="absolute right-1 top-3 sm:right-0"
              style={{ animation: 'ceo-bob 3.8s ease-in-out infinite' }}
            >
              <span
                className="absolute inset-0 rounded-full bg-[#2F8F7A]"
                style={{ animation: 'ceo-ping 2.6s ease-out infinite' }}
              />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#1B5E4F] to-[#0D3A31] text-white shadow-lg ring-4 ring-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="9" r="5.5" />
                  <path d="m8.5 13.5-1.5 7.5 5-3 5 3-1.5-7.5" />
                </svg>
              </div>
            </div>

            {/* name pill */}
            <div className="absolute -bottom-6 left-1/2 w-[112%] -translate-x-1/2 rounded-2xl bg-white px-4 py-3 text-center shadow-[0_14px_30px_-10px_rgba(13,58,49,0.4)] ring-1 ring-[#1B5E4F]/10">
              <p className="text-[15px] font-bold leading-tight text-[#0D3A31]">
                Mr. Jean Claude Ntirenganya
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2F8F7A]">
                <span className="h-px w-4 bg-[#2F8F7A]/50" />
                Chief Executive Officer
                <span className="h-px w-4 bg-[#2F8F7A]/50" />
              </p>
            </div>
          </div>
        </div>

        {/* ───────── message ───────── */}
        <div style={slide(60, 150)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1B5E4F]/15 bg-[#E6F1EE] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B5E4F]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M9.5 6C6.5 7 4.5 9.7 4.5 13v5h6v-6h-3c0-2 1-3.4 3-4L9.5 6Zm9 0c-3 1-5 3.7-5 7v5h6v-6h-3c0-2 1-3.4 3-4L18.5 6Z" />
            </svg>
            A word from our CEO
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#0D3A31] sm:text-4xl">
            Welcome to <span className="text-[#2F8F7A]">Peak Star</span>
          </h2>
          <div
            className="mt-4 h-1 rounded-full bg-gradient-to-r from-[#1B5E4F] to-[#9FD8C9]"
            style={{
              width: seen ? 72 : 0,
              transition: 'width 1s cubic-bezier(.2,.7,.2,1) .5s',
            }}
          />

          <div className="relative mt-8 rounded-3xl border border-[#1B5E4F]/10 bg-[#F1F6F4] p-7 sm:p-9">
            <div className="absolute -top-5 right-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B5E4F] to-[#0D3A31] text-white shadow-lg">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M9.5 6C6.5 7 4.5 9.7 4.5 13v5h6v-6h-3c0-2 1-3.4 3-4L9.5 6Zm9 0c-3 1-5 3.7-5 7v5h6v-6h-3c0-2 1-3.4 3-4L18.5 6Z" />
              </svg>
            </div>

            <div className="space-y-5 text-[15.5px] leading-[1.9] text-[#2c3e3a]">
              <p>
                It is a pleasure to welcome you to Peak Star Engineering. We exist for one simple
                reason: too many important decisions about land, cities and infrastructure are made
                without reliable information, and people pay the price.
              </p>
              <p>
                We believe engineering and technology should serve people first. That is why we
                bring together surveying, geospatial technology and planning, so that a farmer, a
                family, a district or a ministry can act with confidence on what they know to be
                true.
              </p>
              <p>
                Whether you are an institution, a developer, a community or an entrepreneur, our
                door is open. Tell us the problem, and we will bring the discipline, the technology
                and the care to solve it. It would be an honour to work with you.
              </p>
            </div>

            <div className="mt-7 border-t border-[#1B5E4F]/10 pt-5">
              <p
                className="text-2xl italic text-[#1B5E4F]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Jean Claude Ntirenganya
              </p>
              <p className="mt-1 text-sm text-gray-500">CEO, Peak Star Engineering</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}