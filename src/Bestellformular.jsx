import React, { useState, useEffect, useRef } from "react";

const PREISLISTE = [
  { name: "Tomaten Normal", preis: 1.5, kategorie: "tomate" },
  { name: "Cocktailtomate", preis: 1.5, kategorie: "tomate" },
  { name: "Fleischtomate", preis: 1.5, kategorie: "tomate" },
  { name: "Eiertomate", preis: 1.5, kategorie: "tomate" },
  { name: "Schlangengurke", preis: 4.0, kategorie: "gurke" },
  { name: "Snackgurke", preis: 4.0, kategorie: "gurke" },
  { name: "Zucchini Grün", preis: 1.5, kategorie: "zucchini" },
  { name: "Zucchini Gelb", preis: 1.5, kategorie: "zucchini" },
  { name: "Paprika Mild", preis: 1.5, kategorie: "sonst" },
  { name: "Peperoni", preis: 1.5, kategorie: "sonst" },
  { name: "Erdbeere", preis: 1.5, kategorie: "sonst" },
];

export default function Bestellformular() {
  const [formData, setFormData] = useState({ name: "", email: "", telefon: "" });
  const [submitted, setSubmitted] = useState(false);
  const [bestellungDetails, setBestellungDetails] = useState([]);
  const [sending, setSending] = useState(false);
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
  const [cfTurnstileResponse, setCfTurnstileResponse] = useState("");
  const turnstileRef = useRef(null);

  const berechneGesamtbetrag = () => {
    return PREISLISTE.reduce((sum, item) => {
      const count = parseInt(formData[item.name] || 0);
      return sum + (isNaN(count) ? 0 : count * item.preis);
    }, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncrement = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: (parseInt(prev[name] || 0) + 1).toString(),
    }));
  };

  const handleDecrement = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Math.max(0, parseInt(prev[name] || 0) - 1).toString(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    if (!cfTurnstileResponse) {
      alert("Bitte bestätige, dass du kein Roboter bist.");
      setSending(false);
      return;
    }

    const bestellung = PREISLISTE.map((item) => ({
      artikel: item.name,
      stueck: parseInt(formData[item.name] || 0),
      preis: item.preis,
    })).filter((b) => b.stueck > 0);

    const payload = {
      name: formData.name,
      email: formData.email,
      telefon: formData.telefon || '',
      bestellung,
      gesamtbetrag: berechneGesamtbetrag(),
      cfTurnstileResponse,
      timestamp: new Date().toISOString(),
    };

    console.log("Senden an Backend:", payload);
    await fetch("/api/bestellen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setBestellungDetails(bestellung);
    setSubmitted(true);
    setSending(false);
  };

  const farben = {
    tomate: "bg-pink-100",
    gurke: "bg-green-100",
    zucchini: "bg-yellow-100",
    sonst: "bg-blue-100",
  };

  const gruppen = [
    { key: "tomate", label: "🍅 Tomaten" },
    { key: "gurke", label: "🥒 Gurken" },
    { key: "zucchini", label: "🟡 Zucchini" },
    { key: "sonst", label: "🌶️ Sonstiges" }
  ];

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #druckbereich, #druckbereich * {
          visibility: visible;
        }
        #druckbereich {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=turnstileLoaded";
    script.async = true;
    document.body.appendChild(script);

    window.turnstileLoaded = () => {
      if (window.turnstile) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: "0x4AAAAAABWeQ9UtBL_I2RFBvBk2pkp9kKQ",
          callback: (token) => setCfTurnstileResponse(token)
        });
      }
    };

    return () => {
      document.head.removeChild(style);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 space-y-6 px-4 font-body">
      {isAdmin && (
        <div className="text-right">
          <a href="/api/bestellen" download className="inline-block mb-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold">
            📥 Bestellungen herunterladen
          </a>
        </div>
      )}

      {!submitted ? (
        <>
          <h1 className="text-center text-2xl sm:text-3xl font-bold text-pink-700 font-display mb-4">
            🌿 Bestellung – Pflanzenmarkt 🌿
          </h1>
          <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-8 space-y-8 border border-gray-200">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600">Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600">E-Mail *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-600">Telefon (optional)</label>
              <input
                type="tel"
                name="telefon"
                value={formData.telefon || ''}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {gruppen.map(({ key, label }) => (
              <div key={key} className={`rounded-2xl p-4 sm:p-5 space-y-4 ${farben[key]}`}>
                <h4 className="text-lg font-semibold text-gray-800 tracking-wide font-display">{label}</h4>
                {PREISLISTE.filter(item => item.kategorie === key).map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <label className="font-medium text-sm text-gray-700 sm:w-1/2">
                      {item.name} <span className="text-gray-500">({item.preis.toFixed(2)} €)</span>
                    </label>
                    <div className="flex items-center gap-3 justify-end">
                      <button type="button" onClick={() => handleDecrement(item.name)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white border text-lg shadow">-</button>
                      <input
                        type="number"
                        name={item.name}
                        min="0"
                        value={formData[item.name] || ""}
                        onChange={handleChange}
                        className="w-16 text-center p-3 sm:p-2 border rounded-xl bg-white shadow"
                      />
                      <button type="button" onClick={() => handleIncrement(item.name)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white border text-lg shadow">+</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="text-right text-lg font-semibold text-gray-800 pt-2">
              Gesamt: <span className="text-pink-600">{berechneGesamtbetrag().toFixed(2)} €</span>
            </div>

            <div className="flex justify-center my-4">
              <div ref={turnstileRef} className="cf-turnstile" data-sitekey="0x4AAAAAABWeQz7LaTuMCIy1" data-theme="light"></div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full ${sending ? 'bg-gray-400' : 'bg-pink-500 hover:bg-pink-600'} text-white font-semibold py-4 px-6 rounded-xl transition shadow-md`}
                disabled={sending}
              >
                {sending ? 'Bestellung wird gesendet...' : 'Jetzt Bestellen ✨'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div id="druckbereich" className="p-6 bg-gradient-to-br from-pink-100 via-white to-blue-100 rounded-lg shadow-xl text-center space-y-6">
          <h2 className="text-3xl font-bold text-pink-600 mb-2 font-display">🌸 Vielen Dank, {formData.name}!</h2>
          <p className="text-gray-700 font-body">Deine Bestellung wurde erfolgreich übermittelt.</p>

          <div className="text-left space-y-4">
            <h3 className="text-xl font-bold text-gray-800">📝 Deine Bestellung:</h3>
            <ul className="space-y-2">
              {bestellungDetails.map((item) => (
                <li key={item.artikel} className="text-gray-700">
                  {item.stueck} × {item.artikel} ({(item.preis * item.stueck).toFixed(2)} €)
                </li>
              ))}
            </ul>

            <div className="text-right font-semibold text-gray-900 pt-4">
              Gesamtbetrag: <span className="text-pink-600">{berechneGesamtbetrag().toFixed(2)} €</span>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            Wir sehen uns zur Abholung am <strong>03.05.</strong> beim Pflanzenmarkt,<br />
            <strong>Hauptstraße 6</strong>.<br />
            Bitte bring den Betrag in bar mit.<br />
            Tipp: Mach gern einen Screenshot oder Ausdruck dieser Übersicht! 🌿
          </div>

          <button
            onClick={() => window.print()}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl shadow-md"
          >
            🖨️ Übersicht Drucken
          </button>
        </div>
      )}
    </form>
  );
}
