"use server"

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("Skipping Welcome Email: RESEND_API_KEY not found in environment variables.");
        return;
    }

    try {
        await resend.emails.send({
            from: 'Soul Home <hello@soulhomelove.com>',
            to: email,
            subject: 'Welcome to Soul Home ✨',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #6d28d9;">Welcome, ${name}!</h1>
                    <p style="font-size: 16px; line-height: 1.6;">We're so happy to have you join our community at Soul Home. Your journey to inner peace and resource discovery begins now.</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="font-size: 18px; margin-top: 0;">What's Next?</h2>
                        <ul style="padding-left: 20px;">
                            <li style="margin-bottom: 10px;">Explore the <strong>Resource Library</strong> for meditations and guides.</li>
                            <li style="margin-bottom: 10px;">Visit your <strong>Dashboard</strong> to see your downloads.</li>
                            <li style="margin-bottom: 10px;">Connect with our community.</li>
                        </ul>
                    </div>
                    <a href="https://soulhomelove.com/dashboard/resources" style="display: inline-block; background: #6d28d9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Browse Resources</a>
                    <p style="margin-top: 40px; font-size: 14px; color: #666;">If you have any questions, just reply to this email!</p>
                </div>
            `
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}

export async function sendCancellationEmail(email: string, name: string, periodEnd: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("Skipping Cancellation Email: RESEND_API_KEY not found.");
        return;
    }

    try {
        await resend.emails.send({
            from: 'Soul Home <hello@soulhomelove.com>',
            to: email,
            subject: 'Subscription Cancellation Confirmed',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #4b5563;">Subscription Cancelled</h1>
                    <p style="font-size: 16px; line-height: 1.6;">Hello ${name},</p>
                    <p style="font-size: 16px; line-height: 1.6;">This email confirms that your subscription to Soul Home has been cancelled as requested.</p>
                    <p style="font-size: 16px; font-weight: bold; color: #ef4444;">You will retain full access to all resources until ${periodEnd}.</p>
                    <p style="font-size: 16px; line-height: 1.6;">After this date, no further charges will be made. If you ever want to rejoin us, we'll be here with open arms!</p>
                    <a href="https://soulhomelove.com/dashboard/settings" style="display: inline-block; border: 1px solid #6d28d9; color: #6d28d9; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">View My Settings</a>
                </div>
            `
        });
        console.log(`Cancellation email sent to ${email}`);
    } catch (error) {
        console.error("Error sending cancellation email:", error);
    }
}

export async function sendContactEmail(name: string, email: string, subject: string, message: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("Skipping Contact Email: RESEND_API_KEY not found.");
        return;
    }

    try {
        await resend.emails.send({
            from: 'Soul Home Contact <hello@soulhomelove.com>',
            to: ['soulhome.krisha@gmail.com', 'kondaneyash@gmail.com'], // Admin emails
            replyTo: email,
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #6d28d9;">New Message from Soul Home</h1>
                    <p style="font-size: 16px;"><strong>Name:</strong> ${name}</p>
                    <p style="font-size: 16px;"><strong>Email:</strong> ${email}</p>
                    <p style="font-size: 16px;"><strong>Subject:</strong> ${subject}</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap;">
                        ${message}
                    </div>
                    <p style="font-size: 14px; color: #666;">You can reply directly to this email to respond to ${name}.</p>
                </div>
            `
        });
        console.log(`Contact form email sent from ${email}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error sending contact email:", error);
        return { success: false, error: error.message };
    }
}

const DAILY_LIMIT = 100;

export async function sendBulkEmail(formData: FormData) {
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const target = formData.get("target") as string;

  if (!subject || !message) {
    return { error: "Subject and message are required." };
  }

  const { createClient: createServerClient } = await import("@/lib/server");
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabase = await createServerClient();

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: "Unauthorized" };

  // Create admin client for fetching all users
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check Daily Limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: logs } = await supabaseAdmin
    .from("email_logs")
    .select("recipient_count")
    .gte("sent_at", today.toISOString());
    
  const emailsSentToday = logs?.reduce((sum, log) => sum + log.recipient_count, 0) || 0;

  // Fetch recipients based on target
  let emails = new Set<string>();

  if (["all_registered", "active", "expired", "free", "everyone"].includes(target)) {
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, email");
    const { data: subscriptions } = await supabaseAdmin.from("subscriptions").select("user_id, status");

    const subsByUser = new Map();
    subscriptions?.forEach(sub => subsByUser.set(sub.user_id, sub.status));

    profiles?.forEach(p => {
      const status = subsByUser.get(p.id);
      if (target === "all_registered" || target === "everyone") {
        if (p.email) emails.add(p.email);
      } else if (target === "active" && status === "active") {
        if (p.email) emails.add(p.email);
      } else if (target === "expired" && status && status !== "active") {
        if (p.email) emails.add(p.email);
      } else if (target === "free" && !status) {
        if (p.email) emails.add(p.email);
      }
    });
  }

  if (["waitlist_all", "waitlist_yes", "waitlist_no", "everyone"].includes(target)) {
    let query = supabaseAdmin.from("waitlist").select("email");
    if (target === "waitlist_yes") query = query.eq("wants_reminder", true);
    if (target === "waitlist_no") query = query.eq("wants_reminder", false);

    const { data: waitlist } = await query;
    waitlist?.forEach(w => {
      if (w.email) emails.add(w.email);
    });
  }

  const recipientEmails = Array.from(emails);

  if (recipientEmails.length === 0) {
    return { error: "No recipients found for the selected target." };
  }

  if (emailsSentToday + recipientEmails.length > DAILY_LIMIT) {
    return { error: `Sending to ${recipientEmails.length} recipients would exceed your daily limit of ${DAILY_LIMIT}. You have already sent ${emailsSentToday} today.` };
  }

  // Branded HTML Template Wrapper
  const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6d28d9; margin-bottom: 5px;">Soul Home</h1>
              <p style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Community Update</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #eaeaea;">
              ${message}
          </div>
          <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #999;">
              <p>You are receiving this email because you are a part of the Soul Home community.</p>
          </div>
      </div>
  `;

  try {
    const { error: sendError } = await resend.emails.send({
      from: "Soul Home <hello@soulhomelove.com>",
      to: "hello@soulhomelove.com", 
      bcc: recipientEmails,
      subject: subject,
      html: htmlContent,
    });

    if (sendError) {
      console.error("Resend API error:", sendError);
      return { error: "Failed to send emails via Resend. " + sendError.message };
    }

    // Log the sent emails
    await supabaseAdmin.from("email_logs").insert({
      subject,
      recipient_count: recipientEmails.length,
    });

    return { success: true, count: recipientEmails.length };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

