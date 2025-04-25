// Cloudflare Worker zum Empfangen von Bestellungen via POST und Speichern in KV
// + CSV-Kompatibilität für späteren Excel-Export

export default {
    async fetch(request, env, ctx) {
      if (request.method === 'POST') {
        try {
          const data = await request.json();
  
          // Validierung (minimal)
          if (!data?.name || !data?.email || !Array.isArray(data?.bestellung)) {
            return new Response('Bad Request', { status: 400 });
          }
  
          const id = crypto.randomUUID();
          const timestamp = new Date().toISOString();
  
          // CSV-kompatibles Format als String vorbereiten
          const csvLine = [
            id,
            timestamp,
            JSON.stringify(data.name),
            JSON.stringify(data.email),
            JSON.stringify(data.telefon || ''),
            JSON.stringify(data.bestellung),
            data.gesamtbetrag
          ].join(';');
  
          // In KV speichern
          await env.BESTELLUNGEN_KV.put(`bestellung:${id}`, csvLine);
  
          return new Response('Gespeichert', { status: 200 });
        } catch (err) {
          return new Response('Server Error', { status: 500 });
        }
      }
  
      // Einfaches CSV-Listing bei GET (nur für Admins empfohlen)
      if (request.method === 'GET') {
        const { keys } = await env.BESTELLUNGEN_KV.list({ prefix: 'bestellung:' });
        const daten = await Promise.all(
          keys.map(async (k) => await env.BESTELLUNGEN_KV.get(k.name))
        );
  
        const header = 'ID;Timestamp;Name;E-Mail;Telefon;Bestellung;Gesamtbetrag';
        const body = [header, ...daten].join('\n');
  
        return new Response(body, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="bestellungen.csv"'
          }
        });
      }
  
      return new Response('Nur POST oder GET erlaubt', { status: 405 });
    }
  };
  