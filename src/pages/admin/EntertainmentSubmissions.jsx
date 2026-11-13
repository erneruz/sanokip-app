// src/pages/admin/EntertainmentSubmissions.jsx
// The review queue of Peak Star Entertainment: every clip sent by talents, parents and
// guardians. Tiles by stage, search, filters, and a side panel to review one clip.
// Only the scouting team opens this page (the database makes sure of it too).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TALENT_CATEGORIES, getTalentCategory } from '../../constants/talentCategories'
import { SUBMISSION_GROUPS, groupOfStatus, subjectLabel } from '../../constants/talentAdmin'
import { listAdminSubmissions } from '../../services/entertainmentTalentAdminService'
import { Avatar } from '../../components/admin/entAdminUi'
import {
  ConsentDots,
  ErrorBar,
  PageHeader,
  SearchBox,
  SubmissionPill,
  Tile,
  formatDate,
} from '../../components/admin/talentAdminUi'
import SubmissionReviewPanel from './SubmissionReviewPanel'

export default function EntertainmentSubmissions() {
  const [params, setParams] = useSearchParams()
  const group = params.get('group') || ''
  const openId = params.get('open') || ''

  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(params.get('q') || '')
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [oldestFirst, setOldestFirst] = useState(false)

  const load = useCallback(async () => {
    try {
      setError('')
      setRows(await listAdminSubmissions())
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not load the clips.')
      setRows((old) => old ?? [])
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  function setParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const list = rows ?? []
  const countGroup = (key) => list.filter((r) => groupOfStatus(r.status) === key).length

  const q = search.trim().toLowerCase()
  const visible = useMemo(() => {
    const out = list.filter((r) => {
      if (group && groupOfStatus(r.status) !== group) return false
      if (category && r.category !== category) return false
      if (subject && r.subject !== subject) return false
      if (!q) return true
      return [r.person_name, r.what_they_do, r.location, r.submitter_name, r.submitter_email, r.submitter_phone, r.person_full_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
    out.sort((a, b) => (oldestFirst ? 1 : -1) * (new Date(a.created_at) - new Date(b.created_at)))
    return out
  }, [list, group, category, subject, q, oldestFirst])

  const selected = list.find((r) => r.id === openId) ?? null

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Submissions"
        text="Every clip sent by talents, parents and guardians. Review it, ask questions, verify the talent and move it to the public profile."
      />

      {/* tiles: one for each stage */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {SUBMISSION_GROUPS.map((g) => (
          <Tile
            key={g.key}
            label={g.label}
            hint={g.hint}
            value={rows === null ? '–' : countGroup(g.key)}
            active={group === g.key}
            alert={g.key === 'new' && countGroup('new') > 0}
            onClick={() => setParam('group', group === g.key ? '' : g.key)}
          />
        ))}
      </div>

      {/* filters */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2F9678]"
          >
            <option value="">All categories</option>
            {TALENT_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2F9678]"
          >
            <option value="">Everyone</option>
            <option value="self">Talents</option>
            <option value="child">Children</option>
            <option value="adult">Another adult</option>
          </select>
          <button
            onClick={() => setOldestFirst((v) => !v)}
            className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-50"
          >
            {oldestFirst ? 'Oldest first' : 'Newest first'}
          </button>
          {(group || category || subject || search) && (
            <button
              onClick={() => {
                setParams({}, { replace: true })
                setCategory('')
                setSubject('')
                setSearch('')
              }}
              className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1B5E4F] hover:bg-[#EAF5F1]"
            >
              Clear filters
            </button>
          )}
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search name, place, email, phone…" />
      </div>

      <ErrorBar>{error}</ErrorBar>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {rows === null ? (
          <p className="p-6 text-sm text-gray-500">Loading the clips…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">{list.length === 0 ? 'No clip has been sent yet.' : 'No clip matches these filters.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-[#F1F6F4] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Talent</th>
                  <th className="px-4 py-3 font-medium">Sent by</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Consents</th>
                  <th className="px-4 py-3 font-medium">Sent</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const cat = getTalentCategory(r.category)
                  return (
                    <tr key={r.id} className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#F8FBFA]">
                      <td className="px-4 py-3">
                        <button onClick={() => setParam('open', r.id)} className="flex cursor-pointer items-center gap-3 text-left">
                          <Avatar name={r.person_name} />
                          <span className="min-w-0">
                            <span className="block max-w-[14rem] truncate font-medium text-gray-900">{r.person_name}</span>
                            <span className="block max-w-[14rem] truncate text-xs text-gray-400">
                              {[subjectLabel(r), cat?.label, r.what_they_do].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block max-w-[12rem] truncate text-gray-800">{r.submitter_name || '—'}</span>
                        <span className="block max-w-[12rem] truncate text-xs text-gray-400">{r.location || r.submitter_email}</span>
                      </td>
                      <td className="px-4 py-3"><SubmissionPill status={r.status} /></td>
                      <td className="px-4 py-3">{r.subject === 'adult' ? <span className="text-xs text-gray-400">—</span> : <ConsentDots consents={r.consents} />}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setParam('open', r.id)}
                          className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B5E4F] ring-1 ring-[#9FD8C9] transition hover:bg-[#EAF5F1]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <SubmissionReviewPanel key={selected.id} s={selected} onClose={() => setParam('open', '')} onChanged={load} />
      )}
    </main>
  )
}