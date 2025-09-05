// api/requests/index.js

async function getToken() {
  const params = new URLSearchParams({
    client_id: process.env.SP_CLIENT_ID,
    client_secret: process.env.SP_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const r = await fetch(
    `https://login.microsoftonline.com/${process.env.SP_TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params }
  );
  if (!r.ok) throw new Error(`Token error ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function graph(token, url, init = {}) {
  const r = await fetch(`https://graph.microsoft.com/v1.0${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  if (!r.ok) throw new Error(`Graph ${url} → ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}

/* ---------- Ensure the "Email" column exists (once) ---------- */
async function ensureEmailColumn(token, siteId, listId, log = () => {}) {
  // Try to find an existing column named "Email"
  const cols = await graph(token, `/sites/${siteId}/lists/${listId}/columns?$select=id,name`);
  const exists = (cols.value || []).some(c => (c.name || '').toLowerCase() === 'email');
  if (exists) return;

  log('Creating Email column on the list...');
  // Create a plain text column named "Email"
  await graph(token, `/sites/${siteId}/lists/${listId}/columns`, {
    method: "POST",
    body: JSON.stringify({
      name: "Email",
      text: {},
      enforceUniqueValues: false,
      required: false,
      hidden: false
    })
  });
}

/* ---------------- Email sending (best-effort) ----------------- */
function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function sendMail({ token, fromUpn, to, subject, html, bcc = [] }) {
  const toArr = (Array.isArray(to) ? to : [to]).filter(Boolean);
  const bccArr = (Array.isArray(bcc) ? bcc : [bcc]).filter(Boolean);
  if (toArr.length === 0) throw new Error("sendMail: 'to' is required");

  const body = {
    message: {
      subject: subject || "HESAA Request Received",
      body: { contentType: "HTML", content: html || "<p>Thank you—your request was received.</p>" },
      toRecipients: toArr.map(address => ({ emailAddress: { address } }))
    },
    saveToSentItems: false
  };
  if (bccArr.length) {
    body.message.bccRecipients = bccArr.map(address => ({ emailAddress: { address } }));
  }

  await graph(token, `/users/${encodeURIComponent(fromUpn)}/sendMail`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

/* ------------------------- Handler ---------------------------- */
module.exports = async function (context, req) {
  try {
    const siteUrl  = process.env.SP_SITE_URL;                  // https://<tenant>.sharepoint.com/sites/HESAAWebRequestsPOC
    const listName = process.env.SP_LIST_NAME || "Web Requests";
    const host = new URL(siteUrl).host;                        // <tenant>.sharepoint.com
    const path = new URL(siteUrl).pathname;                    // /sites/HESAAWebRequestsPOC

    const token = await getToken();

    // Resolve site & list
    const site  = await graph(token, `/sites/${host}:${path}`);
    const siteId = site.id;

    const lists = await graph(token, `/sites/${siteId}/lists?$select=id,displayName`);
    const list  = lists.value.find(x => (x.displayName || "").toLowerCase() === listName.toLowerCase());
    if (!list) throw new Error(`List not found: ${listName}`);

    // Make sure the Email column exists
    await ensureEmailColumn(token, siteId, list.id, (m)=>context.log(m));

    const method = (req.method || "GET").toUpperCase();

    if (method === "GET") {
      const fields = "Id,Title,Email,RequestDescription,RequestType,Priority,RequestDate,RequestEndDate,Created,Modified";
      const items  = await graph(token, `/sites/${siteId}/lists/${list.id}/items?expand=fields(select=${fields})`);
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: { ok: true, count: items.value.length, items: items.value.map(i => i.fields) }
      };
      return;
    }

    if (method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const fields = {
        Title: b.Title || b.RequestTitle || "Untitled",
        Email: b.Email || b.RequesterEmail || b.RequestorEmail || "",
        RequestDescription: b.RequestDescription || "",
        RequestType: b.RequestType || "Inquiry",
        Priority: b.Priority || "Low",
        RequestDate: b.RequestDate || new Date().toISOString().slice(0,10),
        RequestEndDate: !!b.RequestEndDate
      };

      // Create the item
      const created = await graph(token, `/sites/${siteId}/lists/${list.id}/items`, {
        method: "POST",
        body: JSON.stringify({ fields })
      });

      // Send confirmation (best-effort)
      let emailResult = { sent: false };
      try {
        const requesterEmail = (fields.Email || "").trim();
        if (requesterEmail) {
          const fromUpn = process.env.MAIL_SENDER_UPN || "webrequests@vkolugurihesaa.onmicrosoft.com";
          const bcc = (process.env.MAIL_BCC || "")
            .split(",").map(s => s.trim()).filter(Boolean);
          const html = `
            <p>Hi,</p>
            <p>We received your request: <b>${escapeHtml(fields.Title)}</b>.</p>
            <p>Tracking ID: ${escapeHtml(created?.id?.toString?.() || "")}</p>
            <p>— HESAA Web Requests</p>
          `;
          await sendMail({ token, fromUpn, to: requesterEmail, subject: "HESAA Request Received", html, bcc });
          emailResult = { sent: true, to: requesterEmail };
        } else {
          emailResult = { sent: false, reason: "No requester email provided" };
        }
      } catch (mailErr) {
        context.log("EMAIL ERROR", mailErr?.stack || String(mailErr));
        emailResult = { sent: false, error: String(mailErr) };
      }

      context.res = {
        status: 201,
        headers: { "Content-Type": "application/json" },
        body: { ok: true, item: created, email: emailResult }
      };
      return;
    }

    context.res = { status: 405, body: { ok: false, error: "Method not allowed" } };
  } catch (err) {
    context.log(err.stack || String(err));
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: String(err) }
    };
  }
};
