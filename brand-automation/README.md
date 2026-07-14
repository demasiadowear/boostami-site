# Brand → Social Graphics Auto-Generator

Workflow automatizzato: **URL cliente → scraping brand → prompt AI → grafica social con ComfyUI**

## Architettura

```
POST /webhook/generate-social
  { "url": "https://cliente.com" }
        │
        ▼
[Brand Scraper :8000]    ← estrae colori, font, logo, tono
        │
        ▼
[Ollama :11434]          ← genera prompt Stable Diffusion brand-aware
        │
        ▼
[ComfyUI :8188]          ← genera immagine 1024x1024
        │
        ▼
Response JSON con image_url + metadata brand
```

## Prerequisiti

| Servizio | Porta | Note |
|----------|-------|-------|
| n8n | 5678 | `npx n8n` o Docker |
| ComfyUI | 8188 | Con almeno 1 modello SD caricato |
| Ollama | 11434 | `ollama pull llama3` |
| Brand Scraper | 8000 | Setup sotto |

## Setup

### 1. Avvia Brand Scraper
```bash
cd brand-scraper
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```
Oppure esegui `setup.bat` (Windows).

**Test rapido:**
```bash
curl -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://stripe.com\"}"
```

### 2. Importa workflow n8n
1. Apri `http://localhost:5678`
2. Menu → **Import from file**
3. Seleziona `n8n/workflow.json`
4. Attiva il workflow (toggle in alto a destra)

### 3. Configura ComfyUI
Assicurati di avere almeno uno di questi modelli in `ComfyUI/models/checkpoints/`:
- `sd_xl_base_1.0.safetensors` (raccomandato, 6.9GB)
- `v1-5-pruned-emaonly.ckpt` (più veloce, 4GB)

Nel nodo **"Costruisci Workflow ComfyUI"** di n8n, cambia `ckpt_name` con il modello che hai.

### 4. Pullare modello Ollama
```bash
ollama pull llama3
# oppure per migliori risultati:
ollama pull llama3.1:8b
```

## Utilizzo

### Chiamata API
```bash
curl -X POST http://localhost:5678/webhook/generate-social \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://airbnb.com\"}"
```

### Risposta esempio
```json
{
  "success": true,
  "company": "Airbnb",
  "image_url": "http://localhost:8188/view?filename=brand_Airbnb_1710000000.png&subfolder=&type=output",
  "image_filename": "brand_Airbnb_1710000000.png",
  "primary_colors": ["#FF5A5F", "#00A699", "#FC642D"],
  "generated_at": "2026-03-12T10:00:00.000Z"
}
```

## Personalizzazioni

### Cambiare dimensione immagine
Nel nodo **"Costruisci Workflow ComfyUI"**, modifica `EmptyLatentImage`:
- Instagram Post: `1024x1024`
- Instagram Story: `1024x1820`
- Facebook Cover: `1640x856`
- Twitter/X Header: `1500x500`

### Usare un modello Ollama diverso
Nel nodo **"Ollama - Genera Prompt Brand"**, cambia `"model": "llama3"` con:
- `"mistral"` - veloce e preciso
- `"llama3.1:8b"` - migliore qualità
- `"gemma2:9b"` - ottimo per creatività

### Salvare su disco con percorso personalizzato
Aggiungi un nodo **"Write Binary File"** dopo il download immagine:
- Path: `C:/Users/Utente/Desktop/social-output/{{$json.company_name}}/{{$now}}.png`

### Generare più varianti
Duplica i nodi ComfyUI e cambia `seed` per varianti diverse.

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `Connection refused :8000` | Avvia Brand Scraper con `setup.bat` |
| `No module named 'colorthief'` | `pip install colorthief` nel venv |
| ComfyUI timeout | Aumenta timeout nel nodo HTTP a 180000ms |
| `model not found` in ComfyUI | Controlla nome esatto del modello in `/models/checkpoints/` |
| Ollama lento | Usa `llama3:8b` invece di versioni più grandi |
| Immagine non trovata in history | Aumenta il tempo di attesa nel nodo "Attendi 5s" |

## Estensioni Possibili

- **Loop multi-formato**: genera Story + Post + Banner in un run
- **Watermark automatico**: aggiungi logo cliente sull'immagine con Pillow
- **Google Drive/Dropbox**: salva output in cloud con nodi n8n dedicati
- **Slack/Teams notify**: notifica il team quando la grafica è pronta
- **ControlNet**: usa il logo reale come reference image in ComfyUI
