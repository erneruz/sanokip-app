// src/components/admin/entAdminUi.jsx
// Small shared pieces for the Entertainment admin pages: status pill, role pill,
// avatar circle and a date helper.
import { ROLE_ICONS } from './EntAdminIcons'
import { entRoleLabel } from '../../services/entertainmentUsersService'

const STATUS_STYLES = {
  active: 'bg-[#E6F1EE] text-[#1B5E4F]',
  pending: 'border border-dashed border-[#2F9678] bg-white text-[#154A3F]',
  suspended: 'bg-gray-100 text-gray-500',
  published: 'bg-[#E6F1EE] text-[#1B5E4F]',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-gray-100 text-gray-500',
}

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export function RolePill({ role }) {
  const Icon = ROLE_ICONS[role]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F6F4] px-2 py-0.5 text-xs font-medium text-[#0F3D32]">
      {Icon && <Icon className="h-3 w-3 text-[#2F9678]" />}
      {entRoleLabel(role)}
    </span>
  )
}

export function Avatar({ name, size = 'h-9 w-9' }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0F3D32] to-[#2F9678] text-sm font-semibold text-white`}>
      {(name?.trim()?.[0] ?? '?').toUpperCase()}
    </span>
  )
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}