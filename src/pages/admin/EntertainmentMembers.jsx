// src/pages/admin/EntertainmentMembers.jsx
// The people of Peak Star Entertainment (separate from the Engineering users).
// Tabs by kind of member, filter by status, approve / suspend / change kind / remove.
// Each staff member only receives the kinds they manage, the database makes sure of it.
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  listEntUsers,
  setEntUserStatus,
  setEntUserRole,
  removeEntUser,
  entRoleLabel,
} from '../../services/entertainmentUsersService'
import { ENT_ROLE_PLURAL, manageableEntRoles, canRemoveEntMembers } from '../../constants/entertainmentAdmin'
import { IconSearch, IconCheck, IconBan, IconTrash, IconClock } from '../../components/admin/EntAdminIcons'
import { Avatar, RolePill, StatusPill, formatDate } from '../../components/admin/entAdminUi'
import { describeDetails } from '../../constants/entRoleDetails'

const ROLE_INFO = {
  visitor: 'People who explore talents, news and videos.',
  talent: 'People who show their talent to scouts and partners.',
  guardian: 'Parents and guardians who follow a young talent.',
  scout: 'Scouts who spot and verify new talents. They need approval.',
  manager: 'Managers who represent talents. They need approval.',
  partner: 'Clubs, academies, labels, studios and brands. They need approval.',
}

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

function place(m) {
  return [m.country, m.province, m.district].filter(Boolean).join(' · ') || '—'
}

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-gray-800">{children || '—'}</dd>
    </div>
  )
}

