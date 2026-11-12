// src/components/entertainment/EntAuthFrame.jsx
// The page around the Entertainment sign-up / sign-in forms: the Peak Star
// Entertainment picture in the background and the form card in the middle.
// The Entertainment navbar stays visible above it (it comes from the layout).
import entBackground from '../../assets/images/Peak Star Entertainment.jpg'

export default function EntAuthFrame({ eyebrow, title, text, maxWidth = 'max-w-md', children }) {
  return (
    <section className="ent-auth relative isolate overflow-hidden">
      <style>{`
        @keyframes ent-auth-rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ent-auth-zoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        .ent-auth-bg { animation: ent-auth-zoom 28s ease-in-out infinite alternate; }
        .ent-auth-rise { animation: ent-auth-rise .7s cubic-bezier(.2,.8,.2,1) both; }
        /* browser autofill paints inputs light blue; keep them white */
        .ent-auth input:-webkit-autofill,
        .ent-auth input:-webkit-autofill:hover,
        .ent-auth input:-webkit-autofill:focus {
          -webkit-text-fill-color: #111827;
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
          box-shadow: 0 0 0 1000px #ffffff inset;
          transition: background-color 9999s ease-out 0s;
        }
        @media (prefers-reduced-motion: reduce) { .ent-auth-bg, .ent-auth-rise { animation: none; } }
      `}</style>

      {/* background picture, with a green veil so the text stays readable */}
      <img
        src={entBackground}
        alt=""
        aria-hidden="true"
        className="ent-auth-bg absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0A2E27]/90 via-[#0D3A31]/80 to-[#0A2E27]/95" />

      <div className="mx-auto flex w-full flex-col items-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="ent-auth-rise max-w-2xl text-center">
          {eyebrow && (
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#9FD8C9]">
              <span className="h-px w-8 bg-[#9FD8C9]" />
              {eyebrow}
              <span className="h-px w-8 bg-[#9FD8C9]" />
            </p>
          )}
          {title && <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>}
          {text && <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">{text}</p>}
        </div>

        <div
          className={`ent-auth-rise mt-8 w-full ${maxWidth} rounded-3xl bg-white/95 p-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/40 backdrop-blur sm:p-8`}
          style={{ animationDelay: '120ms' }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}