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
      bestellung,
      gesamtbetrag,
      timestamp: new Date().toISOString(),
    };

    console.log("Senden an Backend:", payload);
    setSubmitted(true);
  };

  const gesamtpreis = PREISLISTE.reduce((sum, item) => {
    const count = parseInt(formData[item.name] || 0);
    return sum + (isNaN(count) ? 0 : count * item.preis);
  }, 0);

  const farben = {
    tomate: "bg-red-50",
    gurke: "bg-green-50",
    zucchini: "bg-yellow-50",
    sonst: "bg-stone-100",
  };

  const gruppen = [
    { key: "tomate", label: "Tomaten" },
    { key: "gurke", label: "Gurken" },
    { key: "zucchini", label: "Zucchini" },
    { key: "sonst", label: "Sonstiges" }
  ];

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Rock Salt, cursive' }}>Vielen Dank!</h2>
        <p style={{ fontFamily: 'Open Sans, sans-serif' }}>Deine Bestellung wurde erfolgreich übermittelt.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 space-y-4 px-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
      <div className="bg-stone-50 shadow rounded-lg p-6 space-y-6 border border-[#00afea]">
        <div>
          <label htmlFor="name" className="block font-medium text-sm text-gray-700">Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-700"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-medium text-sm text-gray-700">E-Mail *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-700"
          />
        </div>

        {gruppen.map(({ key, label }) => (
          <div key={key} className={`rounded p-2 space-y-1 ${farben[key]}`}>
            <h4 className="text-gray-700 text-base mb-2" style={{ fontFamily: 'Rock Salt, cursive' }}>{label}</h4>
            {PREISLISTE.filter(item => item.kategorie === key).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <label className="font-medium text-sm text-gray-700 w-1/2">
                  {item.name} <span className="text-gray-500">({item.preis.toFixed(2)} €)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleDecrement(item.name)} className="w-8 h-8 rounded bg-gray-200 text-lg">-</button>
                  <input
                    type="number"
                    name={item.name}
                    min="0"
                    value={formData[item.name] || ""}
                    onChange={handleChange}
                    className="w-16 text-center p-2 border rounded bg-white"
                  />
                  <button type="button" onClick={() => handleIncrement(item.name)} className="w-8 h-8 rounded bg-gray-200 text-lg">+</button>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="text-right font-semibold pt-2">
          Gesamtpreis: {gesamtpreis.toFixed(2)} €
        </div>

        <div>
          <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded transition">
            Bestellen
          </button>
        </div>
      </div>
    </form>
  );
}
