export async function onRequestPost({ request, env }) {
  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, SHAREPOINT_SITE, LIST_NAME } = env;

  try {
    const data = await request.json();

    if (!data?.name || !data?.email || !Array.isArray(data?.bestellung)) {
      return new Response('Bad Request', { status: 400 });
    }

    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const payload = {
      fields: {
        Title: data.name,
        Email: data.email,
        Telefon: data.telefon || '',
        Bestellung: JSON.stringify(data.bestellung),
        Gesamtbetrag: data.gesamtbetrag,
        Status: "pending",  // Wichtig für späteres Double-Opt-In
        Timestamp: new Date().toISOString()
      }
    };

    const listApiUrl = `${SHAREPOINT_SITE}/_api/web/lists/GetByTitle('${LIST_NAME}')/items`;

    const response = await fetch(listApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Fehler beim Schreiben in Lists:', error);
      return new Response('Fehler bei Lists', { status: 500 });
    }

    return new Response('Bestellung gespeichert!', { status: 200 });

  } catch (err) {
    console.error('Fehler im Worker:', err);
    return new Response('Server Error', { status: 500 });
  }
}
