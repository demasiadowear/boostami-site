import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, TrendingUp, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

const Home = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">{content.site?.title || 'Boostami'}</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#servizi" className="text-gray-600 hover:text-primary transition-colors duration-200">Servizi</a>
              <a href="#chi-siamo" className="text-gray-600 hover:text-primary transition-colors duration-200">Chi Siamo</a>
              <a href="#contatti" className="text-gray-600 hover:text-primary transition-colors duration-200">Contatti</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
<section className="bg-black py-20 lg:py-32 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 via-pink-500/10 to-violet-600/10"></div>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="flex flex-col items-center text-center">
      <img
        src="/images/boostami.svg"
        alt="Boostami Logo"
        className="h-64 w-auto mb-8"
      />
      <h1 className="text-4xl md:text-6xl font-bold text-fuchsia-500 mb-4">
        {content.hero?.title || 'Trasforma le tue idee in successo'}
      </h1>
      <p className="text-xl md:text-2xl text-pink-200 mb-8 max-w-4xl">
        {content.hero?.subtitle || 'Con Boostami, il tuo business raggiunge nuove vette. Soluzioni innovative, risultati concreti.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="text-lg px-8 py-4 bg-fuchsia-600 text-white shadow-lg hover:bg-fuchsia-700">
          {content.hero?.ctaText || 'Inizia Ora'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10">
          Scopri di più
        </Button>
      </div>
    </div>
  </div>
</section>


      {/* Services Section */}
      <section id="servizi" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">I Nostri Servizi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluzioni su misura per far crescere il tuo business con strategie innovative e risultati misurabili
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.services?.map((service, index) => (
              <Card key={service.id || index} className="relative hover:shadow-2xl transition-all duration-300 group border-0 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                      {service.price}
                    </Badge>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button className="w-full group-hover:bg-primary/90 transition-colors duration-300">
                    Scopri di più
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="chi-siamo" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.about?.title || 'Chi Siamo'}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {content.about?.content || 'Boostami è un team di professionisti appassionati che aiuta le aziende a crescere attraverso soluzioni innovative e strategie personalizzate.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {content.about?.stats?.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-lg text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contatti" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.contact?.title || 'Contattaci'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.contact?.subtitle || 'Pronto a far crescere il tuo business? Contattaci per una consulenza gratuita.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600">{content.contact?.email || 'info@boostami.online'}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8">
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Telefono</h3>
                <p className="text-gray-600">{content.contact?.phone || '+39 123 456 7890'}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Indirizzo</h3>
                <p className="text-gray-600">{content.contact?.address || 'Via Roma 123, 20121 Milano, Italia'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{content.site?.title || 'Boostami'}</h3>
            <p className="text-gray-400 mb-8">{content.site?.tagline || 'Trasforma le tue idee in successo'}</p>
            
            {content.footer?.links && content.footer.links.length > 0 && (
              <div className="flex justify-center space-x-8 mb-8">
                {content.footer.links.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            )}
            
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400">
                {content.footer?.copyright || '© 2024 Boostami. Tutti i diritti riservati.'}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

