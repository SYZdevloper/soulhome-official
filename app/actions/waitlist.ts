"use server"

import { createClient } from "@/lib/server"

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email") as string
  const wants_reminder = formData.get("wants_reminder") === "on"

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." }
  }

  const supabase = await createClient()

  // Insert into waitlist
  const { error } = await supabase
    .from("waitlist")
    .insert({
      email,
      wants_reminder,
    })

  if (error) {
    if (error.code === "23505") { // Unique violation
      return { error: "This email is already on the waitlist." }
    }
    console.error("Waitlist error:", error)
    return { error: "Something went wrong. Please try again later." }
  }

  return { success: true }
}
