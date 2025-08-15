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
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) }
  });
  if (!r.ok) throw new Error(`Graph ${url} → ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}

module.exports = async function (context, req) {
  try {
    const siteUrl = process.env.SP_SITE_URL;                  // https://<tenant>.sharepoint.com/sites/HESAAWebRequestsPOC
    const listName = process.env.SP_LIST_NAME || "Web Requests";
    const host = new URL(siteUrl).host;                       // <tenant>.sharepoint.com
    const path = new URL(siteUrl).pathname;                   // /sites/HESAAWebRequestsPOC

    const token = await getToken();

    // Resolve site and list IDs
    const site = await graph(token, `/sites/${host}:${path}`);
    const siteId = site.id;

    const lists = await graph(token, `/sites/${siteId}/lists?$select=id,displayName`);
    const list = lists.value.find(x => (x.displayName || "").toLowerCase() === listName.toLowerCase());
    if (!list) throw new Error(`List not found: ${listName}`);

    if ((req.method || "GET").toUpperCase() === "GET") {
      const fields = "Id,Title,RequestDescription,RequestType,Priority,RequestDate,RequestEndDate,Created,Modified";
      const items = await graph(token, `/sites/${siteId}/lists/${list.id}/items?expand=fields(select=${fields})`);
      context.res = { status: 200, headers: { "Content-Type": "application/json" },
        body: { ok: true, count: items.value.length, items: items.value.map(i => i.fields) } };
      return;
    }

    if (req.method.toUpperCase() === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const fields = {
        Title: b.Title || b.RequestTitle || "Untitled",
        RequestDescription: b.RequestDescription || "",
        RequestType: b.RequestType || "Inquiry",
        Priority: b.Priority || "Low",
        RequestDate: b.RequestDate || new Date().toISOString().slice(0,10),
        RequestEndDate: !!b.RequestEndDate
      };
      const created = await graph(token, `/sites/${siteId}/lists/${list.id}/items`,
        { method: "POST", body: JSON.stringify({ fields }) });
      context.res = { status: 201, headers: { "Content-Type": "application/json" }, body: { ok: true, item: created } };
      return;
    }

    context.res = { status: 405, body: { ok: false, error: "Method not allowed" } };
  } catch (err) {
    context.log(err.stack || String(err));
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { ok: false, error: String(err) } };
  }
};
