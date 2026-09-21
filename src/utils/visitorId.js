export function getVisitorId() {
  const key = 'sanokip_visitor_id'
  let id = localStorage.getItem(key)

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }

  return id
}