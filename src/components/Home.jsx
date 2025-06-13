import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, TrendingUp, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const Home = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-black text-pink-400">
      {/* Header */}
      <header className="bg-black shadow-sm border-b border-pink-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-500">{content.site?.title || 'Boostami'}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#servizi" className="text-pink-400 hover:text-purple-500 transition-colors duration-200">Servizi</a>
              <a href="#chi-siamo" className="text-pink-400 hover:text-purple-500 transition-colors duration-200">Chi Siamo</a>
              <a href="#contatti" className="text-pink-400 hover:text-purple-500 transition-colors duration-200">Contatti</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <img src="/boostami.png" alt="Boostami Logo" className="mx-auto mb-10 w-64 h-auto" />
          <div className="mb-6">
            <Badge variant="outline" className="text-sm px-4 py-2 text-purple-400 border-purple-400">
              {content.site?.tagline || 'Potenzia il tuo business'}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-pink-400 mb-6 leading-tight">
            {content.hero?.title || 'Trasforma le tue idee in successo'}
          </h1>
          <p className="text-xl md:text-2xl text-purple-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            {content.hero?.subtitle || 'Con Boostami, il tuo business raggiunge nuove vette. Soluzioni innovative, risultati concreti.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4 bg-pink-600 text-white shadow-lg hover:bg-pink-700">
              {content.hero?.ctaText || 'Inizia Ora'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-pink-600 text-pink-400 hover:bg-pink-600 hover:text-white">
              Scopri di più
            </Button>
          </div>
        </div>
      </section>

      {/* Rest of site */}
      {/* Sezioni successive possono essere aggiornate allo stesso modo se vuoi: dimmelo e le modifico tutte */}

    </div>
  );
};

export default Home;

