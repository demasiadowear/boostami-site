// 2. COMPONENTE PublishButton.jsx - Crea nuovo file in /components/ui/
import React, { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';

const PublishButton = () => {
  const { publishContent, isPublishing, getSaveStatus } = useContent();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  const handlePublish = async () => {
    setMessage('');
    setMessageType('');

    const result = await publishContent();
    
    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');

    // Nascondi il messaggio dopo 5 secondi
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const { hasUnsavedChanges } = getSaveStatus();

  return (
    <div className="space-y-4">
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className={`
          w-full px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isPublishing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
          }
          text-white shadow-lg
        `}
      >
        {isPublishing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Pubblicando...</span>
          </div>
        ) : (
          '🚀 Pubblica Sul Sito'
        )}
      </button>

      {hasUnsavedChanges && (
        <div className="text-amber-600 text-sm font-medium text-center">
          ⚠️ Hai modifiche non salvate localmente
        </div>
      )}

      {message && (
        <div className={`
          p-3 rounded-lg text-sm font-medium text-center
          ${messageType === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
          }
        `}>
          {message}
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Questo aggiornerà il sito live in 1-2 minuti
      </div>
    </div>
  );
};

export default PublishButton;
