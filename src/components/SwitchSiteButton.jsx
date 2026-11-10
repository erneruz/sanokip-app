// src/components/SwitchSiteButton.jsx
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/images/logo.png'

// pages where the button must NOT show
const HIDDEN_ON = ['/entertainment', '/admin', '/login', '/register']

function ArrowLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </svg>
  )
}

export default function SwitchSiteButton() {
  const { pathname } = useLocation()
  const [ready, setReady] = useState(false) // slid in
  const [open, setOpen] = useState(false) // label showing

  const hidden =
    pathname === '/' || HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  // slide in after a moment, show the label for a few seconds, then fold into a round button
  useEffect(() => {
    if (hidden) {
      setReady(false)
      setOpen(false)
      return
    }
    const showTimer = setTimeout(() => {
      setReady(true)
      setOpen(true)
    }, 900)
    const foldTimer = setTimeout(() => setOpen(false), 6500)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(foldTimer)
    }
  }, [hidden])

  if (hidden) return null

  return (
    <>
      <style>{`
        @keyframes ssb-ring {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .ssb-ring { animation: ssb-ring 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .ssb-ring { animation: none; } }
      `}</style>

      <Link
        to="/"
        aria-label="Back to Peak Star Group, choose Engineering or Entertainment"
        title="Back to Peak Star Group"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={`fixed bottom-5 left-5 z-40 flex items-center rounded-full bg-gradient-to-r from-[#0D3A31] to-[#1B5E4F] p-1.5 text-white shadow-[0_12px_30px_-8px_rgba(10,46,39,0.6)] ring-1 ring-white/20 transition-all duration-500 hover:shadow-[0_16px_36px_-8px_rgba(10,46,39,0.75)] ${
          ready ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
      >
        {/* round logo button, with a soft ring that pulses so it is easy to spot */}
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white">
          <img src={logo} alt="" className="size-6 object-contain" />
          {!open && (
            <span aria-hidden="true" className="ssb-ring absolute inset-0 rounded-full ring-2 ring-[#9FD8C9]" />
          )}
        </span>

        {/* label that opens and folds */}
        <span
          className={`flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-500 ${
            open ? 'max-w-[13rem] pl-3 pr-3 opacity-100' : 'max-w-0 pl-0 pr-0 opacity-0'
          }`}
        >
          <ArrowLeftIcon />
          <span className="leading-tight">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9FD8C9]">
              Back to
            </span>
            <span className="block text-sm font-semibold">Peak Star Group</span>
          </span>
        </span>
      </Link>
    </>
  )
}