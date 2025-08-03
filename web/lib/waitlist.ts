import { supabase } from './supabase'

export async function addEmailToWaitlist(email: string) {
  try {
    const { data, error } = await supabase
      .from('waitlist_entry')
      .insert([{ email: email }])

    if (error) {
      // Check if it's a duplicate key error
      if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
        // Swallow the error and return success for duplicate emails
        return { success: true, data: null }
      }
      console.error('Error adding email to waitlist:', error)
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to add email to waitlist:', error)
    return { success: false, error }
  }
} 