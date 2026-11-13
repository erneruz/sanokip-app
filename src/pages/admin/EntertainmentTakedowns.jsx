// src/pages/admin/EntertainmentTakedowns.jsx
// Requests from members (or from a parent for a child) to take a profile and videos down.
// The member's consents are withdrawn the moment they ask. When the team has removed what
// was public, "Mark as done" takes the card offline and withdraws the published clips.
import { useCallback, useEffect, useState } from 'react'
import { finishTakedown, listAdminTakedowns } from '../../services/entertainmentTalentAdminService'
import { IconCheck, IconClock } from '../../components/admin/EntAdminIcons'
import { Avatar } from '../../components/admin/entAdminUi'
import { ErrorBar, PageHeader, adminBtn, formatDate, formatDateTime } from '../../components/admin/talentAdminUi'

export default function EntertainmentTakedowns() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const [busyId, setBusyId] = useState('')
  const [showDone, setShowDone] = useState(false)

  const load = useCallback(async () => {
    try {
      setError('')
      setRows(await listAdminTakedowns())
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not load the requests.')
      setRows((old) => old ?? [])
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  async function done(id) {
    setBusyId(id)
    setError('')
    try {
      await finishTakedown(id)
      setConfirmId('')
      await load()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'That did not work. Please try again.')
    } finally {
      setBusyId('')
    }
  }

  const open = (rows ?? []).filter((r) => r.status === 'open')
  const finished = (rows ?? []).filter((r) => r.status === 'done')

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Take-downs"
        text="A member changed their mind. Their consents are already withdrawn. Remove what is public, then mark the request as done."
      />

      <ErrorBar>{error}</ErrorBar>

      {rows === null ? (
        <p className="mt-6 text-sm text-gray-500">Loading the requests…</p>
      ) : open.length === 0 ? (
        <p className="mt-6 flex items-center gap-2 rounded-2xl border border-dashed border-[#9FD8C9] bg-white p-6 text-sm text-gray-600">
          <IconCheck className="h-4 w-4 text-[#2F9678]" />
          No request is waiting. Everything has been handled.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {open.map((r) => {
            const forChild = !!r.child_id
            return (
              <li key={r.id} className="rounded-2xl border border-red-200 bg-white p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <Avatar name={forChild ? r.child_name : r.member_name} size="h-11 w-11" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">
                      {forChild ? `${r.child_name ?? 'Child'}${r.child_age != null ? ` (${r.child_age})` : ''}` : r.member_name || 'Member'}
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Open</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                      <IconClock className="h-3.5 w-3.5" /> Asked on {formatDateTime(r.created_at)}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{forChild ? 'Parent or guardian' : 'Member'}</dt>
                    <dd className="mt-0.5 text-sm text-gray-800">{r.member_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Phone</dt>
                    <dd className="mt-0.5 text-sm">
                      {r.member_phone ? <a href={`tel:${r.member_phone}`} className="text-[#1B5E4F] hover:underline">{r.member_phone}</a> : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Email</dt>
                    <dd className="mt-0.5 break-all text-sm">
                      {r.member_email ? <a href={`mailto:${r.member_email}`} className="text-[#1B5E4F] hover:underline">{r.member_email}</a> : '—'}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Reason: </span>
                  {r.reason || 'No reason given.'}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {confirmId === r.id ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      Have you removed the public profile, the reel and the YouTube documentary?
                      <button onClick={() => done(r.id)} disabled={busyId === r.id} className={adminBtn.primary + ' px-3! py-1.5!'}>
                        {busyId === r.id ? 'Please wait…' : 'Yes, mark as done'}
                      </button>
                      <button onClick={() => setConfirmId('')} className="cursor-pointer text-xs font-semibold underline">
                        Not yet
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(r.id)} className={adminBtn.primary}>
                      <IconCheck className="h-4 w-4" /> Mark as done
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Marking it as done also takes the member's card offline and withdraws the clips that were being prepared or public.
                  Videos on YouTube are not touched: remove them there yourself.
                </p>
              </li>
            )
          })}
        </ul>
      )}

      {/* finished ones */}
      {finished.length > 0 && (
        <section className="mt-8">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
          >
            {showDone ? 'Hide' : 'Show'} the {finished.length} handled {finished.length === 1 ? 'request' : 'requests'}
          </button>
          {showDone && (
            <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {finished.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <span className="font-medium text-gray-900">{r.child_id ? r.child_name ?? 'Child' : r.member_name || 'Member'}</span>
                  <span className="text-gray-500">asked {formatDate(r.created_at)}</span>
                  <span className="ml-auto rounded-full bg-[#E6F1EE] px-2.5 py-0.5 text-xs font-medium text-[#1B5E4F]">
                    Done {formatDate(r.handled_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}