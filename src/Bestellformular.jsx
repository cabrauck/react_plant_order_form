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

  const SITE_KEY = "0x4AAAAAABWeQz7LaTuMCIy1";

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
          sitekey: SITE_KEY,
          callback: (token) => setCfTurnstileResponse(token),
          theme: "light",
          size: "invisible"
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
      {/* ... hier geht der Rest deines Codes unverändert weiter ... */}
      <div className="hidden">
        <div ref={turnstileRef} className="cf-turnstile" data-sitekey="0x4AAAAAABWeQz7LaTuMCIy1" data-theme="light" data-size="invisible"></div>
      </div>
      {/* ... */}
    </form>
  );
}
