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
    tomate: "bg-pink-100",
    gurke: "bg-green-100",
    zucchini: "bg-yellow-100",
    sonst: "bg-blue-100",
  };

  const gruppen = [
    { key: "tomate", label: "Tomaten" },
    { key: "gurke", label: "Gurken" },
    { key: "zucchini", label: "Zucchini" },
    { key: "sonst", label: "Sonstiges" }
  ];

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 rounded-lg bg-gradient-to-br from-pink-100 via-white to-blue-100 text-center shadow-xl">
        <h2 className="text-3xl font-bold text-pink-600 mb-2 font-display">🌸 Vielen Dank!</h2>
        <p className="text-gray-700 font-body">Deine Bestellung wurde erfolgreich übermittelt.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 space-y-6 px-4 font-body">
      <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-8 space-y-8 border border-gray-200">
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

        {gruppen.map(({ key, label }) => (
          <div key={key} className={`rounded-2xl p-4 space-y-3 ${farben[key]}`}>
            <h4 className="text-lg font-semibold text-gray-800 tracking-wide font-display">{label}</h4>
            {PREISLISTE.filter(item => item.kategorie === key).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <label className="font-medium text-sm text-gray-700 w-1/2">
                  {item.name} <span className="text-gray-500">({item.preis.toFixed(2)} €)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleDecrement(item.name)} className="w-8 h-8 rounded-full bg-white border text-lg shadow">-</button>
                  <input
                    type="number"
                    name={item.name}
                    min="0"
                    value={formData[item.name] || ""}
                    onChange={handleChange}
                    className="w-16 text-center p-2 border rounded-xl bg-white shadow"
                  />
                  <button type="button" onClick={() => handleIncrement(item.name)} className="w-8 h-8 rounded-full bg-white border text-lg shadow">+</button>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="text-right text-lg font-semibold text-gray-800 pt-2">
          Gesamt: <span className="text-pink-600">{gesamtpreis.toFixed(2)} €</span>
        </div>

        <div>
          <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md">
            Jetzt Bestellen ✨
          </button>
        </div>
      </div>
    </form>
  );
}
