// src/services/contactService.js
// IMPORTANT: use the same supabase import line that is at the top of your
// postsService.js (if that file says '../supabase', keep this as it is).
import { supabase } from '../supabase'

/**
 * Saves a message sent from the public "Write to us" form.
 * Throws an error when it could not be saved.
 */
export async function createContactMessage({ fullName, email, phoneDialCode, phone, message }) {
  const cleanPhone = (phone ?? '').trim()

  const { error } = await supabase.from('contact_messages').insert({
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone_dial_code: cleanPhone ? phoneDialCode : null,
    phone: cleanPhone || null,
    message: message.trim(),
  })

  if (error) throw error
}