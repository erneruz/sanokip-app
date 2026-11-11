// src/pages/entertainment/EntertainmentPlaceholder.jsx
// Temporary page used by every Entertainment route until its real page is built.
import { Link } from 'react-router-dom'

export default function EntertainmentPlaceholder({ eyebrow = 'Peak Star Entertainment', title, text }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2E27] via-[#0D3A31] to-[#154A3F]">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#9FD8C9]">
          <span className="h-px w-8 bg-[#9FD8C9]" />
          {eyebrow}
          <span className="h-px w-8 bg-[#9FD8C9]" />
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
        {text && <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">{text}</p>}
        <p className="mt-3 text-sm text-[#9FD8C9]">This page is being built.</p>

        <Link
          to="/entertainment/submit"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2F9678] to-[#9FD8C9] px-6 py-3 text-sm font-semibold text-[#0A2E27] shadow-[0_12px_30px_-10px_rgba(159,216,201,0.7)] transition hover:brightness-110 active:scale-95"
        >
          Submit a talent
        </Link>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-[#2F9678] via-[#9FD8C9] to-[#E6F1EE]" />
    </section>
  )
}