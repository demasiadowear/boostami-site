// 1. NUOVO ContentContext.jsx - Sostituisci completamente il file esistente
import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultContent from '../data/content.json';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent deve essere usato all\'interno di ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Configurazione GitHub - DA CONFIGURARE NELLE ENVIRONMENT VARIABLES
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
  const GITHUB_REPO = 'demasiadowear/boostami-site';
  const GITHUB_BRANCH = 'main';

  // Carica contenuti dal localStorage all'avvio
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem('boostami-content');
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        setContent(parsedContent);
        console.log('Contenuti caricati dal localStorage');
      }
      
      const savedTimestamp = localStorage.getItem('boostami-last-saved');
      if (savedTimestamp) {
        setLastSaved(new Date(savedTimestamp));
      }
    } catch (error) {
      console.error('Errore nel caricamento dei contenuti:', error);
      setContent(defaultContent);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Funzione per aggiornare una sezione specifica
  const updateSection = (sectionName, newData) => {
    setContent(prevContent => ({
      ...prevContent,
      [sectionName]: newData
    }));
  };

  // Funzione per salvare nel localStorage
  const saveContent = () => {
    try {
      localStorage.setItem('boostami-content', JSON.stringify(content));
      const now = new Date();
      localStorage.setItem('boostami-last-saved', now.toISOString());
      setLastSaved(now);
      console.log('Contenuti salvati nel localStorage');
      return { success: true, message: 'Contenuti salvati con successo!' };
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      return { success: false, message: 'Errore nel salvataggio dei contenuti.' };
    }
  };

  // NUOVA FUNZIONE: Pubblica su GitHub e triggera rebuild
  const publishContent = async () => {
    if (!GITHUB_TOKEN) {
      return { 
        success: false, 
        message: 'Token GitHub non configurato. Controlla le variabili d\'ambiente.' 
      };
    }

    setIsPublishing(true);
    
    try {
      // 1. Ottieni il SHA del file corrente
      const fileResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/data/content.json?ref=${GITHUB_BRANCH}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!fileResponse.ok) {
        throw new Error(`Errore nel recupero del file: ${fileResponse.status}`);
      }

      const fileData = await fileResponse.json();
      const currentSha = fileData.sha;

      // 2. Prepara il nuovo contenuto
      const newContent = JSON.stringify(content, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(newContent)));

      // 3. Aggiorna il file su GitHub
      const updateResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/data/content.json`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Aggiornamento contenuti CMS - ${new Date().toISOString()}`,
            content: encodedContent,
            sha: currentSha,
            branch: GITHUB_BRANCH
          })
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Errore nell'aggiornamento: ${updateResponse.status}`);
      }

      // 4. Salva nel localStorage e aggiorna timestamp
      const saveResult = saveContent();
      
      // 5. Triggera rebuild di Vercel (opzionale - Vercel dovrebbe rilevare automaticamente)
      if (import.meta.env.VITE_VERCEL_WEBHOOK) {
        try {
          await fetch(import.meta.env.VITE_VERCEL_WEBHOOK, {
            method: 'POST'
          });
        } catch (webhookError) {
          console.warn('Webhook Vercel non disponibile, ma il deploy avverrà automaticamente');
        }
      }

      return { 
        success: true, 
        message: 'Contenuti pubblicati con successo! Il sito verrà aggiornato in 1-2 minuti.' 
      };

    } catch (error) {
      console.error('Errore nella pubblicazione:', error);
      return { 
        success: false, 
        message: `Errore nella pubblicazione: ${error.message}` 
      };
    } finally {
      setIsPublishing(false);
    }
  };

  // Funzione per esportare i contenuti come JSON
  const exportContent = () => {
    try {
      const dataStr = JSON.stringify(content, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `boostami-content-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      return { success: true, message: 'File JSON esportato con successo!' };
    } catch (error) {
      console.error('Errore nell\'export:', error);
      return { success: false, message: 'Errore nell\'esportazione del file.' };
    }
  };

  // Funzione per importare contenuti da file JSON
  const importContent = (file) => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedContent = JSON.parse(e.target.result);
            
            if (typeof importedContent === 'object' && importedContent !== null) {
              setContent(importedContent);
              localStorage.setItem('boostami-content', JSON.stringify(importedContent));
              const now = new Date();
              localStorage.setItem('boostami-last-saved', now.toISOString());
              setLastSaved(now);
              
              resolve({ success: true, message: 'Contenuti importati e salvati con successo!' });
            } else {
              resolve({ success: false, message: 'File JSON non valido.' });
            }
          } catch (parseError) {
            console.error('Errore nel parsing del JSON:', parseError);
            resolve({ success: false, message: 'Errore nel parsing del file JSON.' });
          }
        };
        
        reader.onerror = () => {
          resolve({ success: false, message: 'Errore nella lettura del file.' });
        };
        
        reader.readAsText(file);
      } catch (error) {
        console.error('Errore nell\'import:', error);
        resolve({ success: false, message: 'Errore nell\'importazione del file.' });
      }
    });
  };

  // Funzione per resettare ai contenuti di default
  const resetContent = () => {
    try {
      setContent(defaultContent);
      localStorage.removeItem('boostami-content');
      localStorage.removeItem('boostami-last-saved');
      setLastSaved(null);
      console.log('Contenuti resettati ai valori di default');
      return { success: true, message: 'Contenuti resettati ai valori di default!' };
    } catch (error) {
      console.error('Errore nel reset:', error);
      return { success: false, message: 'Errore nel reset dei contenuti.' };
    }
  };

  // Funzione per ottenere lo stato di salvataggio
  const getSaveStatus = () => {
    const savedContent = localStorage.getItem('boostami-content');
    const currentContent = JSON.stringify(content);
    const hasUnsavedChanges = savedContent !== currentContent;
    
    return {
      hasUnsavedChanges,
      lastSaved,
      isAutoSaved: !hasUnsavedChanges
    };
  };

  const value = {
    content,
    setContent,
    updateSection,
    saveContent,
    publishContent, // NUOVA FUNZIONE
    exportContent,
    importContent,
    resetContent,
    getSaveStatus,
    isLoading,
    isPublishing, // NUOVO STATO
    lastSaved
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento contenuti...</p>
        </div>
      </div>
    );
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

