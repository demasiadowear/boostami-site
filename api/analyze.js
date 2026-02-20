// api/analyze.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Ottieni il percorso assoluto della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { matches } = req.body;
    if (!matches) {
      return res.status(400).json({ error: 'Missing matches data' });
    }

    // Leggi il prompt in modo asincrono
    const promptPath = path.join(__dirname, 'prompt.txt');
    let systemInstructionText;
    try {
      systemInstructionText = await fs.readFile(promptPath, 'utf8');
    } catch (fileError) {
      console.error('Errore lettura prompt.txt:', fileError);
      return res.status(500).json({ 
        error: 'Prompt file non trovato o illeggibile',
        details: fileError.message 
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY non configurata' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Analizza: ${JSON.stringify(matches)}` }]
        }
      ],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    };

    // Effettua la chiamata con un timeout di 55 secondi (limite Vercel Hobby: 60 secondi)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Se la risposta non è OK, estrai il corpo errore
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() };
      }
      console.error('Errore API Gemini:', response.status, errorData);
      return res.status(response.status).json({
        error: 'Errore dal servizio Gemini',
        status: response.status,
        details: errorData
      });
    }

    const data = await response.json();

    // Estrai il testo in modo sicuro
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!output) {
      console.error('Risposta Gemini inattesa:', JSON.stringify(data));
      return res.status(500).json({ error: 'Risposta Gemini vuota o malformata' });
    }

    res.status(200).json({ output });
  } catch (error) {
    console.error('Errore generale in handler:', error);
    res.status(500).json({
      error: "Errore interno del server",
      details: error.message,
      ...(error.name === 'AbortError' && { timeout: true })
    });
  }
}