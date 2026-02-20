import { useState } from 'react';
import { Upload, Plus, Copy, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function Analyzer({ onNavigate }) {
  const [matches, setMatches] = useState([{ home: '', away: '', competition: '', time: '', odds: '' }]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');

  // Configurazione Worker Tesseract con CDN Esterni (Risolve ita.special-words)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setOcrProgress('Inizializzazione OCR...');

    try {
      const worker = await Tesseract.createWorker('ita', 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.5/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.2/tesseract-core.wasm.js',
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(`Lettura OCR: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate(); // Libera memoria immediatamente

      setOcrProgress('Strutturazione dati...');

      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text })
      });

      if (!res.ok) throw new Error('Errore server durante l\'estrazione');

      const data = await res.json();
      if (data && data.length > 0) {
        setMatches(data);
      }
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Errore estrazione: " + err.message);
    } finally {
      setLoading(false);
      setOcrProgress('');
    }
  };

  const analyze = async () => {
    if (matches[0].home === '') return alert("Inserisci almeno una partita");
    
    setLoading(true);
    setOutput(''); // Pulisce l'output precedente
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches })
      });
      
      const data = await res.json();
      if (data.output) {
        setOutput(data.output);
      } else {
        throw new Error(data.details || 'Errore sconosciuto');
      }
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

  const removeMatch = (index) => {
    if (matches.length === 1) {
      setMatches([{ home: '', away: '', competition: '', time: '', odds: '' }]);
    } else {
      setMatches(matches.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert("Analisi copiata!");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto font-sans text-gray-200">
      {/* Header */}
      <button 
        onClick={onNavigate} 
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
      >
        <ArrowLeft size={20}/> Torna alla Home
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLONNA SINISTRA: INPUT */}
        <div className="space-y-6">
          <div className="bg-gray-900/80 p-6 rounded-2xl border border-primary/20 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
              <Plus className="text-primary" /> Input Match
            </h2>
            
            {/* Upload Area */}
            <label className="group block border-2 border-dashed border-gray-700 p-8 rounded-xl text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all mb-6 relative">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
              {loading && ocrProgress ? (
                <div className="flex flex-col items-center justify-center text-primary">
                  <Loader2 className="animate-spin mb-2" size={40} />
                  <p className="font-bold animate-pulse">{ocrProgress}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-500 group-hover:text-primary transition-colors" size={40} />
                  <p className="text-gray-300 font-medium">Carica screenshot quote</p>
                  <p className="text-xs text-gray-500">OCR intelligente (Ita) attivato</p>
                </div>
              )}
            </label>

            {/* List Matches */}
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {matches.map((m, i) => (
                <div key={i} className="group relative grid grid-cols-2 gap-3 p-4 bg-black/40 rounded-xl border border-gray-800 hover:border-gray-600 transition-all">
                  <input 
                    className="bg-transparent border-b border-gray-700 focus:border-primary p-1 text-sm outline-none" 
                    placeholder="Casa" 
                    value={m.home} 
                    onChange={e => updateMatch(i, 'home', e.target.value)}
                  />
                  <input 
                    className="bg-transparent border-b border-gray-700 focus:border-primary p-1 text-sm outline-none" 
                    placeholder="Trasferta" 
                    value={m.away} 
                    onChange={e => updateMatch(i, 'away', e.target.value)}
                  />
                  <input 
                    className="bg-transparent border-b border-gray-700 focus:border-primary p-1 text-sm outline-none col-span-2" 
                    placeholder="Competizione (es. Serie A)" 
                    value={m.competition} 
                    onChange={e => updateMatch(i, 'competition', e.target.value)}
                  />
                  <button 
                    onClick={() => removeMatch(i)}
                    className="absolute -right-2 -top-2 bg-red-500/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <button 
                onClick={() => setMatches([...matches, {home:'',away:'',competition:'',time:'',odds:''}])} 
                className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-all"
              >
                <Plus size={18}/> Aggiungi Match Manuale
              </button>
              
              <button 
                onClick={analyze} 
                disabled={loading} 
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {loading && !ocrProgress ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" /> Elaborazione Dati...
                  </span>
                ) : 'AVVIA ANALISI MATEMATICA'}
              </button>
            </div>
          </div>
        </div>

        {/* COLONNA DESTRA: OUTPUT */}
        <div className="flex flex-col h-full">
          <div className="bg-gray-900/80 p-6 rounded-2xl border border-accent/20 shadow-xl flex flex-col h-full min-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
                <Send size={24} /> Risultato GEM
              </h2>
              <button 
                onClick={copyToClipboard}
                disabled={!output}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-accent disabled:opacity-30 transition-all"
                title="Copia analisi"
              >
                <Copy size={20}/>
              </button>
            </div>

            <div className="flex-1 bg-black/60 rounded-xl p-5 font-mono text-sm leading-relaxed text-gray-300 overflow-y-auto border border-gray-800 custom-scrollbar shadow-inner">
              {output ? (
                output
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                  <Send size={48} className="opacity-10" />
                  <p className="text-center italic">
                    Inserisci i dati o carica uno screenshot per generare l'analisi matematica v5.0
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}