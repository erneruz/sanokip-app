// src/pages/admin/EntertainmentConsents.jsx
// The register of consents: who agreed to what, when, and in which wording. Read only on
// purpose: a consent can only be given or withdrawn by the member (or the parent), never
// by the team. The list can be downloaded as a CSV file for the records.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CONSENT_KINDS } from '../../constants/talentJourney'
import { listAdminConsents } from '../../services/entertainmentTalentAdminService'
import {
  ErrorBar,
  PageHeader,
  SearchBox,
  Tile,
  adminBtn,
  downloadCsv,
  formatDate,
} from '../../components/admin/talentAdminUi'

const STATES = [
  { key: '', label: 'All consents' },
  { key: 'active', label: 'Active' },
  { key: 'withdrawn', label: 'Withdrawn' },
]

const kindTitle = (kind) => CONSENT_KINDS.find((k) => k.kind === kind)?.title ?? kind

export default function EntertainmentConsents() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [state, setState] = useState('')
  const [kind, setKind] = useState('')
  const [who, setWho] = useState('') // '' | 'children' | 'adults'
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    try {
      setError('')
      setRows(await listAdminConsents())
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not load the consents.')
      setRows((old) => old ?? [])
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  const list = rows ?? []
  const counts = {
    '': list.length,
    active: list.filter((c) => !c.withdrawn_at).length,
    withdrawn: list.filter((c) => c.withdrawn_at).length,
  }

  const q = search.trim().toLowerCase()
  const visible = useMemo(
    () =>
      list.filter((c) => {
        if (state === 'active' && c.withdrawn_at) return false
        if (state === 'withdrawn' && !c.withdrawn_at) return false
        if (kind && c.kind !== kind) return false
        if (who === 'children' && !c.child_id) return false
        if (who === 'adults' && c.child_id) return false
        if (!q) return true
        return [c.member_name, c.member_email, c.child_name, c.given_by].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      }),
    [list, state, kind, who, q],
  )

  function exportCsv() {
    downloadCsv(
      `peakstar-consents-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Person', 'Type', 'Given by', 'Email', 'Consent', 'Given on', 'Withdrawn on', 'Wording version'],
      visible.map((c) => [
        c.child_id ? `${c.child_name ?? 'Child'}${c.child_age != null ? ` (${c.child_age})` : ''}` : c.member_name,
        c.child_id ? 'Child' : 'Adult',
        c.given_by || c.member_name,
        c.member_email,
        kindTitle(c.kind),
        c.given_at ? new Date(c.given_at).toISOString() : '',
        c.withdrawn_at ? new Date(c.withdrawn_at).toISOString() : '',
        c.wording_version,
      ]),
    )
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Consents register"
        text="Who agreed to what, and when. Only the member, or the parent for a child, can give or withdraw a consent. The team can read this list but not change it."
      >
        <button onClick={exportCsv} disabled={visible.length === 0} className={adminBtn.soft}>
          Download as CSV
        </button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {STATES.map((s) => (
          <Tile key={s.key || 'all'} label={s.label} value={rows === null ? '–' : counts[s.key]} active={state === s.key} onClick={() => setState(s.key)} />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2F9678]">
            <option value="">All kinds of consent</option>
            {CONSENT_KINDS.map((k) => (
              <option key={k.kind} value={k.kind}>
                {k.title}
              </option>
            ))}
          </select>
          <select value={who} onChange={(e) => setWho(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2F9678]">
            <option value="">Children and adults</option>
            <option value="children">Children only</option>
            <option value="adults">Adults only</option>
          </select>
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search name or email…" />
      </div>

      <ErrorBar>{error}</ErrorBar>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {rows === null ? (
          <p className="p-6 text-sm text-gray-500">Loading the consents…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">{list.length === 0 ? 'No consent has been given yet.' : 'No consent matches these filters.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-[#F1F6F4] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Person</th>
                  <th className="px-4 py-3 font-medium">Given by</th>
                  <th className="px-4 py-3 font-medium">Consent</th>
                  <th className="px-4 py-3 font-medium">Given on</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Wording</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-b-0 hover:bg-[#F8FBFA]">
                    <td className="px-4 py-3">
                      <span className="block font-medium text-gray-900">
                        {c.child_id ? `${c.child_name ?? 'Child'}${c.child_age != null ? ` (${c.child_age})` : ''}` : c.member_name || '—'}
                      </span>
                      <span className="text-xs text-gray-400">{c.child_id ? 'Child' : 'Adult'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block text-gray-800">{c.given_by || c.member_name || '—'}</span>
                      <span className="block max-w-[14rem] truncate text-xs text-gray-400">{c.member_email}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{kindTitle(c.kind)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.given_at)}</td>
                    <td className="px-4 py-3">
                      {c.withdrawn_at ? (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">Withdrawn {formatDate(c.withdrawn_at)}</span>
                      ) : (
                        <span className="rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-xs font-medium text-[#1B5E4F]">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.wording_version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}