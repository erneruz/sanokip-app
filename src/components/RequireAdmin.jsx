// src/components/RequireAdmin.jsx
// Keeps people out of admin pages they have no right to.
//
//   <RequireAdmin>                              Engineering admin or Super Admin (as before)
//   <RequireAdmin access="entertainmentUsers">  Entertainment user managers
//   <RequireAdmin access="entertainmentContent">Entertainment content team
//   <RequireAdmin access="staff">               Super Admin only
//   <RequireAdmin access="any">                 any staff member
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAdmin({ children, access = 'engineering' }) {
  const { user, can, isStaff, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/admin/login" replace />

  const allowed = access === 'any' ? isStaff : !!can[access]
  if (!allowed) return <Navigate to="/" replace />

  return children
}