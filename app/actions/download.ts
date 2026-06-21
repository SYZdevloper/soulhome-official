"use server"

import { createClient } from "@/lib/server"
import { grantFolderAccess, getFileIdFromUrl } from "@/lib/google-drive"
import { revalidatePath } from "next/cache"
import { rateLimit } from "@/lib/rate-limit"

export async function downloadResource(resourceId: string, resourceUrl: string, resourceSlug: string) {
    const supabase = await createClient()

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Rate Limiting: 10 download attempts per 5 minutes per user
    const { success } = rateLimit(`download:${user.id}`, 10, 300000)
    if (!success) throw new Error("Too many download attempts. Please wait a few minutes.")

    // 2. Check Subscription
    let { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

    const { data: profile } = await supabase.from('profiles').select('email, is_admin').eq('id', user.id).single()

    if (!subscription && profile?.is_admin) {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        subscription = {
            status: 'active',
            downloads_used: 0,
            downloads_limit: 9999,
            current_period_start: startOfMonth.toISOString(),
            current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
        } as any
    }

    if (!subscription) throw new Error("No active subscription")

    // 3. Get Resource Details & File ID
    const { data: resource } = await supabase
        .from('resources')
        .select('type')
        .eq('id', resourceId)
        .single()
        
    const fileId = getFileIdFromUrl(resourceUrl)
    if (!fileId) throw new Error("Invalid resource URL configuration")

    if (!profile?.email) throw new Error("User email not found")

    // 4. Check for Existing Download Record THIS billing cycle
    let existingDownload = null
    if (subscription?.current_period_start) {
        const { data } = await supabase
            .from('downloads')
            .select('*')
            .eq('user_id', user.id)
            .eq('resource_id', resourceId)
            .eq('billing_period_start', subscription.current_period_start)
            .single()
        existingDownload = data
    }

    // 4.5. If NEW DOWNLOAD, Check Limit before granting access
    if (!existingDownload) {
        if ((subscription.downloads_used || 0) >= (subscription.downloads_limit || 3)) {
            throw new Error("Download limit reached for this month.")
        }
    }

    // 5. Grant/Restore Google Drive Access (Idempotent)
    // For PDFs, we proxy the file securely via our API so the user DOES NOT need direct Drive access.
    // We only grant Drive access for Audio/Video which stream directly from Drive.
    let permissionId = existingDownload?.drive_permission_id || null
    
    if (resource?.type !== 'pdf') {
        try {
            permissionId = await grantFolderAccess(profile.email, fileId)
        } catch (err: any) {
            console.error("Drive Grant Error:", err)
            const errorMessage = err?.message || err?.error_description || "Unknown Drive API Error"
            throw new Error(`Google Drive Error: ${errorMessage}`)
        }
    }

    // 6. If ALREADY DOWNLOADED, we are done (Access restored, no quota used)
    if (existingDownload) {
        // Optional: Update the permission ID in case it changed
        if (permissionId && permissionId !== existingDownload.drive_permission_id) {
            await supabase.from('downloads').update({ drive_permission_id: permissionId }).eq('id', existingDownload.id)
        }
        return { success: true, url: resourceUrl, message: "Access Restored" }
    }

    // 8. Record New Download (Trigger will increment usage)
    const { error } = await supabase.from('downloads').insert({
        user_id: user.id,
        resource_id: resourceId,
        billing_period_start: subscription.current_period_start,
        billing_period_end: subscription.current_period_end,
        drive_file_id: fileId,
        drive_permission_id: permissionId
    })

    if (error) {
        console.error("Database Insert Error:", error)
        throw new Error("Failed to record download.")
    }

    revalidatePath(`/dashboard/resources/${resourceSlug}`)
    revalidatePath('/dashboard')
    return { success: true, url: resourceUrl }
}
