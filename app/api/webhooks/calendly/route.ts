import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role key since we need to bypass RLS and create users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Very basic validation - checking if it's an invitee.created event
        if (body.event === 'invitee.created') {
            const invitee = body.payload;
            const email = invitee.email?.toLowerCase();
            const name = invitee.name;
            const eventTypeUrl = invitee.event?.split('/events/')[0] || invitee.event; // The Calendly Event Type URL/URI
            
            // In Calendly payload, the event URI or tracking might be in different fields
            // For this implementation, we will assume we match by calendly_url in our DB
            // Alternatively, admin can set the calendly_url to exactly match the Calendly event link
            
            console.log(`[Calendly Webhook] Processing purchase for ${email}`);

            if (!email) {
                return NextResponse.json({ error: 'Missing email' }, { status: 400 });
            }

            // 1. Find the resource that matches this Calendly link
            const { data: resources, error: resourceError } = await supabase
                .from('resources')
                .select('id, title, calendly_url, file_url')
                .not('calendly_url', 'is', null);

            if (resourceError || !resources || resources.length === 0) {
                console.error("No resources found with calendly_url mappings");
                return NextResponse.json({ error: 'No mapped resources' }, { status: 400 });
            }

            const matchedResource = resources.find(r => {
                 const dbUrl = r.calendly_url?.toLowerCase().replace(/\/$/, '') || '';
                 const payloadString = JSON.stringify(body).toLowerCase();
                 return dbUrl.length > 5 && payloadString.includes(dbUrl);
            });

            if (!matchedResource) {
                 console.error("Could not match the incoming Calendly event to any resource. Make sure the calendly_url is set correctly in the database.");
                 return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
            }

            const resourceId = matchedResource.id;

            // 2. Check if user exists in our DB, if not, create them
            let userId;
            const { data: existingProfiles, error: profileErr } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email);
                
            if (existingProfiles && existingProfiles.length > 0) {
                userId = existingProfiles[0].id;
                console.log(`User already exists: ${userId}`);
            } else {
                console.log(`User does not exist, creating new account for ${email}...`);
                const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
                    email: email,
                    email_confirm: true,
                    user_metadata: { full_name: name }
                });

                if (authErr) {
                    console.error("Failed to create user:", authErr);
                    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
                }
                
                userId = authData.user.id;
                console.log(`Created new user: ${userId}`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // 3. Grant Access in Purchases Table
            const { error: purchaseError } = await supabase
                .from('purchases')
                .upsert({
                    user_id: userId,
                    resource_id: resourceId,
                    calendly_event_uri: invitee.uri || null,
                }, { onConflict: 'id' });

            if (purchaseError) {
                console.error("Failed to grant access:", purchaseError);
                return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 });
            }
            
            console.log(`Access granted to ${email} for resource ${resourceId} in database.`);

            // 4. Grant Access in Google Drive
            try {
                if (matchedResource.file_url) {
                    const { grantFolderAccess, getFileIdFromUrl } = await import('@/lib/google-drive');
                    const fileId = getFileIdFromUrl(matchedResource.file_url);
                    if (fileId) {
                        await grantFolderAccess(email, fileId);
                        console.log(`Granted Google Drive access to ${email} for file ${fileId}`);
                    } else {
                        console.error(`Could not extract Google Drive file ID from URL: ${matchedResource.file_url}`);
                    }
                }
            } catch (driveErr) {
                console.error("Failed to grant Google Drive access:", driveErr);
                // We don't fail the webhook if Google Drive fails, as DB access is granted.
            }

            // 5. Send Welcome / Magic Link Email
            // Note: We're sending a generic login link. Alternatively, we could generate a magic link using Supabase admin
            const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
                type: 'magiclink',
                email: email,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/resources`,
                }
            });

            const magicLink = linkData?.properties?.action_link || `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;

            try {
                await resend.emails.send({
                    from: 'Soulhome <noreply@soulhomelove.com>',
                    to: email,
                    subject: `Your Purchase Confirmation: ${matchedResource.title}`,
                    html: `
                        <h1>Thank you for your purchase!</h1>
                        <p>Hi ${name || ''},</p>
                        <p>You have successfully purchased access to <strong>${matchedResource.title}</strong>.</p>
                        <p style="padding: 12px; background-color: #f3f4f6; border-radius: 6px; border-left: 4px solid #3b82f6;">
                          <strong>Important:</strong> Your access is permanently tied to this email address (<strong>${email}</strong>). If you are currently logged into our website with a different email, you will need to log out and sign in with this one to access your resource.
                        </p>
                        <p>Click the link below to automatically log into the correct account and access your resource:</p>
                        <br/>
                        <a href="${magicLink}" style="display:inline-block;padding:12px 24px;background-color:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Access Your Resource</a>
                        <br/><br/>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${magicLink}</p>
                        <br/>
                        <p>Enjoy!</p>
                    `
                });
                console.log("Email sent successfully");
            } catch (emailErr) {
                console.error("Failed to send email:", emailErr);
                // We don't fail the webhook if email fails, access is already granted.
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("Webhook Error:", err.message);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
