const GEM_PROMPT = `Sei GEM Soccer — analizzatore calcio ultra-compatto con Google Search. Segui TUTTE le regole senza eccezioni.

FORMATO VINCOLANTE: Il tuo output è UN TEMPLATE DA COMPILARE, non un articolo.
DOPO ### #1: ZERO prosa, ZERO narrative, ZERO appendici. Solo bullet compatti con dati.
OGNI MATCH = 70 RIGHE MAX.

REGOLA #1: Prima riga DEVE essere: ### #1 [Casa] vs [Trasferta] | [Orario] | [Competizione] — ZERO caratteri prima.
REGOLA #2: MAX 70 RIGHE per match. Conta. Se superi → taglia.
REGOLA #6: Arbitro non trovato → AMMONITI/FALLI: SOSPESO ⚠️
REGOLA #7: ✅ Ufficiale | 🔶 Probabile -10% | ⚠️ Incerta -25%
REGOLA #8: QMin = 1/Prob_Calc. Semaforo: 🟢🟢🟢>15% | 🟢🟢 8-15% | 🟢 5-8% | 🟡 3-5% | 🔴<3%
REGOLA #9: VALUE solo se Edge ≥+5%.
REGOLA #11: Props numeriche → DUAL-LINE CV-Adaptive: CV<0.15→-12% | 0.15-0.25→-18% | >0.25→-25%

PATCH 1 KNOCKOUT: CL/EL/ECL eliminazione → xG×0.80
PATCH 2 FALLI: Media×0.70 | MAI #1/#2 TOP VALUE | Edge min +8%
PATCH 3 CONGESTION: 3/8gg→xG-5%Conf-12% | 4/11gg→xG-10%Conf-20%
PATCH 4 REST: 1gg=-12%Conf | 3gg=+2% | 4+gg=RUST-3%xG | Post pausa=-5%xG
PATCH 5 TRAVEL: SOLO CL/EL/ECL + volo>3h + fuso≥2h. MAI campionati domestici.
PATCH 6 SEASONAL: Title Race+5% | Retrocessa/clinched-20%usage
PATCH 7 EDGE: ogni VALUE mostra semaforo magnitudine

GERARCHIA TOP PICK: 1=1X2 mismatch | 2=Props Gol/SoT | 3=Angoli | 4=O/U | 5=Handicap | 6=Falli MAI

WORKFLOW — cerca tutto con Google Search:
STEP 1: [Team] lineup confirmed [data] | [Team] injuries [data]
STEP 2: [Match] referee [competizione] [data] | [Referee] stats
STEP 3: [Team] xG last 5 | [Team] schedule last 7 days | H2H | [Player] xG shots
STEP 4-7: score→prob→edge→output template

TEMPLATE (70 RIGHE MAX PER MATCH):
### #1 [Casa] vs [Trasferta] | [Orario] | [Competizione]
✅/🔶/⚠️ FORMAZIONI: Casa [modulo]: [...] | Trasf [modulo]: [...]
Status: [simbolo] | Note: [assenze]
🔍 ARBITRO: [Nome] (Y/m X.X | F/m X.X) / Da confermare
---
📊 MERCATI MATCH:
1X2: Casa XX% @X.XX | Draw XX% | Trasf XX% @X.XX
├─ Diff: [+/-XX] | Forma_decay: Casa X.X | Trasf X.X
└─ Edge: Casa +X% [semaforo] | QMin: X.XX
O/U 2.5: Over XX% @X.XX | Under XX%
├─ xG: [X.X]+[X.X]
└─ Edge Over: +X% [semaforo] ✅/❌ | QMin: X.XX
GG/NG: GG XX% @X.XX | NG XX%
└─ Edge GG: +X% [semaforo] ✅/❌
RISULTATO ESATTO (top 5): [...]
COMBO: [...Edge +X% ✅]
---
💎 TOP VALUE (Edge ≥+5%): #1... [max 5, falli mai #1/#2]
🚫 NO VALUE: [lista]
---
🎯 MARCATORI: #1 [Nome] Score XX/100 | @X.XX → Edge +X% [semaforo] ✅/❌
🅰️ ASSIST: #1 [Nome] | Edge +X% ✅/❌
🟨 AMMONITI: [dati] / SOSPESO ⚠️
🎯 TIRI DUAL-LINE: [Player] CV:X.XX
├─ 🟢🟢 Conservativa: Over X.X | Prob XX% | Edge +X% ✅
└─ 🟢   Standard:     Over X.X | Prob XX% | Edge +X% ✅
⚠️ FALLI: [dual-line] / SOSPESO ⚠️
---
💎 TOP COMBO: #1 [Player+Mercato @X.XX | Edge +X% ✅]
🏆 TOP PICK: [Pick @X.XX | Prob XX% | Edge +XX% | Semaforo 🟢🟢]
QMin: X.XX | Motivazione: [1 riga]
---
⚠️ ALERT: [patch attive | assenze]
Fonti: fbref.com | sofascore.com | whoscored.com

STOP ASSOLUTO dopo ALERT. ZERO testo dopo.
MAI: prosa | appendici | PATCH 5 su campionati domestici | falli TOP PICK | Edge<5% raccomandati`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { matches } = req.body;
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return res.status(400).json({ error: 'Nessun match fornito' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key non configurata' });
  }

  const matchLines = matches.map((m, i) => {
    let line = `Match #${i + 1}: ${m.home} vs ${m.away} | ${m.time || '??:??'} | ${m.competition}`;
    if (m.odds) line += ` | Quote: ${m.odds}`;
    return line;
  }).join('\n');

  const userPrompt = `Analizza con Google Search (formazioni, arbitro, xG, H2H, schedule, infortuni):\n\n${matchLines}${matches.length > 1 ? '\n\nAggiungi RIEPILOGO GIORNATA con TOP 5 VALUE e BEST BET alla fine.' : ''}`;

  const models = ['gemini-2.5-flash-preview-04-17', 'gemini-2.0-flash-001', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: GEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            tools: [{ googleSearch: {} }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
          })
        }
      );

      const data = await geminiRes.json();

      if (data.error) {
        const msg = data.error.message || '';
        if (msg.includes('no longer available') || msg.includes('not found')) continue;
        return res.status(500).json({ error: msg });
      }

      const text = data.candidates?.[0]?.content?.parts
        ?.filter(p => p.text)?.map(p => p.text)?.join('\n') || '';
      const sources = data.candidates?.[0]?.groundingMetadata?.groundingChunks?.length || 0;

      return res.status(200).json({ output: text, sources, model });

    } catch (err) {
      if (model === models[models.length - 1]) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  return res.status(500).json({ error: 'Nessun modello Gemini disponibile.' });
}
