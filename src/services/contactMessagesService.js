// src/services/contactMessagesService.js
// Admin side of the "Write to us" form: read, update, delete and reply.
import { supabase } from '../supabase'

// Fired after any change to messages, so the sidebar red count can refresh at once.
export const MESSAGES_CHANGED_EVENT = 'contact-messages-changed'

export function notifyMessagesChanged() {
  try {
    window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT))
  } catch {
    /* ignore */
  }
}

export async function getContactMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*, contact_replies(*)')
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((m) => ({
    ...m,
    contact_replies: [...(m.contact_replies ?? [])].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    ),
  }))
}

// Counts per status, for the dashboard pie chart.
export async function getContactMessageCounts() {
  const { data, error } = await supabase.from('contact_messages').select('status')
  if (error) throw error

  const counts = { new: 0, read: 0, replied: 0, archived: 0, total: 0 }
  for (const row of data ?? []) {
    counts.total += 1
    if (row.status === 'new') counts.new += 1
    else if (row.status === 'read') counts.read += 1
    else if (row.status === 'replied') counts.replied += 1
    else if (row.status === 'archived') counts.archived += 1
  }
  return counts
}

// Number of messages nobody has opened yet (the red count).
export async function getUnreadMessageCount() {
  const { count, error } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')
  if (error) throw error
  return count ?? 0
}

export async function updateContactMessageStatus(id, status) {
  const patch = { status }
  if (status === 'read') patch.read_at = new Date().toISOString()

  const { error } = await supabase.from('contact_messages').update(patch).eq('id', id)
  if (error) throw error
  notifyMessagesChanged()
}

export async function deleteContactMessage(id) {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) throw error
  notifyMessagesChanged()
}

// Sends the email through the Edge Function and records the reply.
export async function sendContactReply({ messageId, subject, body }) {
  const { data, error } = await supabase.functions.invoke('send-contact-reply', {
    body: { messageId, subject, body },
  })

  if (error) {
    let message = error.message
    try {
      const detail = await error.context.json()
      if (detail?.error) message = detail.error
    } catch {
      /* keep the default message */
    }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)

  notifyMessagesChanged()
  return data
}