// src/services/subscribersService.js
import { supabase } from '../supabase'

// Fired after the list changes, so the sidebar red count can refresh at once.
export const SUBSCRIBERS_CHANGED_EVENT = 'subscribers-changed'

function notifySubscribersChanged() {
  try {
    window.dispatchEvent(new Event(SUBSCRIBERS_CHANGED_EVENT))
  } catch {
    /* ignore */
  }
}

// ── Public ─────────────────────────────────────────────────────────────────

// Returns 'subscribed', 'resubscribed' or 'already'. Throws 'invalid_email' for a bad address.
export async function subscribeToUpdates(email) {
  const { data, error } = await supabase.rpc('subscribe_to_updates', { p_email: email })
  if (error) throw error
  return data
}

// true when the link was valid
export async function unsubscribeByToken(token) {
  const { data, error } = await supabase.rpc('unsubscribe_by_token', { p_token: token })
  if (error) throw error
  return data === true
}

// ── Admin ──────────────────────────────────────────────────────────────────

export async function getSubscribers() {
  const { data, error } = await supabase
    .from('subscribers')
    .select('id, email, status, subscribed_at, unsubscribed_at, last_emailed_at, seen_at')
    .order('subscribed_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ← added: numbers for the dashboard pie chart
export async function getSubscriberCounts() {
  const { data, error } = await supabase.from('subscribers').select('status')
  if (error) throw error

  const counts = { active: 0, unsubscribed: 0, total: 0 }
  ;(data ?? []).forEach((row) => {
    counts.total += 1
    if (row.status === 'active') counts.active += 1
    else if (row.status === 'unsubscribed') counts.unsubscribed += 1
  })
  return counts
}

// The red count = active subscribers an admin has not seen yet
export async function getNewSubscriberCount() {
  const { count, error } = await supabase
    .from('subscribers')
    .select('id', { count: 'exact', head: true })
    .is('seen_at', null)
    .eq('status', 'active')
  if (error) throw error
  return count ?? 0
}

// Called when the admin opens the Subscribers page
export async function markSubscribersSeen() {
  const { error } = await supabase
    .from('subscribers')
    .update({ seen_at: new Date().toISOString() })
    .is('seen_at', null)
  if (error) throw error
  notifySubscribersChanged()
}

export async function deleteSubscriber(id) {
  const { error } = await supabase.from('subscribers').delete().eq('id', id)
  if (error) throw error
  notifySubscribersChanged()
}

export async function getBroadcasts(limit = 5) {
  const { data, error } = await supabase
    .from('subscriber_broadcasts')
    .select('id, subject, mode, recipient_count, sent_count, failed_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

// mode: 'one' (with subscriberId) or 'all'
export async function sendSubscriberEmail({ mode, subscriberId, subject, body }) {
  const { data, error } = await supabase.functions.invoke('send-subscriber-email', {
    body: {
      mode,
      subscriber_id: subscriberId,
      subject,
      body,
      site_url: window.location.origin, // used for the unsubscribe link in the email
    },
  })

  if (error) {
    let message = error.message
    try {
      const details = await error.context?.json?.()
      if (details?.error) message = details.error
    } catch {
      /* keep the generic message */
    }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}