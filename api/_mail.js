// api/_mail.js
import fetch from "node-fetch";

const GRAPH = "https://graph.microsoft.com/v1.0";

export async function sendMail({ token, fromUpn, to, subject, html, bcc = [] }) {
  if (!Array.isArray(to)) to = [to].filter(Boolean);
  if (!Array.isArray(bcc)) bcc = [bcc].filter(Boolean);
  if (!to.length) throw new Error("sendMail: 'to' is required");

  const body = {
    message: {
      subject: subject || "HESAA Request Received",
      body: { contentType: "HTML", content: html || "<p>Thank you—your request was received.</p>" },
      toRecipients: to.map(x => ({ emailAddress: { address: x } })),
    },
    saveToSentItems: false
  };

  if (bcc.length) {
    body.message.bccRecipients = bcc.map(x => ({ emailAddress: { address: x } }));
  }

  // Send from the shared mailbox
  const url = `${GRAPH}/users/${encodeURIComponent(fromUpn)}/sendMail`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Graph sendMail failed ${r.status}: ${text}`);
  }
}
