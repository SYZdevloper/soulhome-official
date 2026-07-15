// Run this file using: node --env-file=.env.local setup-webhook.js
// (Requires Node.js 20+)
const PAT = process.env.CALENDLY_PAT;
const WEBHOOK_URL = process.env.CALENDLY_WEBHOOK_URL;

async function setup() {
  if (!PAT || PAT.includes('YOUR_PERSONAL_ACCESS_TOKEN')) {
    console.error("❌ Missing or invalid CALENDLY_PAT in .env.local");
    return;
  }
  if (!WEBHOOK_URL || WEBHOOK_URL.includes('YOUR_NGROK_URL')) {
    console.error("❌ Missing or invalid CALENDLY_WEBHOOK_URL in .env.local");
    return;
  }
  console.log("Fetching your Calendly details...");
  const meRes = await fetch("https://api.calendly.com/users/me", {
    headers: { Authorization: `Bearer ${PAT}` }
  });
  const meData = await meRes.json();
  const orgUri = meData.resource.current_organization;

  console.log("Creating webhook...");
  const hookRes = await fetch("https://api.calendly.com/webhook_subscriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PAT}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: WEBHOOK_URL,
      events: ["invitee.created"],
      organization: orgUri,
      scope: "organization"
    })
  });

  const hookData = await hookRes.json();
  if (hookRes.ok) {
    console.log("✅ Webhook created successfully!");
  } else {
    console.error("❌ Failed to create webhook:", hookData);
  }
}

setup();
