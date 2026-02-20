import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { matches } = req.body;
  if (!matches || !matches.length) return res.status(400).json({ error: 'Nessun match' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // Legge il prompt dal file esterno
    const promptPath = path.join(process.cwd(), 'api', 'prompt.txt');
    const systemInstructionText = fs.readFileSync(promptPath, 'utf8');

    const payload = {
      systemInstruction: { parts: [{ text: systemInstructionText }] },
      contents: [{
        role: "user",
        parts: [{ text: "Analizza i seguenti match:\n" + JSON.stringify(matches) }]
      }],
      tools: [{ googleSearch: {} }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    res.status(200).json({ output: data.candidates[0].content.parts[0].text });

  } catch (error) {
    console.error("Errore:", error);
    res.status(500).json({ error: "Errore AI", details: error.message });
  }
}