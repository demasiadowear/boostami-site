import { useState } from 'react';
import { Upload, Plus, Copy, Send, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function Analyzer({ onNavigate }) {
  const [matches, setMatches] = useState([{ home: '', away: '', competition: '', time: '', odds: '' }]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');

  // Gestione OCR con CDN ultra-stabili per evitare errori di caricamento scripts
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setOcrProgress('Inizializzazione OCR...');

    try {
        // Tesseract.js v5: logger va passato a createWorker, non a recognize()
        // worker.load() è stato rimosso in v5 - createWorker già inizializza tutto
        const worker = await Tesseract.createWorker('ita', 1, {
          workerPath: 'https://unpkg.com/tesseract.js@v5.0.5/dist/worker.min.js',
          langPath: 'https://tessdata.projectnaptha.com/4.0.0',
          corePath: 'https://unpkg.com/tesseract.js-core@v5.0.2/tesseract-core.wasm.js',
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(`Lettura OCR: ${Math.round(m.progress * 100)}%`);
            }
          }
        });

        // convert File to blob URL to avoid `x.map is not a function` inside worker
        const imgUrl = URL.createObjectURL(file);

        setOcrProgress('Lettura OCR...');
        const { data: { text } } = await worker.recognize(imgUrl);
        URL.revokeObjectURL(imgUrl);

        await worker.terminate();

      setOcrProgress('Strutturazione dati...');

      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text })
      });

      if (!res.ok) throw new Error('Errore server estrazione');

      const data = await res.json();
      if (data && data.length > 0) {
        setMatches(data);
      }
    } catch (err) {
      console.error("Errore:", err);
      alert("Errore estrazione: " + (err?.message || String(err) || 'Errore sconosciuto'));
    } finally {
      setLoading(false);
      setOcrProgress('');
    }
  };

  const analyze = async () => {
    if (!matches[0].home) return alert("Inserisci almeno un match");
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches })
      });
      const data = await res.json();
      if (data.output) setOutput(data.output);
      else throw new Error(data.details || 'Errore analisi');
    } catch (err) {
      alert("Errore analisi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMatch = (index, field, value) => {
    const newMatches = [...matches];
    newMatches[index][field] = value;
    setMatches(newMatches);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto font-sans text-white">
      <button onClick={onNavigate} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20}/> Torna alla Home
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PANEL INPUT */}
        <div className="bg-gray-900/80 p-6 rounded-2xl border border-blue-500/20 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
            <Plus size={24} /> Input Match
          </h2>
          
          <label className="group block border-2 border-dashed border-gray-700 p-8 rounded-xl text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all mb-6 relative">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
            {loading && ocrProgress ? (
              <div className="flex flex-col items-center justify-center text-blue-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="font-bold">{ocrProgress}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto text-gray-500 group-hover:text-blue-400 transition-colors" size={32} />
                <p className="text-gray-300 font-medium">Carica screenshot quote</p>
                <p className="text-xs text-gray-500 italic">OCR Locale - Supporta ogni peso</p>
              </div>
            )}
          </label>

          <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {matches.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 p-3 bg-black/40 rounded-lg border border-gray-800 relative group">
                <input className="bg-transparent border-b border-gray-700 p-1 text-sm outline-none focus:border-blue-500" placeholder="Casa" value={m.home} onChange={e => updateMatch(i, 'home', e.target.value)}/>
                <input className="bg-transparent border-b border-gray-700 p-1 text-sm outline-none focus:border-blue-500" placeholder="Trasferta" value={m.away} onChange={e => updateMatch(i, 'away', e.target.value)}/>
                <input className="bg-transparent border-b border-gray-700 p-1 text-sm outline-none col-span-2 focus:border-blue-500" placeholder="Competizione" value={m.competition} onChange={e => updateMatch(i, 'competition', e.target.value)}/>
                {matches.length > 1 && (
                  <button onClick={() => setMatches(matches.filter((_, idx) => idx !== i))} className="absolute -right-1 -top-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button onClick={() => setMatches([...matches, {home:'',away:'',competition:'',time:'',odds:''}])} className="text-blue-400 flex items-center gap-1 mb-6 text-sm font-bold hover:underline">
            <Plus size={16}/> Aggiungi Match
          </button>
          
          <button onClick={analyze} disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">
            {loading && !ocrProgress ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Elaborazione GEM...</span>
            ) : 'ANALIZZA ORA'}
          </button>
        </div>

        {/* PANEL OUTPUT */}
        <div className="bg-gray-900/80 p-6 rounded-2xl border border-cyan-500/20 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <Send size={24} /> Risultato GEM
            </h2>
            <button onClick={() => {navigator.clipboard.writeText(output); alert("Copiato!")}} className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors" title="Copia analisi">
              <Copy size={18}/>
            </button>
          </div>
          <div className="flex-1 bg-black/60 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-y-auto whitespace-pre-wrap border border-gray-800 shadow-inner">
            {output || 'L\'analisi dettagliata apparirà qui dopo aver cliccato "Analizza Ora"...'}
          </div>
        </div>
      </div>
    </div>
  );
}