// src/utils/projectStatus.js

// Computes status purely from dates, so it's always accurate — never stale,
// even if a project hasn't been edited since its end date passed.
export function computeProjectStatus(startDate, endDate) {
  if (!startDate) return 'upcoming'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  if (start > today) return 'upcoming'
  if (end && end < today) return 'completed'
  return 'ongoing' // started, and either has no end date yet or hasn't ended
}