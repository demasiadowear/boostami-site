import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const Editor = ({ section, data, onUpdate }) => {
  const [formData, setFormData] = useState(data || {});
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleNestedInputChange = (parentField, field, value) => {
    const newData = { 
      ...formData, 
      [parentField]: { 
        ...formData[parentField], 
        [field]: value 
      } 
    };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleArrayItemChange = (index, field, value) => {
    const newArray = [...(formData || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData(newArray);
    onUpdate(newArray);
  };

  const handleArrayItemNestedChange = (index, parentField, field, value) => {
    const newArray = [...(formData || [])];
    newArray[index] = { 
      ...newArray[index], 
      [parentField]: { 
        ...newArray[index][parentField], 
        [field]: value 
      } 
    };
    setFormData(newArray);
    onUpdate(newArray);
  };

  const addArrayItem = () => {
    let newItem;
    switch (section) {
      case 'services':
        newItem = { 
          id: Date.now().toString(), 
          title: '', 
          description: '', 
          price: '', 
          features: [] 
        };
        break;
      case 'about':
        if (Array.isArray(formData)) {
          newItem = { number: '', label: '' };
        }
        break;
      default:
        newItem = { text: '', url: '' };
    }
    
    const newArray = Array.isArray(formData) ? [...formData, newItem] : [newItem];
    setFormData(newArray);
    onUpdate(newArray);
  };

  const removeArrayItem = (index) => {
    const newArray = formData.filter((_, i) => i !== index);
    setFormData(newArray);
    onUpdate(newArray);
  };

  const addFeature = (serviceIndex) => {
    const newArray = [...formData];
    if (!newArray[serviceIndex].features) {
      newArray[serviceIndex].features = [];
    }
    newArray[serviceIndex].features.push('');
    setFormData(newArray);
    onUpdate(newArray);
  };

  const updateFeature = (serviceIndex, featureIndex, value) => {
    const newArray = [...formData];
    newArray[serviceIndex].features[featureIndex] = value;
    setFormData(newArray);
    onUpdate(newArray);
  };

  const removeFeature = (serviceIndex, featureIndex) => {
    const newArray = [...formData];
    newArray[serviceIndex].features.splice(featureIndex, 1);
    setFormData(newArray);
    onUpdate(newArray);
  };

  // Site Settings Editor
  if (section === 'site') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Impostazioni Generali del Sito</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="site-title">Titolo del Sito</Label>
            <Input
              id="site-title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nome del sito..."
            />
          </div>
          
          <div>
            <Label htmlFor="site-tagline">Tagline</Label>
            <Input
              id="site-tagline"
              value={formData.tagline || ''}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              placeholder="Slogan del sito..."
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="site-description">Descrizione</Label>
          <Textarea
            id="site-description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descrizione del sito..."
            rows={3}
          />
        </div>
      </div>
    );
  }

  // Hero Section Editor
  if (section === 'hero') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sezione Hero</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Nascondi' : 'Mostra'} Preview
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="hero-title">Titolo Principale</Label>
              <Textarea
                id="hero-title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Inserisci il titolo principale..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="hero-subtitle">Sottotitolo</Label>
              <Textarea
                id="hero-subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="Inserisci il sottotitolo..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="hero-cta">Testo Call-to-Action</Label>
              <Input
                id="hero-cta"
                value={formData.ctaText || ''}
                onChange={(e) => handleInputChange('ctaText', e.target.value)}
                placeholder="Es: Inizia Ora, Scopri di più..."
              />
            </div>

            <div>
              <Label htmlFor="hero-cta-link">Link Call-to-Action</Label>
              <Input
                id="hero-cta-link"
                value={formData.ctaLink || ''}
                onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                placeholder="Es: #contatti, /servizi..."
              />
            </div>
          </div>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Anteprima della sezione Hero</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {formData.title || 'Titolo principale'}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {formData.subtitle || 'Sottotitolo descrittivo'}
                  </p>
                  <Button size="sm">
                    {formData.ctaText || 'Call to Action'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Services Editor
  if (section === 'services') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Gestione Servizi</h3>
          <Button onClick={addArrayItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Servizio
          </Button>
        </div>

        <div className="space-y-4">
          {Array.isArray(formData) && formData.map((service, index) => (
            <Card key={service.id || index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Servizio {index + 1}</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeArrayItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Titolo Servizio</Label>
                    <Input
                      value={service.title || ''}
                      onChange={(e) => handleArrayItemChange(index, 'title', e.target.value)}
                      placeholder="Nome del servizio..."
                    />
                  </div>
                  <div>
                    <Label>Prezzo</Label>
                    <Input
                      value={service.price || ''}
                      onChange={(e) => handleArrayItemChange(index, 'price', e.target.value)}
                      placeholder="Es: €299, Gratis, Su richiesta..."
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Descrizione</Label>
                  <Textarea
                    value={service.description || ''}
                    onChange={(e) => handleArrayItemChange(index, 'description', e.target.value)}
                    placeholder="Descrizione del servizio..."
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Caratteristiche</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addFeature(index)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Aggiungi
                    </Button>
                  </div>
                  {service.features && service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex gap-2 mb-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, featureIndex, e.target.value)}
                        placeholder="Caratteristica del servizio..."
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeFeature(index, featureIndex)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!Array.isArray(formData) || formData.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p>Nessun servizio configurato. Clicca "Aggiungi Servizio" per iniziare.</p>
          </div>
        )}
      </div>
    );
  }

  // About Section Editor
  if (section === 'about') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Sezione Chi Siamo</h3>
        
        <div>
          <Label htmlFor="about-title">Titolo Sezione</Label>
          <Input
            id="about-title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Titolo della sezione..."
          />
        </div>
        
        <div>
          <Label htmlFor="about-content">Contenuto</Label>
          <Textarea
            id="about-content"
            value={formData.content || ''}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Descrizione dell'azienda..."
            rows={4}
          />
        </div>

        <Separator />

        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-base font-semibold">Statistiche</Label>
            <Button onClick={addArrayItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Statistica
            </Button>
          </div>
          
          {formData.stats && formData.stats.map((stat, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium">Statistica {index + 1}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeArrayItem(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Numero</Label>
                    <Input
                      value={stat.number || ''}
                      onChange={(e) => handleArrayItemChange(index, 'number', e.target.value)}
                      placeholder="Es: 150+, 98%..."
                    />
                  </div>
                  <div>
                    <Label>Etichetta</Label>
                    <Input
                      value={stat.label || ''}
                      onChange={(e) => handleArrayItemChange(index, 'label', e.target.value)}
                      placeholder="Es: Progetti Completati..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Contact Section Editor
  if (section === 'contact') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Sezione Contatti</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contact-title">Titolo Sezione</Label>
            <Input
              id="contact-title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Titolo della sezione..."
            />
          </div>
          
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="info@esempio.com"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="contact-subtitle">Sottotitolo</Label>
          <Textarea
            id="contact-subtitle"
            value={formData.subtitle || ''}
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
            placeholder="Descrizione della sezione contatti..."
            rows={2}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contact-phone">Telefono</Label>
            <Input
              id="contact-phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+39 123 456 7890"
            />
          </div>
          
          <div>
            <Label htmlFor="contact-address">Indirizzo</Label>
            <Input
              id="contact-address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Via Roma 123, Milano..."
            />
          </div>
        </div>
      </div>
    );
  }

  // Footer Editor
  if (section === 'footer') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Footer</h3>
        
        <div>
          <Label htmlFor="footer-copyright">Copyright</Label>
          <Input
            id="footer-copyright"
            value={formData.copyright || ''}
            onChange={(e) => handleInputChange('copyright', e.target.value)}
            placeholder="© 2024 Nome Azienda. Tutti i diritti riservati."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-base font-semibold">Link Footer</Label>
            <Button onClick={addArrayItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Link
            </Button>
          </div>
          
          {formData.links && formData.links.map((link, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium">Link {index + 1}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeArrayItem(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Testo</Label>
                    <Input
                      value={link.text || ''}
                      onChange={(e) => handleArrayItemChange(index, 'text', e.target.value)}
                      placeholder="Nome del link..."
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={link.url || ''}
                      onChange={(e) => handleArrayItemChange(index, 'url', e.target.value)}
                      placeholder="/privacy, /terms..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-gray-500">
      <p>Editor per la sezione "{section}" non ancora implementato.</p>
    </div>
  );
};

export default Editor;

