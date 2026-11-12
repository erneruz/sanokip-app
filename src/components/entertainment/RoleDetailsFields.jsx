// src/components/entertainment/RoleDetailsFields.jsx
// The extra questions for the kind of member chosen (talent, parent / guardian,
// scout, talent manager, partner). Nothing is shown for visitors.
// The questions come from constants/entRoleDetails.js.
// A question of kind "choice" (the position, role or style) opens by itself
// as soon as the category above it is chosen.
import { ROLE_DETAILS, visibleFields } from '../../constants/entRoleDetails'

const fieldClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50'

function Req() {
  return <span className="text-[#2F9678]"> *</span>
}

function Label({ htmlFor, field }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
      {field.label}
      {field.required && <Req />}
    </label>
  )
}

function Chevron() {
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
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

// value = the answers so far (an object), onChange gets the new whole object
export default function RoleDetailsFields({ role, value = {}, onChange, idPrefix = 'det' }) {
  const config = ROLE_DETAILS[role]
  if (!config) return null

  const set = (key, v) => {
    const next = { ...value, [key]: v }
    // a question that depends on this answer starts again (change football to music: pick a new role)
    config.fields.forEach((f) => {
      if (f.dependsOn === key) delete next[f.key]
    })
    onChange(next)
  }
  const toggle = (key, option) => {
    const current = Array.isArray(value[key]) ? value[key] : []
    set(key, current.includes(option) ? current.filter((x) => x !== option) : [...current, option])
  }

  const fields = visibleFields(role, value)

  return (
    <section
      key={role}
      className="rounded-2xl border border-[#CDEBE2] bg-[#F1F6F4]/70 p-4 sm:p-5"
      style={{ animation: 'ent-details-in .35s ease-out both' }}
    >
      <style>{`
        @keyframes ent-details-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { section[style*='ent-details-in'] { animation: none !important; } }
      `}</style>

      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1B5E4F] text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
          </svg>
        </span>
        <div>
          <h3 className="text-base font-semibold text-[#0F3D32]">{config.title}</h3>
          <p className="text-xs text-gray-500">{config.text}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `${idPrefix}-${f.key}`
          const v = value[f.key] ?? ''
          const wide = f.kind === 'multi' || f.kind === 'textarea' || f.kind === 'choice'
          const label = f.labelFor ? f.labelFor(value) : f.label

          return (
            <div key={f.key} className={wide ? 'sm:col-span-2' : ''} style={{ animation: 'ent-details-in .3s ease-out both' }}>
              {f.kind === 'multi' || f.kind === 'choice' ? (
                <>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    {label}
                    {f.required && <Req />}
                  </span>
                  <div className="flex flex-wrap gap-2" role={f.kind === 'choice' ? 'radiogroup' : 'group'} aria-label={label}>
                    {(f.optionsFor ? f.optionsFor(value) : f.options).map((o, i) => {
                      const on = f.kind === 'choice' ? v === o.value : Array.isArray(v) && v.includes(o.value)
                      return (
                        <button
                          key={o.value}
                          type="button"
                          role={f.kind === 'choice' ? 'radio' : 'checkbox'}
                          aria-checked={on}
                          style={f.kind === 'choice' ? { animation: 'ent-details-in .3s ease-out both', animationDelay: `${i * 35}ms` } : undefined}
                          onClick={() => (f.kind === 'choice' ? set(f.key, o.value) : toggle(f.key, o.value))}
                          className={
                            'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95 ' +
                            (on
                              ? 'border-[#1B5E4F] bg-[#1B5E4F] text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-[#9FD8C9] hover:bg-[#E6F1EE] hover:text-[#0F3D32]')
                          }
                        >
                          {on && <CheckMark />}
                          {o.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <>
                  <Label htmlFor={id} field={f} />
                  {f.kind === 'select' ? (
                    <div className="relative">
                      <select
                        id={id}
                        required={f.required}
                        value={v}
                        onChange={(e) => set(f.key, e.target.value)}
                        className={fieldClass + ' appearance-none pr-9'}
                      >
                        <option value="">{f.placeholder || 'Choose'}</option>
                        {f.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <Chevron />
                    </div>
                  ) : f.kind === 'textarea' ? (
                    <textarea
                      id={id}
                      value={v}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      maxLength={600}
                      className={fieldClass + ' min-h-[90px] resize-y'}
                    />
                  ) : (
                    <input
                      id={id}
                      type={f.kind === 'url' ? 'url' : f.kind === 'tel' ? 'tel' : 'text'}
                      inputMode={f.kind === 'tel' ? 'tel' : undefined}
                      required={f.required}
                      value={v}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      maxLength={f.kind === 'url' ? 300 : 160}
                      className={fieldClass}
                    />
                  )}
                  {f.hint && <p className="mt-1 text-xs text-gray-500">{f.hint}</p>}
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}