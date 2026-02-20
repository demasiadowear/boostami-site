export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'Nessun testo OCR fornito' });

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{
          text: "Ecco il testo grezzo estratto tramite OCR da uno screenshot di un bookmaker:\n---\n" + rawText + "\n---\nIl tuo compito è trovare tutte le partite di calcio in questo testo confuso.\nDevi restituire SOLO ed ESCLUSIVAMENTE un array JSON, senza nessun testo prima o dopo.\nStruttura richiesta: [{\"home\": \"Casa\", \"away\": \"Trasferta\", \"competition\": \"Competizione\", \"time\": \"Orario\", \"odds\": \"Quote se presenti\"}]"
        }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error("Errore API: " + errorData);
    }

    const data = await response.json();
    const textContent = data.candidates[0].content.parts[0].text;

    const match = textContent.match(/\[.*\]/s);
    if (!match) throw new Error("Il JSON non è stato trovato nella risposta.");

    res.status(200).json(JSON.parse(match[0]));

  } catch (error) {
    console.error('Errore extract.js:', error);
    res.status(500).json({ error: error.message || "Errore formattazione testo" });
  }
}