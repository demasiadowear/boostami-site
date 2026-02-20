import { useEffect, useState } from 'react'

export default function Home({ onNavigate }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050810',
      color: '#f0f4ff',
      fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'fixed', top: '-200px', right: '-200px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-300px', left: '-100px',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        zIndex: 0
      }} />

      {/* NAV */}
      <nav style={{
        position: 'relative', zIndex: 10,
        padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(16,185,129,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px'
          }}>⚡</div>
          <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            BOOST<span style={{ color: '#10b981' }}>AMI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="https://t.me/boostami" target="_blank" rel="noreferrer" style={{
            color: '#64748b', textDecoration: 'none', fontSize: '0.85rem',
            padding: '8px 16px', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '6px',
            transition: 'all 0.2s'
          }}>
            📢 Telegram
          </a>
          <button onClick={() => onNavigate('analyzer')} style={{
            padding: '8px 20px', borderRadius: '6px', border: 'none',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            color: '#050810', fontWeight: '700', fontSize: '0.85rem',
            cursor: 'pointer', letterSpacing: '0.02em'
          }}>
            ANALIZZA →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <main style={{
        position: 'relative', zIndex: 10,
        maxWidth: '1100px', margin: '0 auto',
        padding: '80px 40px 60px'
      }}>
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            padding: '6px 14px', borderRadius: '100px', marginBottom: '32px',
            fontSize: '0.75rem', color: '#10b981', letterSpacing: '0.05em'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            ANALISI MATEMATICA IN TEMPO REALE
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '900', lineHeight: '1.05',
            letterSpacing: '-0.04em', marginBottom: '24px',
            maxWidth: '800px'
          }}>
            Value Betting<br />
            <span style={{
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              basato sui dati.
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem', color: '#94a3b8', lineHeight: '1.7',
            maxWidth: '560px', marginBottom: '40px'
          }}>
            GEM Soccer analizza ogni match con <strong style={{ color: '#f0f4ff' }}>xG, Edge matematico e Patch correttive</strong>. 
            Niente sensazioni. Solo probabilità reali vs quote bookmaker.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '80px' }}>
            <button onClick={() => onNavigate('analyzer')} style={{
              padding: '14px 32px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: '#050810', fontWeight: '800', fontSize: '1rem',
              cursor: 'pointer', letterSpacing: '0.01em'
            }}>
              Analizza Gratis →
            </button>
            <a href="https://t.me/boostami" target="_blank" rel="noreferrer" style={{
              padding: '14px 32px', borderRadius: '8px',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#f0f4ff', fontWeight: '600', fontSize: '1rem',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              📢 Unisciti al canale
            </a>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px', background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.1)', borderRadius: '12px',
            overflow: 'hidden', maxWidth: '600px', marginBottom: '80px'
          }}>
            {[
              { val: '7', label: 'Patch Correttive' },
              { val: '11', label: 'Regole Anti-Errore' },
              { val: '70', label: 'Righe Max/Match' }
            ].map((s, i) => (
              <div key={i} style={{
                padding: '20px', background: 'rgba(5,8,16,0.8)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', letterSpacing: '-0.03em' }}>{s.val}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px', marginBottom: '80px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.2s'
        }}>
          {[
            {
              icon: '📊',
              title: 'Edge Matematico',
              desc: 'Ogni pick mostra Edge = Prob_Calc - Prob_Implicita. Solo Edge ≥+5% viene raccomandato.'
            },
            {
              icon: '🔍',
              title: 'Dati in Tempo Reale',
              desc: 'Google Search grounding — formazioni, arbitri, xG, H2H aggiornati al minuto.'
            },
            {
              icon: '⚡',
              title: '7 Patch Correttive',
              desc: 'Knockout, Fixture Congestion, Rest Days, Travel, Seasonal Phase e CV-Adaptive.'
            },
            {
              icon: '🎯',
              title: 'Dual-Line CV',
              desc: 'Le props volatili hanno due linee: conservativa e standard con taglio adattivo.'
            }
          ].map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(16,185,129,0.1)',
              borderRadius: '12px', padding: '24px',
              transition: 'border-color 0.2s'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '0.95rem' }}>{f.title}</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: '1.6' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA Bottom */}
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: '16px'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Inizia l'analisi gratis
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>
            Nessun account. Nessuna carta. Solo matematica applicata al calcio.
          </p>
          <button onClick={() => onNavigate('analyzer')} style={{
            padding: '16px 40px', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            color: '#050810', fontWeight: '800', fontSize: '1.05rem',
            cursor: 'pointer'
          }}>
            Analizza Ora →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(16,185,129,0.1)',
        padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#475569', fontSize: '0.78rem'
      }}>
        <span>© 2026 Boostami — Consulenza Statistica Calcistica</span>
        <span>Non è consulenza finanziaria. Gioca responsabilmente.</span>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  )
}
