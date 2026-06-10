import { google } from 'googleapis';

// Initialize the Google Drive API client
const getDriveClient = () => {
    const clientEmail = process.env.GOOGLE_SERVICE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
        throw new Error("Missing Google Drive credentials. Please add GOOGLE_SERVICE_CLIENT_EMAIL and GOOGLE_SERVICE_PRIVATE_KEY to your Vercel Environment Variables.");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    return google.drive({ version: 'v3', auth });
};

// We lazy-load the drive client to avoid build-time errors if env vars are missing
// but we want runtime errors if they are missing during execution.


/**
 * Grants "Viewer" access to a specific folder for a user's email.
 */
export async function grantFolderAccess(userEmail: string, folderId: string) {
    try {
        console.log(`Granting access to folder ${folderId} for ${userEmail}...`);

        // Create the permission
        const drive = getDriveClient();
        const res = await drive.permissions.create({
            fileId: folderId,
            sendNotificationEmail: false,
            requestBody: {
                role: 'reader', // 'reader' = Viewer
                type: 'user',
                emailAddress: userEmail,
            },
            fields: 'id',
        });

        console.log(`Access granted! Permission ID: ${res.data.id}`);
        return res.data.id;
    } catch (error) {
        console.error('Error granting Drive access:', error);
        throw error;
    }
}

/**
 * Revokes access for a specific permission ID within a folder.
 * Note: We generally need the Permission ID to revoke access.
 * If we don't store it, we might need to search for it first.
 */
export async function revokeFolderAccess(permissionId: string, folderId: string) {
    try {
        console.log(`Revoking permission ${permissionId} on folder ${folderId}...`);

        const drive = getDriveClient();
        await drive.permissions.delete({
            fileId: folderId,
            permissionId: permissionId,
        });

        console.log('Access revoked successfully.');
    } catch (error) {
        console.error('Error revoking Drive access:', error);
        // Don't throw here, just log it. We don't want to break the webhook if this fails.
    }
}

/**
 * Helper to find a permission ID for a user email on a file/folder.
 * Use this if you didn't store the permission ID when creating it.
 */
export async function findPermissionId(userEmail: string, folderId: string): Promise<string | null> {
    try {
        const drive = getDriveClient();
        const res = await drive.permissions.list({
            fileId: folderId,
            fields: 'permissions(id, emailAddress)',
        });

        const permission = res.data.permissions?.find(
            (p) => p.emailAddress?.toLowerCase() === userEmail.toLowerCase()
        );

        return permission?.id || null;
    } catch (error) {
        console.error("Error finding permission ID:", error);
        return null;
    }
}

/**
 * Extracts the Google Drive File ID from a URL.
 * Supports various formats like:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 */
export function getFileIdFromUrl(url: string): string | null {
    const patterns = [
        /file\/d\/([a-zA-Z0-9_-]+)/,
        /open\?id=([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}
