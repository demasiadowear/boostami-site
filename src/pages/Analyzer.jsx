import { useState, useRef, useEffect } from 'react'

const GREEN = '#10b981'
const CYAN = '#06b6d4'
const BG = '#050810'
const CARD = '#0d1424'
const BORDER = 'rgba(16,185,129,0.15)'
const TEXT = '#f0f4ff'
const MUTED = '#475569'

export default function Analyzer({ onNavigate }) {
  const [matches, setMatches] = useState([{ home: '', away: '', competition: '', time: '', odds: '' }])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('input')
  const [copied, setCopied] = useState(false)
  const [sources, setSources] = useState(0)
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  const addMatch = () => {
    if (matches.length < 8) setMatches([...matches, { home: '', away: '', competition: '', time: '', odds: '' }])
  }

  const removeMatch = (i) => setMatches(matches.filter((_, idx) => idx !== i))

  const updateMatch = (i, field, val) => {
    const updated = [...matches]
    updated[i][field] = val
    setMatches(updated)
  }

  const validMatches = matches.filter(m => m.home.trim() && m.away.trim() && m.competition.trim())

  const runAnalysis = async () => {
    if (!validMatches.length || loading) return
    setLoading(true)
    setSources(0)
    setTab('output')
    setOutput('⏳ Ricerca dati in corso con Google Search...\n')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: validMatches })
      })
      const data = await res.json()

      if (data.error) {
        setOutput(`❌ Errore: ${data.error}`)
      } else {
        setSources(data.sources || 0)
        setOutput(data.output || '⚠️ Nessun output generato.')
      }
    } catch (err) {
      setOutput(`❌ Errore connessione: ${err.message}`)
    }
    setLoading(false)
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inp = {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${BORDER}`,
    borderRadius: '6px', color: TEXT,
    fontSize: '0.83rem', fontFamily: "'DM Mono', 'Courier New', monospace",
    outline: 'none', transition: 'border-color 0.2s'
  }

  const card = {
    background: CARD, border: `1px solid ${BORDER}`,
    borderRadius: '10px', padding: '20px', marginBottom: '12px'
  }

  const tabBtn = (active) => ({
    padding: '8px 16px',
    background: active ? `linear-gradient(135deg, ${GREEN}, ${CYAN})` : 'transparent',
    border: `1px solid ${active ? 'transparent' : BORDER}`,
    borderRadius: '6px', cursor: 'pointer',
    fontSize: '0.78rem', color: active ? BG : TEXT,
    fontWeight: active ? '700' : '400',
    fontFamily: "'Space Grotesk', sans-serif",
    transition: 'all 0.2s'
  })

  const btnGreen = {
    padding: '13px', border: 'none', borderRadius: '8px',
    background: loading ? '#1a2438' : `linear-gradient(135deg, ${GREEN}, ${CYAN})`,
    color: loading ? MUTED : BG,
    fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.9rem', width: '100%',
    fontFamily: "'Space Grotesk', sans-serif",
    transition: 'all 0.2s'
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}>

      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                BOOST<span style={{ color: GREEN }}>AMI</span>
                <span style={{ color: MUTED, fontWeight: '400', fontSize: '0.75rem', marginLeft: '8px' }}>GEM Soccer v2</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {loading && (
              <span style={{ color: GREEN, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: GREEN, animation: 'pulse 1s infinite' }} />
                Ricerca live...
              </span>
            )}
            {sources > 0 && !loading && (
              <span style={{ background: 'rgba(16,185,129,0.1)', border: `1px solid ${BORDER}`, padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', color: GREEN }}>
                🔍 {sources} fonti
              </span>
            )}
            <span style={{ background: 'rgba(16,185,129,0.08)', border: `1px solid ${BORDER}`, padding: '3px 10px', borderRadius: '4px', fontSize: '0.65rem', color: GREEN }}>
              🌐 Google Search
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button style={tabBtn(tab === 'input')} onClick={() => setTab('input')}>📝 Match</button>
          <button style={tabBtn(tab === 'output')} onClick={() => setTab('output')}>📊 Analisi</button>
          <button onClick={() => { setOutput(''); setTab('input'); setMatches([{ home: '', away: '', competition: '', time: '', odds: '' }]) }}
            style={{ ...tabBtn(false), marginLeft: 'auto', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}>
            🔄 Reset
          </button>
        </div>

        {/* INPUT TAB */}
        {tab === 'input' && (
          <div>
            {matches.map((m, idx) => (
              <div key={idx} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ color: GREEN, fontWeight: '700', fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                    ⚽ MATCH #{idx + 1}
                  </span>
                  {matches.length > 1 && (
                    <button onClick={() => removeMatch(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.63rem', color: MUTED, display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>SQUADRA CASA *</label>
                    <input style={inp} placeholder="Es: Inter" value={m.home} onChange={e => updateMatch(idx, 'home', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.63rem', color: MUTED, display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>SQUADRA TRASFERTA *</label>
                    <input style={inp} placeholder="Es: Milan" value={m.away} onChange={e => updateMatch(idx, 'away', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.63rem', color: MUTED, display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>COMPETIZIONE *</label>
                    <input style={inp} placeholder="Es: Serie A" value={m.competition} onChange={e => updateMatch(idx, 'competition', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.63rem', color: MUTED, display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>ORARIO</label>
                    <input style={inp} placeholder="21:00" value={m.time} onChange={e => updateMatch(idx, 'time', e.target.value)} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.63rem', color: MUTED, display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>
                      QUOTE BOOKMAKER <span style={{ color: '#334155' }}>(opzionale — migliora il calcolo Edge)</span>
                    </label>
                    <input style={inp}
                      placeholder="1=1.85, X=3.50, 2=4.20, O2.5=1.75, GG=1.65"
                      value={m.odds}
                      onChange={e => updateMatch(idx, 'odds', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {matches.length < 8 && (
              <button onClick={addMatch} style={{ ...btnGreen, background: 'rgba(16,185,129,0.08)', color: GREEN, border: `1px solid ${BORDER}`, marginBottom: '12px' }}>
                + Aggiungi Match
              </button>
            )}

            {/* Info box */}
            <div style={{ ...card, borderColor: 'rgba(16,185,129,0.2)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.7rem', color: MUTED, lineHeight: '1.9' }}>
                <div style={{ color: GREEN, fontWeight: '700', marginBottom: '6px', fontSize: '0.75rem' }}>⚙️ COSA ANALIZZA AUTOMATICAMENTE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <div>→ Formazioni ufficiali e infortuni</div>
                  <div>→ Arbitro designato + statistiche</div>
                  <div>→ xG ultimi 5 match + H2H</div>
                  <div>→ Schedule (Fixture Congestion check)</div>
                  <div>→ Patch Knockout, Rest, Travel CL</div>
                  <div>→ Player Props con Dual-Line CV</div>
                </div>
              </div>
            </div>

            <button onClick={runAnalysis} disabled={loading || !validMatches.length} style={btnGreen}>
              {loading ? '🔍 Analisi in corso...' : `🔍 ANALIZZA${validMatches.length > 1 ? ` ${validMatches.length} MATCH` : ''}`}
            </button>

            {validMatches.length === 0 && (
              <div style={{ textAlign: 'center', color: MUTED, fontSize: '0.75rem', marginTop: '8px' }}>
                Compila almeno Casa + Trasferta + Competizione per procedere
              </div>
            )}
          </div>
        )}

        {/* OUTPUT TAB */}
        {tab === 'output' && (
          <div>
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.7rem', color: MUTED, fontFamily: "'DM Mono', monospace" }}>GEM_OUTPUT.md</span>
                <button onClick={copyOutput} disabled={!output || loading} style={{
                  background: 'rgba(16,185,129,0.1)', border: `1px solid ${BORDER}`,
                  color: GREEN, padding: '5px 12px', borderRadius: '4px',
                  cursor: 'pointer', fontSize: '0.72rem', fontFamily: "'Space Grotesk', sans-serif"
                }}>
                  {copied ? '✅ Copiato!' : '📋 Copia'}
                </button>
              </div>

              {!output ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: MUTED }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚽</div>
                  <div style={{ fontSize: '0.85rem' }}>Nessuna analisi ancora</div>
                  <button onClick={() => setTab('input')} style={{ marginTop: '16px', background: 'none', border: `1px solid ${BORDER}`, color: MUTED, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.8rem' }}>
                    ← Inserisci match
                  </button>
                </div>
              ) : (
                <div ref={outputRef} style={{
                  background: '#020509', border: `1px solid ${BORDER}`,
                  borderRadius: '6px', padding: '16px',
                  fontSize: '0.76rem', whiteSpace: 'pre-wrap',
                  maxHeight: '600px', overflowY: 'auto',
                  lineHeight: '1.7', fontFamily: "'DM Mono', 'Courier New', monospace",
                  color: TEXT
                }}>
                  {output}
                  {loading && <span style={{ color: GREEN }}>▌</span>}
                </div>
              )}
            </div>

            {!loading && output && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setTab('input')} style={{ ...btnGreen, background: CARD, color: GREEN, border: `1px solid ${BORDER}`, flex: 1 }}>
                  ← Modifica
                </button>
                <a href="https://t.me/boostami" target="_blank" rel="noreferrer" style={{
                  flex: 1, padding: '13px', borderRadius: '8px',
                  background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
                  color: CYAN, fontWeight: '700', fontSize: '0.9rem',
                  textDecoration: 'none', textAlign: 'center',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}>
                  📢 Condividi su Telegram
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800;900&family=DM+Mono&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #334155; }
        input:focus { border-color: rgba(16,185,129,0.4) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 2px; }
      `}</style>
    </div>
  )
}