export default function EntertainmentMembers() {
  const { staffRoles } = useAuth()
  const [params, setParams] = useSearchParams()
  const roleFilter = params.get('role') || ''
  const statusFilter = params.get('status') || ''

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // the member whose details are open
  const [confirm, setConfirm] = useState(null) // 'suspend' | 'remove' | null
  const [busy, setBusy] = useState(false)

  const roles = useMemo(() => manageableEntRoles(staffRoles), [staffRoles])
  const mayRemove = canRemoveEntMembers(staffRoles)

  const load = useCallback(async () => {
    try {
      setError('')
      setMembers(await listEntUsers())
    } catch (err) {
      setError(err.message || 'Could not load the members.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // close the details with the Escape key
  useEffect(() => {
    if (!selected) return
    const onKey = (e) => e.key === 'Escape' && closeDetails()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  function setFilter(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  function closeDetails() {
    setSelected(null)
    setConfirm(null)
  }

  // the list after the role tab, status chip and search box
  const q = search.trim().toLowerCase()
  const visible = members.filter((m) => {
    if (roleFilter && m.role !== roleFilter) return false
    if (statusFilter && m.status !== statusFilter) return false
    if (!q) return true
    return [m.full_name, m.email, m.phone, m.organization, m.country, m.province, m.district]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))
  })

  const inRole = (r) => members.filter((m) => !r || m.role === r)
  const statusCount = (s) => inRole(roleFilter).filter((m) => !s || m.status === s).length

  // run one action, then refresh the list and keep the details open with fresh data
  async function run(action, member) {
    setBusy(true)
    setError('')
    try {
      await action()
      const fresh = await listEntUsers()
      setMembers(fresh)
      setSelected(fresh.find((m) => m.user_id === member.user_id) ?? null)
      setConfirm(null)
    } catch (err) {
      setError(err.message || 'That did not work. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const approve = (m) => run(() => setEntUserStatus(m.user_id, 'active'), m)
  const suspend = (m) => run(() => setEntUserStatus(m.user_id, 'suspended'), m)
  const changeRole = (m, role) => run(() => setEntUserRole(m.user_id, role), m)
  const remove = async (m) => {
    setBusy(true)
    setError('')
    try {
      await removeEntUser(m.user_id)
      setMembers(await listEntUsers())
      closeDetails()
    } catch (err) {
      setError(err.message || 'Could not remove this member.')
    } finally {
      setBusy(false)
    }
  }

  const title = roleFilter ? ENT_ROLE_PLURAL[roleFilter] ?? entRoleLabel(roleFilter) : 'Members'

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="border-b border-gray-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#1B5E4F]">Peakstar Entertainment</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {roleFilter
            ? ROLE_INFO[roleFilter]
            : 'Everyone who joined Peak Star Entertainment. These accounts are separate from Peakstar Engineering users.'}
        </p>
      </div>

      {/* tabs: one per kind of member */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[{ value: '', label: 'All members' }, ...roles.map((r) => ({ value: r, label: ENT_ROLE_PLURAL[r] }))].map((t) => {
          const active = roleFilter === t.value
          return (
            <button
              key={t.value || 'all'}
              onClick={() => setFilter('role', t.value)}
              className={
                'cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition ' +
                (active
                  ? 'bg-[#1B5E4F] text-white shadow-sm'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-[#EAF5F1] hover:text-[#0F3D32]')
              }
            >
              {t.label}
              <span className={'ml-1.5 text-xs ' + (active ? 'text-white/70' : 'text-gray-400')}>{inRole(t.value).length}</span>
            </button>
          )
        })}
      </div>

      {/* status chips and search */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => {
            const active = statusFilter === s.value
            return (
              <button
                key={s.value || 'all'}
                onClick={() => setFilter('status', s.value)}
                className={
                  'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition ' +
                  (active ? 'bg-[#0F3D32] text-white' : 'bg-[#F1F6F4] text-[#154A3F] hover:bg-[#E6F1EE]')
                }
              >
                {s.label} <span className="opacity-60">{statusCount(s.value)}</span>
              </button>
            )
          })}
        </div>
        <label className="relative block w-full sm:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, country…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50"
          />
        </label>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading members…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            {members.length === 0 ? 'No members yet.' : 'No member matches these filters.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-[#F1F6F4] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr key={m.user_id} className="border-b border-gray-100 transition last:border-b-0 hover:bg-[#F8FBFA]">
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(m)} className="flex cursor-pointer items-center gap-3 text-left">
                        <Avatar name={m.full_name || m.email} />
                        <span className="min-w-0">
                          <span className="block max-w-[14rem] truncate font-medium text-gray-900">{m.full_name || '—'}</span>
                          <span className="block max-w-[14rem] truncate text-xs text-gray-400">{m.email}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3"><RolePill role={m.role} /></td>
                    <td className="px-4 py-3"><StatusPill status={m.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{place(m)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(m.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {m.status === 'pending' && (
                        <button
                          onClick={() => approve(m)}
                          disabled={busy}
                          className="mr-2 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#1B5E4F] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#154A3F] disabled:opacity-50"
                        >
                          <IconCheck className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => setSelected(m)}
                        className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B5E4F] ring-1 ring-[#9FD8C9] transition hover:bg-[#EAF5F1]"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* details of one member */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Member details">
          <button aria-label="Close" onClick={closeDetails} className="absolute inset-0 cursor-default bg-black/40" />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-b border-gray-200 bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] p-5 text-white">
              <Avatar name={selected.full_name || selected.email} size="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">{selected.full_name || 'No name'}</p>
                <p className="truncate text-sm text-white/70">{selected.email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <RolePill role={selected.role} />
                  <StatusPill status={selected.status} />
                </div>
              </div>
              <button onClick={closeDetails} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-5">
              <Detail label="Phone">
                {selected.phone && <a href={`tel:${selected.phone}`} className="text-[#1B5E4F] hover:underline">{selected.phone}</a>}
              </Detail>
              <Detail label="Email">
                <a href={`mailto:${selected.email}`} className="text-[#1B5E4F] hover:underline">{selected.email}</a>
              </Detail>
              <Detail label="Country">{selected.country}</Detail>
              <Detail label="Province / State">{selected.province}</Detail>
              <Detail label="District / City">{selected.district}</Detail>
              <Detail label="Organisation">{selected.organization}</Detail>
              <Detail label="Joined">{formatDate(selected.created_at)}</Detail>
            </dl>

            {/* what the person answered for their kind of member (talent category, scouting areas...) */}
            {describeDetails(selected.role, selected.details).length > 0 && (
              <div className="mx-5 mb-5 rounded-xl border border-[#CDEBE2] bg-[#F1F6F4]/70 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#154A3F]">
                  {entRoleLabel(selected.role)} information
                </p>
                <dl className="grid grid-cols-1 gap-3">
                  {describeDetails(selected.role, selected.details).map((row) => (
                    <Detail key={row.key} label={row.label}>
                      {row.link ? (
                        <a href={row.value} target="_blank" rel="noopener noreferrer" className="break-all text-[#1B5E4F] hover:underline">
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </Detail>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-auto space-y-4 border-t border-gray-200 p-5">
              {selected.status === 'pending' && (
                <p className="flex items-start gap-2 rounded-lg border border-dashed border-[#2F9678] bg-[#F1F6F4] px-3 py-2 text-xs text-[#154A3F]">
                  <IconClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This {entRoleLabel(selected.role).toLowerCase()} is waiting for approval. They cannot use their role until you approve.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {selected.status !== 'active' && (
                  <button
                    onClick={() => approve(selected)}
                    disabled={busy}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#1B5E4F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#154A3F] disabled:opacity-50"
                  >
                    <IconCheck className="h-4 w-4" />
                    {selected.status === 'suspended' ? 'Reactivate' : 'Approve'}
                  </button>
                )}
                {selected.status === 'active' && confirm !== 'suspend' && (
                  <button
                    onClick={() => setConfirm('suspend')}
                    disabled={busy}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#334155] ring-1 ring-gray-300 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    <IconBan className="h-4 w-4" /> Suspend
                  </button>
                )}
                {mayRemove && confirm !== 'remove' && (
                  <button
                    onClick={() => setConfirm('remove')}
                    disabled={busy}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <IconTrash className="h-4 w-4" /> Remove
                  </button>
                )}
              </div>

              {confirm && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  {confirm === 'suspend'
                    ? 'Suspend this member? They stay in the list but lose their access until you reactivate them.'
                    : 'Remove this member from Peak Star Entertainment? Their login stays, only the Entertainment membership is deleted.'}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => (confirm === 'suspend' ? suspend(selected) : remove(selected))}
                      disabled={busy}
                      className="cursor-pointer rounded-lg bg-[#0F3D32] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#154A3F] disabled:opacity-50"
                    >
                      {busy ? 'Please wait…' : confirm === 'suspend' ? 'Yes, suspend' : 'Yes, remove'}
                    </button>
                    <button
                      onClick={() => setConfirm(null)}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-300 transition hover:bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {roles.length > 1 && (
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Change kind of member</span>
                  <select
                    value={selected.role}
                    disabled={busy}
                    onChange={(e) => changeRole(selected, e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2F9678] focus:ring-2 focus:ring-[#9FD8C9]/50"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {entRoleLabel(r)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}