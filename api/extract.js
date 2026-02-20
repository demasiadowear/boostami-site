export default async function handler(req, res) {
  // 1. Controllo Metodo
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'Nessun testo OCR fornito' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Chiave API GEMINI_API_KEY non configurata su Vercel");

    // 2. Endpoint Stabile v1 (Risolve i 404 della v1beta)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{
          text: "Sei un estrattore di dati esperto. Analizza questo testo OCR di un bookmaker e trova i match di calcio.\n" +
                "REGOLE: Restituisci SOLO un array JSON pulito. Niente chiacchiere, niente markdown.\n" +
                "TESTO:\n" + rawText + "\n" +
                "STRUTTURA: [{\"home\": \"\", \"away\": \"\", \"competition\": \"\", \"time\": \"\", \"odds\": \"\"}]"
        }]
      }],
      generationConfig: {
        temperature: 0.1 // Massima precisione, minima fantasia
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Errore Google API (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // 3. Estrazione sicura del testo
    let textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 4. Pulizia aggressiva del JSON (rimuove ```json o testo extra)
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Testo ricevuto non valido:", textContent);
      throw new Error("L'IA non ha generato un formato JSON valido");
    }

    // 5. Risposta finale
    const parsedData = JSON.parse(jsonMatch[0]);
    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Errore critico in extract.js:', error.message);
    res.status(500).json({ 
      error: "Errore durante l'estrazione dati", 
      details: error.message 
    });
  }
}