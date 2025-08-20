// /api/email/index.js
// POST { to: "user@example.org", subject: "…", html: "<p>…</p>" }
// If no "to" is provided you can default to a helpdesk inbox.

export async function onRequest(req, ctx) {
  try {
    if (req.method !== "POST") return new Response(null, { status: 405 });

    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ ok:false, error:"to, subject, and html are required" }), { status: 400 });
    }

    const tenant       = process.env.SP_TENANT_ID;
    const clientId     = process.env.SP_CLIENT_ID;
    const clientSecret = process.env.SP_CLIENT_SECRET;
    const mailboxUpn   = process.env.MAILBOX_UPN; // e.g. helpdesk@contoso.org
    const mailboxId    = process.env.MAILBOX_ID;  // alternative to UPN

    // Token
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type":"application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials"
      })
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenJson.error_description || "Token error");
    const token = tokenJson.access_token;

    const senderSegment = mailboxId
      ? `users/${encodeURIComponent(mailboxId)}`
      : `users/${encodeURIComponent(mailboxUpn)}`;

    const res = await fetch(`https://graph.microsoft.com/v1.0/${senderSegment}/sendMail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "HTML", content: html },
          toRecipients: [{ emailAddress: { address: to } }]
        },
        saveToSentItems: false
      })
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ ok:false, error:t }), { status: res.status });
    }
    return new Response(JSON.stringify({ ok:true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status: 500 });
  }
}
