export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    return new Response('OK', { status: 200 });
  }

  if (request.method === 'POST') {
    try {
      const formData = await request.json();
      console.log("Empfangenes Payload:", JSON.stringify(formData));

      if (!formData || !formData.name || !formData.email || !Array.isArray(formData.bestellung) || !formData.cfTurnstileResponse) {
        console.warn("Ungültige Bestelldaten erhalten:", JSON.stringify(formData));
        return new Response("Ungültige Bestellung", { status: 400 });
      }

      const token = formData.cfTurnstileResponse;
      const ip = request.headers.get("CF-Connecting-IP");

      const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: token,
          remoteip: ip
        })
      });

      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        console.error("Turnstile-Validierung fehlgeschlagen:", turnstileData);
        return new Response("Turnstile-Verifizierung fehlgeschlagen", { status: 400 });
      }

      const { name, email, telefon = '', bestellung, gesamtbetrag } = formData;

      console.log("Hole AccessToken...");
      const accessToken = await getAccessToken(env);
      if (!accessToken) {
        console.error("Kein AccessToken erhalten.");
        return new Response("Serverfehler: Kein AccessToken", { status: 500 });
      }

      const graphEndpoint = `https://graph.microsoft.com/v1.0/sites/${env.M365_SITE_ID}/lists/${env.M365_LIST_ID}/items`;

      console.log("POST an Microsoft Lists:", graphEndpoint);

      const graphBody = {
        fields: {
          Title: name,
          Email: email,
          Telefon: telefon,
          Bestellung: JSON.stringify(bestellung),
          Gesamtbetrag: gesamtbetrag,
          Status: "pending"
        }
      };

      const res = await fetch(graphEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphBody)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Fehler beim Schreiben in Microsoft Lists (Status ${res.status}):`, errorText);
        return new Response("Serverfehler bei Speicherung", { status: 500 });
      }

      console.log("Bestellung erfolgreich gespeichert bei Microsoft Lists!");
      return new Response("Bestellung erfolgreich", { status: 200 });

    } catch (err) {
      console.error("Unerwarteter Fehler:", err.stack || err);
      return new Response("Interner Serverfehler", { status: 500 });
    }
  }

  return new Response("Methode nicht erlaubt", { status: 405 });
}

async function getAccessToken(env) {
  try {
    const tokenUrl = `https://login.microsoftonline.com/${env.M365_TENANT_ID}/oauth2/v2.0/token`;
    const body = new URLSearchParams();
    body.append('client_id', env.M365_CLIENT_ID);
    body.append('client_secret', env.M365_CLIENT_SECRET);
    body.append('grant_type', 'client_credentials');
    body.append('scope', 'https://graph.microsoft.com/.default');

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Fehler beim Abrufen des AccessTokens (Status ${res.status}):`, errorText);
      return null;
    }

    const { access_token } = await res.json();
    console.log("AccessToken erfolgreich erhalten.");
    return access_token;

  } catch (err) {
    console.error("Fehler in getAccessToken():", err.stack || err);
    return null;
  }
}
