// src/components/entertainment/SocialLinksFields.jsx
// One row per social media place: the icon, the name and a box to type the link.
// value = { instagram: '...', ... }, onChange gets the new whole object.
import { SOCIAL_PLATFORMS, toSocialUrl } from '../../constants/socialLinks'
import SocialIcon from './SocialIcon'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50'

export default function SocialLinksFields({ value = {}, onChange, idPrefix = 'soc' }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SOCIAL_PLATFORMS.map((p) => {
        const v = value[p.key] ?? ''
        const bad = v.trim() !== '' && toSocialUrl(p.key, v) === null
        return (
          <div key={p.key}>
            <label htmlFor={`${idPrefix}-${p.key}`} className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="flex size-6 items-center justify-center rounded-md bg-[#E6F1EE] text-[#1B5E4F]">
                <SocialIcon name={p.key} size={14} />
              </span>
              {p.label}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id={`${idPrefix}-${p.key}`}
              type={p.kind === 'phone' ? 'tel' : 'text'}
              inputMode={p.kind === 'phone' ? 'tel' : 'url'}
              value={v}
              onChange={(e) => onChange({ ...value, [p.key]: e.target.value })}
              placeholder={p.placeholder}
              maxLength={200}
              aria-invalid={bad}
              className={inputClass + (bad ? ' border-red-300 focus:border-red-400 focus:ring-red-100' : '')}
            />
            {bad && <p className="mt-1 text-xs text-red-600">This does not look right.</p>}
          </div>
        )
      })}
    </div>
  )
}