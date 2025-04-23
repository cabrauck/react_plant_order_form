import React, { useState } from "react";

const PREISLISTE = [
  { name: "Tomaten Normal", preis: 1.5 },
  { name: "Cocktailtomate", preis: 1.5 },
  { name: "Fleischtomate", preis: 1.5 },
  { name: "Eiertomate", preis: 1.5 },
  { name: "Schlangengurke", preis: 4.0 },
  { name: "Snackgurke", preis: 4.0 },
  { name: "Zucchini Grün", preis: 1.5 },
  { name: "Zucchini Gelb", preis: 1.5 },
  { name: "Paprika Mild", preis: 1.5 },
  { name: "Peperoni", preis: 1.5 },
  { name: "Erdbeere", preis: 1.5 },
];

export default function Bestellformular() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Vielen Dank!</h2>
        <p>Deine Bestellung wurde erfolgreich übermittelt.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 space-y-4">
      <div className="space-y-4 p-4 border rounded">
        <div>
          <label htmlFor="name" className="block font-medium">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-medium">E-Mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PREISLISTE.map((item) => (
            <div key={item.name}>
              <label className="block font-medium">{item.name} ({item.preis.toFixed(2)} €)</label>
              <input
                type="number"
                name={item.name}
                min="0"
                value={formData[item.name] || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
        </div>

        <button type="submit" className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded">Bestellen</button>
      </div>
    </form>
  );
}
