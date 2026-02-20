import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { imageBase64, mimeType } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Istruzione blindata: estrarre SEMPRE tutto, anche i campionati minori
    const prompt = `Estrai TUTTE le partite di calcio da questo screenshot. È fondamentale che tu analizzi e includa sempre tutte le partite presenti nell'immagine, anche se appartengono a campionati meno blasonati o leghe minori. Nessuna eccezione.
    Restituisci SOLO un array JSON valido con questa struttura esatta:
    [{"home": "Casa", "away": "Trasferta", "competition": "Competizione", "time": "Orario", "odds": "1X2 se visibili"}]`;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const result = await model.generateContent([prompt, { inlineData: { data: cleanBase64, mimeType: mimeType || 'image/jpeg' } }]);
    
    let text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    res.status(200).json(JSON.parse(text));
  } catch (error) {
    res.status(500).json({ error: "Errore estrazione OCR" });
  }
}