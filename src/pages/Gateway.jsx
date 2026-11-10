// src/pages/Gateway.jsx
import { Link } from 'react-router-dom'
import logo from '../assets/images/peakstar-logo.png'
import engineeringImg from '../assets/images/Peak Star Engineering.jpg'
import entertainmentImg from '../assets/images/Peak Star Entertainment.jpg'

/* ---------- small icons ---------- */
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

function CompassIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" />
    </Svg>
  )
}

function SparkIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M19 16v4M17 18h4" />
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

/* ---------- one choice card ---------- */
function ChoiceCard({ to, image, shade, icon, side, message, delay }) {
  return (
    <Link
      to={to}
      style={{ animationDelay: delay }}
      aria-label={`Enter Peak Star ${side}`}
      className="gw-rise group relative isolate flex min-h-[24rem] flex-1 flex-col justify-between overflow-hidden rounded-3xl bg-[#0A2E27] p-7 text-white shadow-[0_30px_60px_-28px_rgba(10,46,39,0.65)] ring-1 ring-white/10 transition-[flex-grow,transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_40px_70px_-28px_rgba(10,46,39,0.8)] sm:p-10 lg:min-h-[28rem] lg:hover:grow-[1.12]"
    >
      {/* the photo (zooms in very slowly on hover) + a green shade so the words stay easy to read */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          src={image}
          alt=""
          decoding="async"
          className="h-full w-full scale-105 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.14]"
        />
        <div className={`absolute inset-0 transition-opacity duration-500 group-hover:opacity-90 ${shade}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E27]/80 via-transparent to-transparent" />
      </div>

      {/* top: welcome */}
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-white/10 text-[#9FD8C9] ring-1 ring-white/25 backdrop-blur-sm">
          {icon}
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#9FD8C9]">Welcome to</p>
      </div>

      {/* middle: the name, the part a visitor must spot first */}
      <div className="my-8">
        <p className="text-2xl font-bold tracking-tight text-white/90 sm:text-3xl">Peak Star</p>
        <h2 className="gw-shine mt-1 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
          {side}
        </h2>
        <div className="mt-5 h-1 w-14 rounded-full bg-[#9FD8C9] transition-all duration-500 group-hover:w-32" />
        <p className="mt-5 max-w-sm text-base text-white/85 sm:text-lg">{message}</p>
      </div>

      {/* bottom: enter */}
      <div>
        <span className="inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0D3A31] shadow-md transition duration-200 group-hover:shadow-xl">
          Enter
          <ArrowRightIcon
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1.5"
          />
        </span>
      </div>
    </Link>
  )
}

/* ---------- the page ---------- */
export default function Gateway() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#F1F6F4]">
      <style>{`
        @keyframes gw-rise {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gw-fade {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gw-shine {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes gw-line {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .gw-fade { animation: gw-fade 0.7s ease-out both; }
        .gw-rise { animation: gw-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .gw-line { animation: gw-line 0.9s 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* the big word on each card: white with a soft mint shine moving across it */
        .gw-shine {
          background-image: linear-gradient(90deg, #ffffff 0%, #9FD8C9 25%, #ffffff 50%, #9FD8C9 75%, #ffffff 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: gw-shine 6s linear infinite;
        }
        /* "GROUP" under the logo */
        .gw-group {
          background-image: linear-gradient(90deg, #0D3A31 0%, #2F8F7A 30%, #0D3A31 60%, #2F8F7A 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: gw-shine 7s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .gw-fade, .gw-rise, .gw-line, .gw-shine, .gw-group { animation: none; }
        }
      `}</style>

      {/* faint dots, same as the Partners section */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #1B5E4F 1.2px, transparent 1.4px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute -left-24 top-10 size-80 rounded-full bg-[#2F8F7A]/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 size-80 rounded-full bg-[#9FD8C9]/20 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:py-14">
        {/* logo + "GROUP". The logo already says "Peak Star", so only "GROUP" is written
            here and together they read as one name: Peak Star Group */}
        <header className="gw-fade flex flex-col items-center text-center">
          <img src={logo} alt="Peak Star" className="h-20 w-auto object-contain sm:h-24" />

          <div className="mt-2 flex items-center gap-4">
            <span className="gw-line hidden h-px w-14 origin-right bg-gradient-to-r from-transparent to-[#2F8F7A] sm:block" />
            <h1 className="gw-group pl-[0.6em] text-xl font-extrabold uppercase tracking-[0.6em] sm:text-2xl">
              <span className="sr-only">Peak Star </span>
              Group
            </h1>
            <span className="gw-line hidden h-px w-14 origin-left bg-gradient-to-l from-transparent to-[#2F8F7A] sm:block" />
          </div>
        </header>

        {/* the two choices */}
        <section className="mt-10 flex flex-1 flex-col gap-5 lg:flex-row lg:items-stretch">
          <ChoiceCard
            to="/engineering"
            image={engineeringImg}
            shade="bg-gradient-to-br from-[#0A2E27]/85 via-[#0D3A31]/60 to-[#1B5E4F]/45"
            icon={<CompassIcon size={16} />}
            side="Engineering"
            message="We turn land into decisions that last."
            delay="0.15s"
          />
          <ChoiceCard
            to="/entertainment"
            image={entertainmentImg}
            shade="bg-gradient-to-br from-[#0A2E27]/80 via-[#1B5E4F]/50 to-[#2F9678]/35"
            icon={<SparkIcon size={16} />}
            side="Entertainment"
            message="Where real talent gets seen."
            delay="0.3s"
          />
        </section>

        <p className="gw-fade mt-8 text-center text-xs text-gray-400" style={{ animationDelay: '0.6s' }}>
          &copy; {new Date().getFullYear()} Peakstar Ltd, a registered private company in Rwanda
        </p>
      </div>
    </main>
  )
}