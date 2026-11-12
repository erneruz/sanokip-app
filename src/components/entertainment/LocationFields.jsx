// src/components/entertainment/LocationFields.jsx
// Country -> Province -> District.
// For Rwanda the provinces and districts come from a list.
// For other countries the person types the province / state and the district / city.
import { COUNTRIES } from '../../constants/countries'
import { RWANDA_LOCATIONS, RWANDA_PROVINCES } from '../../constants/rwandaLocations'

const fieldClass =
  'w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-3.5 pr-9 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400'

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}

// a dropdown with our own small arrow (the browser one looks different everywhere)
function SelectBox({ children }) {
  return (
    <div className="relative">
      {children}
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
    </div>
  )
}

// value = { country, province, district }, onChange gets the new whole object
export default function LocationFields({ value, onChange, idPrefix = 'loc', required = true }) {
  const { country = 'Rwanda', province = '', district = '' } = value
  const isRwanda = country === 'Rwanda'
  const districts = isRwanda ? (RWANDA_LOCATIONS[province] ?? []) : []

  const set = (patch) => onChange({ country, province, district, ...patch })

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <Label htmlFor={`${idPrefix}-country`}>Country</Label>
        <SelectBox>
          <select
            id={`${idPrefix}-country`}
            required={required}
            value={country}
            onChange={(e) => set({ country: e.target.value, province: '', district: '' })}
            className={fieldClass}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </SelectBox>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-province`}>
          {isRwanda ? 'Province' : 'Province / State / Region'}
        </Label>
        {isRwanda ? (
          <SelectBox>
            <select
              id={`${idPrefix}-province`}
              required={required}
              value={province}
              onChange={(e) => set({ province: e.target.value, district: '' })}
              className={fieldClass}
            >
              <option value="">Choose province</option>
              {RWANDA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </SelectBox>
        ) : (
          <input
            id={`${idPrefix}-province`}
            required={required}
            value={province}
            onChange={(e) => set({ province: e.target.value })}
            className={fieldClass}
          />
        )}
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-district`}>
          {isRwanda ? 'District' : 'District / City'}
        </Label>
        {isRwanda ? (
          <SelectBox>
            <select
              id={`${idPrefix}-district`}
              required={required}
              value={district}
              disabled={!province}
              onChange={(e) => set({ district: e.target.value })}
              className={fieldClass}
            >
              <option value="">{province ? 'Choose district' : 'Choose province first'}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </SelectBox>
        ) : (
          <input
            id={`${idPrefix}-district`}
            required={required}
            value={district}
            onChange={(e) => set({ district: e.target.value })}
            className={fieldClass}
          />
        )}
      </div>
    </div>
  )
}