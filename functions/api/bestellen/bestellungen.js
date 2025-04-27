// Cloudflare Pages Function zum Empfangen von Bestellungen via POST und Speichern in KV
// + CSV-Kompatibilität für späteren Excel-Expor

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const csvLine = [
      id,
      timestamp,
      JSON.stringify(data.name),
      JSON.stringify(data.email),
      JSON.stringify(data.telefon || ''),
      JSON.stringify(data.bestellung),
      data.gesamtbetrag
    ].join(';');

    await env.BESTELLUNGEN_KV.put(`bestellung:${id}`, csvLine);

    return new Response('Gespeichert', { status: 200 });
  } catch (err) {
    return new Response('Server Error', { status: 500 });
  }
}

export async function onRequestGet({ env }) {
  try {
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
  } catch (err) {
    return new Response('Fehler beim Abruf', { status: 500 });
  }
}
