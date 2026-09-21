// src/utils/commentTree.js
export function buildCommentTree(comments) {
  const byId = new Map()
  const roots = []

  comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }))

  comments.forEach((c) => {
    const node = byId.get(c.id)
    const parent = c.parent_id ? byId.get(c.parent_id) : null

    if (parent) {
      parent.replies.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}