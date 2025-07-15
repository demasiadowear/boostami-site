import PublishButton from './PublishButton';
*/import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Settings, FileText, Image, DollarSign, Users, Save, Download, Upload, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import Editor from './Editor';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [notification, setNotification] = useState(null);
  const { content, updateSection, saveContent, exportContent, importContent, resetContent, getSaveStatus } = useContent();

  const sections = [
    { id: 'site', label: 'Impostazioni Sito', icon: Settings },
    { id: 'hero', label: 'Hero Section', icon: FileText },
    { id: 'services', label: 'Servizi', icon: Settings },
    { id: 'about', label: 'Chi Siamo', icon: Users },
    { id: 'contact', label: 'Contatti', icon: FileText },
    { id: 'footer', label: 'Footer', icon: FileText }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    const result = saveContent();
    showNotification(result.message, result.success ? 'success' : 'error');
  };

  const handleExport = () => {
    const result = exportContent();
    showNotification(result.message, result.success ? 'success' : 'error');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const result = await importContent(file);
        showNotification(result.message, result.success ? 'success' : 'error');
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (window.confirm('Sei sicuro di voler resettare tutti i contenuti ai valori di default? Questa azione non può essere annullata.')) {
      const result = resetContent();
      showNotification(result.message, result.success ? 'success' : 'error');
    }
  };

  const saveStatus = getSaveStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <Alert className={`${notification.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {notification.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header Admin */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Torna al sito
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Pannello Admin - Boostami</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salva
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sezioni del Sito</CardTitle>
                <CardDescription>Seleziona una sezione da modificare</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          activeSection === section.id ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Stato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ultima modifica:</span>
                    <Badge variant="secondary">
                      {saveStatus.lastSaved ? saveStatus.lastSaved.toLocaleTimeString() : 'Mai'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stato:</span>
                    <Badge variant={saveStatus.hasUnsavedChanges ? "destructive" : "outline"} 
                           className={saveStatus.hasUnsavedChanges ? "text-orange-600" : "text-green-600"}>
                      {saveStatus.hasUnsavedChanges ? 'Modifiche non salvate' : 'Salvato'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Modifica: {sections.find(s => s.id === activeSection)?.label}
                </CardTitle>
                <CardDescription>
                  Modifica i contenuti di questa sezione. Le modifiche saranno visibili in tempo reale.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Editor 
                  section={activeSection} 
                  data={content[activeSection]} 
                  onUpdate={(newData) => updateSection(activeSection, newData)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

