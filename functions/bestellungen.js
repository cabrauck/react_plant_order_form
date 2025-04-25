// Cloudflare Pages Function zum Empfangen von Bestellungen via POST und Speichern in KV, hoffentlich
// + CSV-Kompatibilität für späteren Excel-Export

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    console.log("POST-Daten empfangen:", data);

    // Validierung (minimal)
    if (!data?.name || !data?.email || !Array.isArray(data?.bestellung)) {
      console.warn("Ungültige Datenstruktur:", data);
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

    console.log("Speichern in KV:", `bestellung:${id}`);

    // In KV speichern
    await env.BESTELLUNGEN_KV.put(`bestellung:${id}`, csvLine);

    console.log("Speichern erfolgreich");
    return new Response('Gespeichert', { status: 200 });
  } catch (err) {
    console.error("Fehler beim POST:", err);
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
    console.error("Fehler beim GET:", err);
    return new Response('Fehler beim Abruf', { status: 500 });
  }
} 