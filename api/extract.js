export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, mimeType } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Nessuna immagine fornita' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key non configurata' });

  const prompt = `Analizza questo screenshot di un bookmaker o calendario partite ed estrai TUTTE le partite di calcio visibili.

Per ogni partita restituisci un JSON array con questo formato ESATTO:
[
  {
    "home": "Nome Squadra Casa",
    "away": "Nome Squadra Trasferta", 
    "competition": "Nome Campionato/Competizione",
    "time": "HH:MM",
    "odds": "1=X.XX, X=X.XX, 2=X.XX"
  }
]

Regole:
- Se le quote non sono visibili, lascia "odds" come stringa vuota ""
- Se l'orario non è visibile, metti ""
- Usa i nomi completi delle squadre
- Identifica la competizione dal contesto (es: "Serie A", "Champions League", "Premier League")
- Restituisci SOLO il JSON array, niente altro testo
- Se non ci sono partite di calcio visibili, restituisci []`;

  const models = ['gemini-2.5-flash-preview-04-17', 'gemini-2.0-flash-001', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { inlineData: { mimeType: mimeType || 'image/png', data: imageBase64 } },
                { text: prompt }
              ]
            }],
            generationConfig: { temperature: 0, maxOutputTokens: 2048 }
          })
        }
      );

      const data = await geminiRes.json();

      if (data.error) {
        const msg = data.error.message || '';
        if (msg.includes('no longer available') || msg.includes('not found')) continue;
        return res.status(500).json({ error: msg });
      }

      const rawText = data.candidates?.[0]?.content?.parts
        ?.filter(p => p.text)?.map(p => p.text)?.join('') || '[]';

      // Clean and parse JSON
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const matches = JSON.parse(cleaned);
        return res.status(200).json({ matches, model });
      } catch {
        return res.status(200).json({ matches: [], raw: rawText, error: 'Parsing JSON fallito' });
      }

    } catch (err) {
      if (model === models[models.length - 1]) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  return res.status(500).json({ error: 'Nessun modello disponibile.' });
}
