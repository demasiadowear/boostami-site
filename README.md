# Boostami Website + CMS React

Un sito web moderno con CMS integrato costruito con React, Vite e Tailwind CSS.

## 🚀 Caratteristiche

- **CMS Integrato**: Pannello admin completo accessibile via `/admin`
- **Contenuti Dinamici**: Tutti i contenuti sono modificabili tramite interfaccia web
- **LocalStorage**: Salvataggio automatico delle modifiche nel browser
- **Export/Import**: Funzionalità di backup e ripristino tramite file JSON
- **Responsive Design**: Ottimizzato per desktop e mobile
- **SEO Ready**: Meta tag e struttura ottimizzati per i motori di ricerca

## 🛠️ Stack Tecnologico

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM
- **State Management**: Context API
- **Icons**: Lucide React
- **Deploy**: Vercel Ready

## 📁 Struttura Progetto

```
src/
├── components/
│   ├── Home.jsx          # Homepage dinamica
│   ├── AdminPanel.jsx    # Pannello CMS
│   └── Editor.jsx        # Editor contenuti
├── contexts/
│   └── ContentContext.jsx # Gestione stato globale
├── data/
│   └── content.json      # Contenuti di default
└── App.jsx               # App principale con routing
```

## 🌐 Routing

- `/` - Homepage con contenuti dinamici
- `/admin` - Pannello CMS per modificare contenuti

## 💾 Gestione Contenuti

### Salvataggio
- **Automatico**: I contenuti vengono salvati nel LocalStorage del browser
- **Manuale**: Pulsante "Salva" nel pannello admin
- **Stato**: Indicatore visivo delle modifiche non salvate

### Backup e Ripristino
- **Export**: Scarica tutti i contenuti come file JSON
- **Import**: Carica contenuti da file JSON
- **Reset**: Ripristina contenuti ai valori di default

## 🚀 Comandi

### Sviluppo
```bash
npm run dev
```
Avvia il server di sviluppo su http://localhost:5173

### Build
```bash
npm run build
```
Crea la build di produzione nella cartella `dist/`

### Preview
```bash
npm run preview
```
Anteprima della build di produzione

## 📦 Deploy su Vercel

Il progetto è configurato per il deploy automatico su Vercel:

1. **Connetti Repository**: Collega il repository GitHub a Vercel
2. **Configurazione Automatica**: Vercel rileva automaticamente Vite
3. **Deploy**: Ogni push su `main` triggera un deploy automatico
4. **Dominio**: Configura il dominio personalizzato `boostami.online`

### File di Configurazione

- `vercel.json`: Configurazione routing per SPA
- `package.json`: Script di build e dipendenze

## 🎨 Personalizzazione

### Contenuti
Modifica i contenuti tramite il pannello admin (`/admin`) o editando direttamente `src/data/content.json`.

### Styling
Il progetto usa Tailwind CSS con il tema di shadcn/ui. Personalizza i colori e lo stile in `src/App.css`.

### Componenti
Aggiungi nuove sezioni creando componenti in `src/components/` e aggiornando l'editor.

## 🔧 Configurazione CMS

### Aggiungere Nuove Sezioni
1. Aggiorna `content.json` con la nuova struttura dati
2. Aggiungi la sezione al componente `Home.jsx`
3. Crea l'editor corrispondente in `Editor.jsx`
4. Aggiungi la voce al menu in `AdminPanel.jsx`

### Tipi di Campo Supportati
- **Testo**: Input singola riga
- **Textarea**: Testo multiriga
- **Array**: Liste di elementi
- **Oggetti**: Strutture complesse
- **Preview**: Anteprima in tempo reale

## 📱 Responsive Design

Il sito è completamente responsive con:
- Layout fluido per tutte le dimensioni schermo
- Menu mobile ottimizzato
- Componenti adattivi
- Touch-friendly per dispositivi mobili

## 🔒 Sicurezza

- Validazione input lato client
- Sanitizzazione contenuti
- Gestione errori robusta
- Backup automatico delle modifiche

## 📈 Performance

- Lazy loading componenti
- Ottimizzazione bundle Vite
- CSS purging automatico
- Immagini ottimizzate

## 🐛 Troubleshooting

### Contenuti Non Salvati
Se i contenuti non vengono salvati, verifica:
1. LocalStorage abilitato nel browser
2. Spazio disponibile nel LocalStorage
3. Console browser per errori JavaScript

### Routing Non Funziona
Assicurati che:
1. `vercel.json` sia presente nella root
2. React Router sia configurato correttamente
3. Build sia aggiornata

### Problemi di Styling
Verifica:
1. Tailwind CSS sia importato correttamente
2. Classi CSS siano valide
3. Build sia aggiornata

## 📞 Supporto

Per supporto tecnico o personalizzazioni, contatta il team di sviluppo.

---

**Boostami** - Trasforma le tue idee in successo 🚀

