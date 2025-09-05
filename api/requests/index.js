// api/requests/index.js
// Node 18+ runtime (global fetch available)

async function getToken() {
  const params = new URLSearchParams({
    client_id: process.env.SP_CLIENT_ID,
    client_secret: process.env.SP_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const r = await fetch(
    `https://login.microsoftonline.com/${process.env.SP_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
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
      ...(init.headers || {}),
    },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Graph ${url} → ${r.status}: ${txt || r.statusText}`);
  }
  return r.status === 204 ? null : r.json();
}

/** Send a simple HTML email via Graph (app-only) */
async function sendMailAppOnly(token, { fromUpn, to, subject, html }) {
  if (!fromUpn || !to?.length) return;

  const body = {
    message: {
      subject,
      body: { contentType: "HTML", content: html },
      toRecipients: to.map((address) => ({ emailAddress: { address } })),
    },
    saveToSentItems: "false",
  };

  await graph(
    token,
    `/users/${encodeURIComponent(fromUpn)}/sendMail`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

module.exports = async function (context, req) {
  try {
    // --- config & IDs ---
    const siteUrl = process.env.SP_SITE_URL; // https://<tenant>.sharepoint.com/sites/HESAAWebRequestsPoC
    const listName = process.env.SP_LIST_NAME || "Web Requests";
    const mailboxUpn =
      process.env.MAILBOX_UPN || "webrequests@vkolugurihesaa.onmicrosoft.com";

    const host = new URL(siteUrl).host; // <tenant>.sharepoint.com
    const path = new URL(siteUrl).pathname; // /sites/HESAAWebRequestsPoC

    const token = await getToken();

    // Resolve site id
    const site = await graph(token, `/sites/${host}:${path}`);
    const siteId = site.id;

    // Resolve list id (by displayName)
    const lists = await graph(
      token,
      `/sites/${siteId}/lists?$select=id,displayName`
    );
    const list = lists.value.find(
      (x) => (x.displayName || "").toLowerCase() === listName.toLowerCase()
    );
    if (!list) throw new Error(`List not found: ${listName}`);

    // --- GET: list items (include Email in fields) ---
    if ((req.method || "GET").toUpperCase() === "GET") {
      const fields =
        "Id,Title,Email,RequestDescription,RequestType,Priority,RequestDate,RequestEndDate,Created,Modified";
      const items = await graph(
        token,
        `/sites/${siteId}/lists/${list.id}/items?expand=fields(select=${encodeURIComponent(
          fields
        )})`
      );

      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          ok: true,
          count: items.value.length,
          items: items.value.map((i) => i.fields),
        },
      };
      return;
    }

    // --- POST: create item, then email confirmation ---
    if (req.method.toUpperCase() === "POST") {
      const b =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};

      const email = (b.Email || "").trim();
      const title = b.Title || b.RequestTitle || "Untitled";

      const fields = {
        Title: title,
        Email: email, // <- NEW field
        RequestDescription: b.RequestDescription || "",
        RequestType: b.RequestType || "Inquiry",
        Priority: b.Priority || "Low",
        RequestDate:
          b.RequestDate || new Date().toISOString().slice(0, 10),
        RequestEndDate: !!b.RequestEndDate,
      };

      // Create list item
      const created = await graph(
        token,
        `/sites/${siteId}/lists/${list.id}/items`,
        { method: "POST", body: JSON.stringify({ fields }) }
      );

      // Fire-and-forget email (don’t fail the API if mail fails)
      (async () => {
        try {
          if (email) {
            await sendMailAppOnly(token, {
              fromUpn: mailboxUpn,
              to: [email],
              subject: "HESAA Request Received",
              html: `
                <p>Thanks! We received your request:</p>
                <p><strong>${escapeHtml(title)}</strong></p>
                <p>We’ll review it and get back to you.</p>
              `,
            });
          }
        } catch (e) {
          context.log(`sendMail error: ${e?.message || e}`);
        }
      })();

      context.res = {
        status: 201,
        headers: { "Content-Type": "application/json" },
        body: { ok: true, item: created },
      };
      return;
    }

    context.res = {
      status: 405,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: "Method not allowed" },
    };
  } catch (err) {
    context.log(err.stack || String(err));
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: String(err) },
    };
  }
};

// Small helper to avoid HTML injection in the email body
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
