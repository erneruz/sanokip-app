// src/components/RequireAdmin.jsx
// Keeps people out of admin pages they have no right to.
//
//   <RequireAdmin>                               Engineering admin or Super Admin (as before)
//   <RequireAdmin access="entertainment">        any Entertainment staff member
//   <RequireAdmin access="entertainmentUsers">   Entertainment user managers
//   <RequireAdmin access="entertainmentContent"> Entertainment content team
//   <RequireAdmin access="staff">                Super Admin only
//   <RequireAdmin access="any">                  any staff member
//
// A staff member who opens a page that is not theirs is sent to the part of the
// admin area that is theirs, never to a blank page.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAdmin({ children, access = 'engineering' }) {
  const { user, can, isStaff, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/admin/login" replace />

  const hasEntertainment = can.entertainmentUsers || can.entertainmentContent
  let allowed
  if (access === 'any') allowed = isStaff
  else if (access === 'entertainment') allowed = hasEntertainment
  else allowed = !!can[access]

  if (!allowed) {
    const home = can.engineering ? '/admin' : hasEntertainment ? '/admin/entertainment' : '/'
    return <Navigate to={home} replace />
  }

  return children
}