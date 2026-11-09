// src/services/contactMessagesService.js
// Admin side of the "Write to us" form: read, update, delete and reply.
import { supabase } from '../supabase'

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

export async function updateContactMessageStatus(id, status) {
  const patch = { status }
  if (status === 'read') patch.read_at = new Date().toISOString()

  const { error } = await supabase.from('contact_messages').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteContactMessage(id) {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) throw error
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
  return data
}