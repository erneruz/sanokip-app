// src/pages/admin/AdminUsers.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsers, setUserRole, deleteUserProfile } from '../../services/usersService'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRef = useRef(null)

  async function load() {
    setLoading(true)
    try {
      setUsers(await getAllUsers())
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleToggleRole(u) {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    const verb = newRole === 'admin' ? 'Grant admin access to' : 'Remove admin access from'
    setOpenMenuId(null)
    if (!window.confirm(`${verb} ${u.email}?`)) return

    setUpdatingId(u.id)
    try {
      await setUserRole(u.id, newRole)
      await load()
    } catch (err) {
      console.error('Failed to update role:', err)
      alert('Could not update role.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete(u) {
    setOpenMenuId(null)
    if (u.id === currentUser.id) return

    const confirmed = window.confirm(
      `Delete ${u.first_name ?? ''} ${u.last_name ?? ''} (${u.email})? This removes their profile, academic records, and certifications. This cannot be undone.`
    )
    if (!confirmed) return

    setUpdatingId(u.id)
    try {
      await deleteUserProfile(u.id)
      await load()
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Could not delete this user.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">Manage who has admin access.</p>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : (
        <div className="mt-8 overflow-visible rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const displayName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—'
                const isSelf = u.id === currentUser.id
                const isBusy = updatingId === u.id

                return (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                              {displayName?.[0]?.toUpperCase() ?? '?'}
                            </span>
                          )}
                        </span>
                        {displayName}
                      </div>
                    </td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3">
                      <span
                        className={
                          u.role === 'admin'
                            ? 'rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white'
                            : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="relative py-3 text-right">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                        disabled={isBusy}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isBusy ? <SpinnerIcon /> : <DotsIcon />}
                      </button>

                      {openMenuId === u.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl bg-white py-1.5 text-left shadow-lg ring-1 ring-black/5"
                        >
                          <Link
                            to={`/admin/users/${u.id}`}
                            onClick={() => setOpenMenuId(null)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <IconEye />
                            View Profile
                          </Link>

                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isSelf}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <IconShield />
                            {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </button>

                          <div className="my-1 border-t border-gray-100" />

                          <button
                            onClick={() => handleDelete(u)}
                            disabled={isSelf}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <IconTrash />
                            Delete User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}
function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin text-gray-400">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}
function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
      <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />
    </svg>
  )
}
function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}