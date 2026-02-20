import { useState } from 'react';
import { Upload, Plus, Copy, Send, ArrowLeft } from 'lucide-react';

export default function Analyzer({ onNavigate }) {
  const [matches, setMatches] = useState([{ home: '', away: '', competition: '', time: '', odds: '' }]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: reader.result })
        });
        const data = await res.json();
        if (data && data.length > 0) setMatches(data);
      } catch (err) { alert("Errore lettura immagine"); }
      setLoading(false);
    };
    reader.readAsDataURL(file);
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

  const copyToClipboard = () => navigator.clipboard.writeText(output);

  return (
    <div class="min-h-screen p-8 max-w-6xl mx-auto font-sans">
      <button onClick={onNavigate} class="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"><ArrowLeft size={20}/> Torna alla Home</button>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div class="bg-gray-900/50 p-6 rounded-xl border border-primary/30">
          <h2 class="text-2xl font-bold mb-4 text-primary">Input Dati</h2>
          
          <label class="block border-2 border-dashed border-gray-600 p-8 rounded-xl text-center cursor-pointer hover:border-primary transition-colors mb-6">
            <input type="file" class="hidden" accept="image/*" onChange={handleFileUpload} />
            <Upload class="mx-auto mb-2 text-gray-400" size={32} />
            <p class="text-gray-300">Trascina uno screenshot o clicca qui</p>
            <p class="text-sm text-gray-500 mt-1">Estrazione automatica via OCR</p>
          </label>

          <div class="space-y-4 mb-6">
            {matches.map((m, i) => (
              <div key={i} class="grid grid-cols-2 gap-2 p-4 bg-black/40 rounded-lg border border-gray-800">
                <input class="bg-transparent border-b border-gray-700 p-1 text-sm outline-none" placeholder="Casa" value={m.home} onChange={e => {const n=[...matches]; n[i].home=e.target.value; setMatches(n)}}/>
                <input class="bg-transparent border-b border-gray-700 p-1 text-sm outline-none" placeholder="Trasferta" value={m.away} onChange={e => {const n=[...matches]; n[i].away=e.target.value; setMatches(n)}}/>
                <input class="bg-transparent border-b border-gray-700 p-1 text-sm outline-none col-span-2" placeholder="Competizione" value={m.competition} onChange={e => {const n=[...matches]; n[i].competition=e.target.value; setMatches(n)}}/>
              </div>
            ))}
          </div>
          
          <button onClick={() => setMatches([...matches, {home:'',away:'',competition:'',time:'',odds:''}])} class="text-accent flex items-center gap-1 mb-6 text-sm font-bold"><Plus size={16}/> Aggiungi Match</button>
          <button onClick={analyze} disabled={loading} class="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Elaborazione Motore GEM...' : 'ANALIZZA ORA'}
          </button>
        </div>

        {/* OUTPUT PANEL */}
        <div class="bg-gray-900/50 p-6 rounded-xl border border-accent/30 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-accent">Output GEM</h2>
            <div class="flex gap-2">
              <button onClick={copyToClipboard} class="p-2 bg-gray-800 rounded hover:bg-gray-700" title="Copia"><Copy size={18}/></button>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(output)}`} target="_blank" rel="noreferrer" class="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40" title="Telegram"><Send size={18}/></a>
            </div>
          </div>
          <div class="flex-1 bg-black/60 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-y-auto whitespace-pre-wrap border border-gray-800 h-[600px]">
            {output || 'L\'analisi formattata apparirà qui...'}
          </div>
        </div>
      </div>
    </div>
  );
}