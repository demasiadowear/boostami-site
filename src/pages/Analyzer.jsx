import { useState } from 'react';
import { Upload, Plus, Copy, Send, ArrowLeft, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function Analyzer({ onNavigate }) {
  const [matches, setMatches] = useState([{ home: '', away: '', competition: '', time: '', odds: '' }]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setOcrProgress('Lettura immagine in corso (OCR locale)...');

    try {
      // 1. Estrazione testo locale (Bypassa i limiti di Vercel!)
      const { data: { text } } = await Tesseract.recognize(file, 'ita', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(`Lettura OCR: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      setOcrProgress('Strutturazione dati con IA...');

      // 2. Invia solo il testo leggero al backend
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text })
      });
      
      const data = await res.json();
      if (data && data.length > 0) setMatches(data);
      
    } catch (err) { 
      alert("Errore durante l'estrazione: " + err.message); 
    } finally {
      setLoading(false);
      setOcrProgress('');
    }
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches })
      });
      const data = await res.json();
      if (data.output) setOutput(data.output);
    } catch (err) { alert("Errore durante l'analisi"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto font-sans">
      <button onClick={onNavigate} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"><ArrowLeft size={20}/> Torna alla Home</button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-gray-900/50 p-6 rounded-xl border border-primary/30">
          <h2 className="text-2xl font-bold mb-4 text-primary">Input Dati</h2>
          
          <label className="block border-2 border-dashed border-gray-600 p-8 rounded-xl text-center cursor-pointer hover:border-primary transition-colors mb-6 relative">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
            {loading && ocrProgress ? (
              <div className="flex flex-col items-center justify-center text-accent">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="font-bold">{ocrProgress}</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-300">Trascina uno screenshot o clicca qui</p>
                <p className="text-sm text-gray-500 mt-1">OCR Locale Attivo (Nessun limite di peso)</p>
              </>
            )}
          </label>

          <div className="space-y-4 mb-6">
            {matches.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 p-4 bg-black/40 rounded-lg border border-gray-800">
                <input className="bg-transparent border-b border-gray-700 p-1 text-sm outline-none" placeholder="Casa" value={m.home} onChange={e => {const n=[...matches]; n[i].home=e.target.value; setMatches(n)}}/>
                <input className="bg-transparent border-b border-gray-700 p-1 text-sm outline-none" placeholder="Trasferta" value={m.away} onChange={e => {const n=[...matches]; n[i].away=e.target.value; setMatches(n)}}/>
                <input className="bg-transparent border-b border-gray-700 p-1 text-sm outline-none col-span-2" placeholder="Competizione" value={m.competition} onChange={e => {const n=[...matches]; n[i].competition=e.target.value; setMatches(n)}}/>
              </div>
            ))}
          </div>
          
          <button onClick={() => setMatches([...matches, {home:'',away:'',competition:'',time:'',odds:''}])} className="text-accent flex items-center gap-1 mb-6 text-sm font-bold"><Plus size={16}/> Aggiungi Match</button>
          <button onClick={analyze} disabled={loading} className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading && !ocrProgress ? 'Elaborazione Motore GEM...' : 'ANALIZZA ORA'}
          </button>
        </div>

        {/* OUTPUT PANEL */}
        <div className="bg-gray-900/50 p-6 rounded-xl border border-accent/30 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-accent">Output GEM</h2>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(output)} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><Copy size={18}/></button>
            </div>
          </div>
          <div className="flex-1 bg-black/60 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-y-auto whitespace-pre-wrap border border-gray-800 h-[600px]">
            {output || 'L\'analisi formattata apparirà qui...'}
          </div>
        </div>
      </div>
    </div>
  );
}