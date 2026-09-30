// src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react'
import { getAllUsers, setUserRole } from '../../services/usersService'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

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

  async function handleToggleRole(u) {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    const verb = newRole === 'admin' ? 'Grant admin access to' : 'Remove admin access from'
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

  return (
    <main className="px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">Manage who has admin access.</p>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : (
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="py-3">{`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—'}</td>
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
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleRole(u)}
                      disabled={updatingId === u.id || u.id === currentUser.id}
                      className="cursor-pointer text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}