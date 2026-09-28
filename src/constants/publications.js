export const PUBLICATION_CATEGORIES = [
  {
    key: 'policy',
    label: 'Policy & Regulatory Frameworks',
    subtypes: ['Laws', 'Policies', 'Strategies', 'Regulations', 'Guidelines', 'Standards'],
  },
  {
    key: 'studies',
    label: 'Studies & Project Reports',
    subtypes: ['Studies', 'Assessments', 'Project reports', 'Evaluations', 'Case studies'],
  },
  {
    key: 'technical',
    label: 'Technical Report',
    subtypes: ['Technical analyses', 'Technical findings'],
  },
  {
    key: 'industry',
    label: 'Industry Insights',
    subtypes: [
      'Industry trends',
      'Technology outlooks',
      'Sector intelligence',
      'Emerging developments',
      'Strategic perspectives',
    ],
  },
  {
    key: 'knowledge',
    label: 'Knowledge & Advisory Papers',
    subtypes: ['Journal articles', 'Academic papers', 'Advisory papers'],
  },
]

export function getCategory(key) {
  return PUBLICATION_CATEGORIES.find((c) => c.key === key) || null
}

export const ACCEPTED_FILE_TYPES =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip,.json,.geojson,.kml,.kmz'

export function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fileBadgeClass(ext = '') {
  const e = ext.toLowerCase()
  if (e === 'pdf') return 'bg-red-100 text-red-700'
  if (['doc', 'docx'].includes(e)) return 'bg-blue-100 text-blue-700'
  if (['xls', 'xlsx', 'csv'].includes(e)) return 'bg-green-100 text-green-700'
  if (['ppt', 'pptx'].includes(e)) return 'bg-orange-100 text-orange-700'
  return 'bg-gray-100 text-gray-700'
}