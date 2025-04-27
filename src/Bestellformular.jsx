import React, { useState } from "react";

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
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';

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
    const bestellung = PREISLISTE.map((item) => ({
      artikel: item.name,
      stueck: parseInt(formData[item.name] || 0),
      preis: item.preis,
    })).filter((b) => b.stueck > 0);

    const gesamtbetrag = bestellung.reduce(
      (summe, b) => summe + b.stueck * b.preis,
      0
    );

    const payload = {
      name: formData.name,
      email: formData.email,
      telefon: formData.telefon || '',
      bestellung,
      gesamtbetrag,
      timestamp: new Date().toISOString(),
    };

    console.log("Senden an Backend:", payload);
    await fetch("/api/bestellen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    setSubmitted(true);
  };

  const gesamtpreis = PREISLISTE.reduce((sum, item) => {
    const count = parseInt(formData[item.name] || 0);
    return sum + (isNaN(count) ? 0 : count * item.preis);
  }, 0);

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

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 rounded-lg bg-gradient-to-br from-pink-100 via-white to-blue-100 text-center shadow-xl">
        <h2 className="text-3xl font-bold text-pink-600 mb-2 font-display">🌸 Vielen Dank!</h2>
        <p className="text-gray-700 font-body">Deine Bestellung wurde erfolgreich übermittelt.</p>
        {isAdmin && (
          <div className="mt-6">
            <a href="/api/bestellen" download className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold">
              📥 Bestellungen herunterladen
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 space-y-6 px-4 font-body">
      {/* Hier könnte noch die Eingabe bleiben, die bleibt vorerst wie sie ist */}
    </form>
  );
}
