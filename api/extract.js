import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'Nessun testo OCR fornito' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // FIX: Aggiunto "-latest" per risolvere l'errore 404 di Google
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `Ecco il testo grezzo estratto tramite OCR da uno screenshot di un bookmaker:
    ---
    ${rawText}
    ---
    Il tuo compito è trovare tutte le partite di calcio in questo testo confuso.
    Devi restituire SOLO ed ESCLUSIVAMENTE un array JSON, senza nessun testo prima o dopo.
    Struttura richiesta: [{"home": "Casa", "away": "Trasferta", "competition": "Competizione", "time": "Orario", "odds": "Quote se presenti"}]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    const match = text.match(/\[.*\]/s);
    if (!match) throw new Error("Gemini non ha restituito un JSON valido.");

    res.status(200).json(JSON.parse(match[0]));

  } catch (error) {
    console.error('Errore extract.js:', error);
    res.status(500).json({ error: error.message || "Errore formattazione testo" });
  }
}