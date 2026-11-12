// src/components/entertainment/CountryPhoneInput.jsx
// Phone field with a country picker (flag + dial code) and a box for the number
// WITHOUT the country code. The value it gives back is the full international
// number, for example "+250788123456" (or "" while the number box is empty).
import { useEffect, useMemo, useRef, useState } from 'react'
import { COUNTRIES, flagUrl, getCountryByCode, splitPhone } from '../../constants/countries'

function Flag({ code, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className={`inline-flex h-[15px] w-5 items-center justify-center rounded-sm bg-[#CDEBE2] text-[8px] font-bold text-[#0F3D32] ${className}`}>
        {code}
      </span>
    )
  }
  return (
    <img
      src={flagUrl(code, 20)}
      srcSet={`${flagUrl(code, 40)} 2x`}
      width="20"
      height="15"
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-[15px] w-5 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10 ${className}`}
    />
  )
}

export default function CountryPhoneInput({ id = 'phone', label = 'Phone number', value, onChange, required = true }) {
  const initial = useMemo(() => splitPhone(value), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [code, setCode] = useState(initial.code)
  const [number, setNumber] = useState(initial.number)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const boxRef = useRef(null)

  const country = getCountryByCode(code)

  // give the full number back to the form
  function emit(nextCode, nextNumber) {
    const c = getCountryByCode(nextCode)
    onChange?.(nextNumber ? `${c.dial}${nextNumber}` : '')
  }

  function handleNumber(e) {
    // digits only; a leading 0 (0788...) is dropped because the country code replaces it
    const digits = e.target.value.replace(/[^\d]/g, '').replace(/^0+/, '').slice(0, 14)
    setNumber(digits)
    emit(code, digits)
  }

  function pick(c) {
    setCode(c.code)
    setOpen(false)
    setQuery('')
    emit(c.code, number)
  }

  // close on outside click / Escape
  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const q = query.trim().toLowerCase()
  const list = q
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.dial.replace('+', '').startsWith(q.replace('+', '')))
    : COUNTRIES

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-stretch rounded-xl border border-gray-200 bg-white transition focus-within:border-[#2F9678] focus-within:ring-2 focus-within:ring-[#9FD8C9]/50">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code, ${country.name} ${country.dial}`}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-l-xl border-r border-gray-200 px-3 py-3 text-sm text-gray-800 transition hover:bg-[#F1F6F4]"
        >
          <Flag code={code} />
          <span className="font-medium">{country.dial}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          value={number}
          onChange={handleNumber}
          placeholder={code === 'RW' ? '788 123 456' : 'Phone number'}
          className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-400">Write the number without the country code.</p>

      {open && (
        <div className="absolute left-0 z-30 mt-1 w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10">
          <div className="border-b border-gray-100 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full rounded-lg bg-[#F1F6F4] px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#9FD8C9]/60"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {list.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.code === code}
                  onClick={() => pick(c)}
                  className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-[#E6F1EE] ${
                    c.code === code ? 'bg-[#F1F6F4] font-semibold text-[#0F3D32]' : 'text-gray-700'
                  }`}
                >
                  <Flag code={c.code} />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="text-gray-400">{c.dial}</span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="px-3 py-3 text-sm text-gray-400">No country found.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}