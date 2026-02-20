import { ArrowRight, BarChart2, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function Home({ onNavigate }) {
  return (
    <div class="min-h-screen flex flex-col items-center pt-20 px-6 font-sans text-center">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Value Betting basato sui <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Dati</span>
        </h1>
        <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Analisi matematica avanzata con xG, calcolo dell'Edge statistico e 7 Patch correttive in tempo reale.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button onClick={onNavigate} class="px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-black font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            Analizza Gratis <ArrowRight size={20} />
          </button>
          <a href="https://t.me/boostami" target="_blank" rel="noreferrer" class="px-8 py-4 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors font-bold text-lg flex items-center justify-center">
            Canale Telegram
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-left mb-20">
          {[
            { icon: <BarChart2 class="text-primary"/>, t: "Edge Matematico", d: "Individua quote errate dai bookmaker." },
            { icon: <Zap class="text-accent"/>, t: "Dati Live", d: "Ricerca Google in tempo reale per le formazioni." },
            { icon: <ShieldCheck class="text-primary"/>, t: "7 Patch", d: "Correzioni per infortuni, fuso orario e fatica." },
            { icon: <Cpu class="text-accent"/>, t: "Dual-Line CV", d: "Linee conservative adattive sulla varianza." }
          ].map((f, i) => (
            <div key={i} class="p-6 rounded-xl bg-gray-900/40 border border-primary/20 backdrop-blur-sm">
              <div class="mb-4">{f.icon}</div>
              <h3 class="font-bold text-lg mb-2">{f.t}</h3>
              <p class="text-sm text-gray-400">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
      <footer class="mt-auto py-8 text-sm text-gray-500 border-t border-gray-800 w-full">
        © 2026 Boostami — Consulenza Statistica Calcistica | Non è consulenza finanziaria
      </footer>
    </div>
  );
}