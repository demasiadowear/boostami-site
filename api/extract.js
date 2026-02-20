import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Nessuna immagine fornita' });

    // Sicurezza: controlla se la chiave Vercel esiste davvero
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY mancante nelle variabili d'ambiente di Vercel.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Estrai TUTTE le partite di calcio da questo screenshot.
    Devi restituire SOLO ed ESCLUSIVAMENTE un array JSON, senza nessun testo prima o dopo.
    Struttura: [{"home": "Casa", "away": "Trasferta", "competition": "Competizione", "time": "Orario", "odds": "1X2 se visibili"}]`;

    // Ripulisce il base64
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: cleanBase64, mimeType: mimeType || 'image/jpeg' } }
    ]);

    let text = result.response.text();

    // PARSING ANTIPROIETTILE: Cerca solo quello che c'è tra le parentesi quadre dell'Array [ ]
    const match = text.match(/\[.*\]/s);
    if (!match) {
      throw new Error("Gemini non ha restituito un array valido. Risposta grezza: " + text);
    }

    const parsedData = JSON.parse(match[0]);
    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Errore critico in extract.js:', error);
    // Ora manda l'errore esatto al frontend per farti capire cosa si è rotto
    res.status(500).json({ error: error.message || "Errore sconosciuto OCR" });
  }
}