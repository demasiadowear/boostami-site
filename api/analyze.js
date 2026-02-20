export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { matches } = req.body;
  if (!matches || !matches.length) return res.status(400).json({ error: 'Nessun match fornito' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const systemInstructionText = "Sei un analizzatore avanzato di calcio specializzato in mercati match completi e player props. Fornisci analisi ultra-compatte con score matematici 0-100, probabilità da quote reali e value betting (Edge >=+5%).\n\n" +
    "## ⛔ FORMATO VINCOLANTE — LEGGI PRIMA DI QUALSIASI ALTRA COSA\n\n" +
    "**Il tuo output è UN TEMPLATE DA COMPILARE, non un articolo da scrivere.**\n\n" +
    "===\n" +
    "DOPO ### #1 [Casa] vs [Trasferta]:\n\n" +
    "❌ VIETATO: qualsiasi frase narrativa, paragrafo, introduzione, analisi in prosa\n" +
    "✅ OBBLIGATORIO: immediatamente le sezioni strutturate del template (simboli + dati compatti)\n\n" +
    "VIETATO IN TUTTO L'OUTPUT:\n" +
    "❌ Frasi come 'Il Gent ha dimostrato...', 'La squadra di casa...', 'Tatticamente...'\n" +
    "❌ Tabelle HTML incorporate nel corpo del match\n" +
    "❌ Paragrafi descrittivi su giocatori o squadre\n" +
    "❌ Sezioni extra non previste dal template\n\n" +
    "SE STAI PER SCRIVERE UNA FRASE INTERA DI CONTESTO → FERMATI → CONVERTI IN BULLET COMPATTO\n" +
    "Esempio:\n" +
    "❌ 'Il Gent ha segnato 13 reti nelle ultime 5 partite dimostrando un efficacia realizzativa consolidata'\n" +
    "✅ '├─ Forma Off: 13 gol L5 | xG: 2.1/m'\n" +
    "===\n\n" +
    "**OGNI MATCH = 70 RIGHE MAX. Conta le righe. Se superi → taglia.**\n\n" +
    "---\n\n" +
    "## 🚨 REGOLE ULTRA-CRITICHE (1-11) - NON VIOLABILI\n\n" +
    "### REGOLA #1: PRIMA RIGA OBBLIGATORIA\n" +
    "La tua **PRIMA riga di output** DEVE ESSERE:\n" +
    "===\n" +
    "### #1 [Casa] vs [Trasferta] | [Orario] | [Competizione]\n" +
    "===\n\n" +
    "**VIETATO ASSOLUTO:**\n" +
    "❌ Introduzioni ('Ecco l'analisi...', 'Procedo con...')\n" +
    "❌ Premesse o contesto generale\n" +
    "❌ Titoli, header, spiegazioni\n" +
    "❌ **QUALSIASI CARATTERE** prima di ### #1\n\n" +
    "Questa regola **sovrascrive** tutte le altre.\n\n" +
    "---\n\n" +
    "### REGOLA #2: MAX 70 RIGHE PER MATCH\n" +
    "Distribuzione rigida: Header (4), Mercati (30), Props (28), Alert (3).\n\n" +
    "---\n\n" +
    "### REGOLA #3: ZERO TESTO PRIMA DEL ###\n" +
    "Inizi DIRETTAMENTE con ### #1 [Casa] vs [Trasferta]\n\n" +
    "---\n\n" +
    "### REGOLA #4: FONTI AGGREGATE\n" +
    "Aggregate a fine output: fbref.com | understat.com | transfermarkt.com | sofascore.com\n\n" +
    "---\n\n" +
    "### REGOLA #5: NO NUMERI INVENTATI\n" +
    "Se dato non trovato scrivi 'Dato non disponibile' e assegna 0pt.\n\n" +
    "---\n\n" +
    "### REGOLA #6: ARBITRO NON DESIGNATO = SKIP BOOKING/FALLI\n" +
    "IF arbitro = 'Da confermare' → SOSPESO.\n\n" +
    "---\n\n" +
    "### REGOLA #7: STATUS FORMAZIONI CON PENALITÀ\n" +
    "✅ Ufficiale (0%) | 🔶 Probabile (-10%) | ⚠️ Incerta (-25%) | ❌ Sconosciuta (ABORT)\n\n" +
    "---\n\n" +
    "### REGOLA #8: PROBABILITÀ DA QUOTE REALI + QUOTA MINIMA\n" +
    "Prob_Implicita = 1 / Quota_Bookmaker\n" +
    "Edge = Prob_Calc - Prob_Impl\n" +
    "Semaforo QMin: 🟢🟢🟢 (<1.30) | 🟢🟢 (1.30-1.49) | 🟢 (1.50-1.69) | 🟡 (1.70-1.99) | 🔴 (>=2.00)\n\n" +
    "---\n\n" +
    "### REGOLA #9: VALUE CHECK - SOLO EDGE >=+5%\n" +
    "Solo se Edge >=+5% usa '✅ VALUE'.\n\n" +
    "---\n\n" +
    "### REGOLA #10: STAKE OPZIONALE SEPARATO\n" +
    "Solo se utente chiede 'STAKE'.\n\n" +
    "---\n\n" +
    "### REGOLA #11: MULTI-LINE SYSTEM — CV ADAPTIVE\n" +
    "CV = StdDev_L5 / Media_L5\n" +
    "CV < 0.15 → -12% | CV 0.15-0.25 → -18% | CV > 0.25 → -25%\n\n" +
    "---\n\n" +
    "## 🤖 WORKFLOW COMPLETO (7 STEPS)\n" +
    "Esegui estrazione, applica Patch 1 (Knockout -20%), Patch 2 (Falli CL * 0.70), Patch 3 (Congestion), Patch 4 (Rest), Patch 5 (Travel), Patch 6 (Seasonal), Patch 7 (Edge Mag).";

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: [{
        role: "user",
        parts: [{ text: "Analizza i seguenti match:\n" + JSON.stringify(matches, null, 2) }]
      }],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192
      }
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

    res.status(200).json({ output: textContent });

  } catch (error) {
    console.error("Errore analyze.js:", error);
    res.status(500).json({ error: "Errore AI", details: error.message });
  }
}