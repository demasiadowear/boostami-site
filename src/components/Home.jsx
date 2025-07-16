import React, { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';

const Home = () => {
  const { content } = useContent();
  const [typedText, setTypedText] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const text = content.hero.title;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [content.hero.title]);

  // Intersection Observer per stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowStats(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => observer.disconnect();
  }, []);

  const StatCounter = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!showStats) return;

      let startTime;
      const startCount = 0;
      const endCount = parseInt(end);

      const updateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        setCount(Math.floor(startCount + (endCount - startCount) * percentage));
        
        if (percentage < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      requestAnimationFrame(updateCount);
    }, [showStats, end, duration]);

    return <span>{count}{suffix}</span>;
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
        {/* Particles Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white opacity-20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Logo/Brand */}
          <div className="mb-8 animate-bounce">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black leading-none">
              <span className="text-white">BOOST</span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AMI
              </span>
            </h1>
          </div>

          {/* Typewriter Subtitle */}
          <div className="text-lg md:text-2xl lg:text-4xl font-light mb-6 h-12 md:h-16">
            <span className="border-r-2 border-blue-400 pr-1">
              {typedText}
            </span>
            {typedText.length < content.hero.title.length && (
              <span className="animate-ping">🚀</span>
            )}
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-xl lg:text-2xl font-light mb-8 max-w-4xl mx-auto opacity-90 px-4">
            {content.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 px-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl">
              🚀 {content.hero.ctaText}
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300">
              📈 Scopri di più
            </button>
          </div>

          {/* Stats */}
          <div id="stats-section" className="grid grid-cols-3 gap-4 max-w-2xl mx-auto px-4">
            {content.about.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  <StatCounter end={stat.number.replace(/[^\d]/g, '')} suffix={stat.number.replace(/\d/g, '')} />
                </div>
                <div className="text-xs md:text-sm font-medium opacity-80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full opacity-60">
            <div className="w-1 h-3 bg-white rounded-full mx-auto mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-12 md:py-20 bg-gray-900 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6">
              I Nostri{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SUPERPOWERS
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Ogni servizio è progettato per catapultare il tuo business verso il successo
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {content.services.map((service, index) => (
              <div
                key={service.id}
                className={`
                  bg-gradient-to-br from-purple-900/50 to-blue-900/50 
                  backdrop-blur-sm border border-white/10 
                  p-6 md:p-8 rounded-3xl 
                  hover:scale-105 hover:-translate-y-2 
                  transition-all duration-500 ease-out
                  hover:shadow-2xl hover:shadow-purple-500/20
                  ${index === 1 ? 'lg:scale-110 shadow-xl shadow-purple-500/30' : ''}
                `}
              >
                {/* Badge per servizio popolare */}
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                      🔥 PIÙ POPOLARE
                    </span>
                  </div>
                )}

                {/* Service Icon */}
                <div className="text-4xl md:text-6xl mb-6">
                  {index === 0 ? '🧠' : index === 1 ? '🚀' : '💻'}
                </div>

                {/* Service Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {service.title}
                </h3>

                {/* Service Description */}
                <p className="text-gray-300 mb-6 text-base md:text-lg">
                  {service.description}
                </p>

                {/* Price */}
                <div className="text-3xl md:text-4xl font-black text-white mb-4">
                  {service.price}
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm md:text-base">
                      <span className="text-green-400 mr-3 flex-shrink-0">✅</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button 
                  className={`
                    w-full py-3 rounded-full font-bold 
                    transition-all duration-300 transform hover:scale-105
                    ${index === 1 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg' 
                      : 'bg-white text-gray-900'
                    }
                  `}
                >
                  {index === 1 ? '🔥 VOGLIO QUESTO!' : 'SCEGLI QUESTO'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-purple-900 to-blue-900 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 text-white">
                {content.about.title}<br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  I VISIONARI
                </span>
              </h2>
              
              <div className="text-lg md:text-xl text-white mb-6 md:mb-8 leading-relaxed">
                <p className="mb-4">
                  Boostami è un team di <strong>professionisti visionari</strong> che trasforma 
                  le aziende in <span className="text-yellow-300 font-semibold">macchine di successo</span>.
                </p>
                <p>
                  {content.about.content}
                </p>
              </div>

              <button className="px-6 md:px-8 py-3 md:py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:scale-105 transform transition-all duration-300 shadow-lg">
                🚀 Scopri la nostra storia
              </button>
            </div>

            {/* Visual Content */}
            <div className="relative">
              <div className="text-center">
                <div className="text-6xl md:text-9xl opacity-20 animate-pulse">🚀</div>
              </div>
              
              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 md:p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300">
                  <div className="text-2xl md:text-4xl font-black text-yellow-300">2000+</div>
                  <div className="text-xs md:text-sm font-medium text-white">Ore di Consulenza</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 md:p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300">
                  <div className="text-2xl md:text-4xl font-black text-green-300">150M€</div>
                  <div className="text-xs md:text-sm font-medium text-white">Fatturato Generato</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-12 md:py-20 bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6">
              Pronto a{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DOMINARE
              </span>
              <br />il tuo mercato?
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto">
              Non aspettare che la concorrenza ti superi. 
              <strong> Agisci ORA</strong> e trasforma il tuo business in una macchina di successo.
            </p>
            
            <div className="space-y-4 md:space-y-6">
              <button className="w-full sm:w-auto px-8 md:px-16 py-4 md:py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl md:text-2xl hover:scale-105 transform transition-all duration-300 shadow-xl">
                🚀 INIZIA LA TUA TRASFORMAZIONE
              </button>
              <p className="text-xs md:text-sm text-gray-400">
                Consulenza gratuita di 30 minuti • Nessun impegno • Risultati garantiti
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-12 md:py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              {content.contact.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              {content.contact.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-4">📧</div>
              <h3 className="font-semibold text-white mb-2">Email</h3>
              <p className="text-gray-400">{content.contact.email}</p>
            </div>
            
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-4">📞</div>
              <h3 className="font-semibold text-white mb-2">Telefono</h3>
              <p className="text-gray-400">{content.contact.phone}</p>
            </div>
            
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-4">📍</div>
              <h3 className="font-semibold text-white mb-2">Indirizzo</h3>
              <p className="text-gray-400">{content.contact.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 md:py-12 bg-black text-gray-400 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  BOOSTAMI
                </span>
              </h3>
              <p className="text-gray-400 text-sm md:text-base">
                Trasformiamo le tue idee in successo concreto.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contatti</h4>
              <div className="space-y-1 text-sm">
                <p>📧 {content.contact.email}</p>
                <p>📞 {content.contact.phone}</p>
                <p>📍 {content.contact.address}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Seguici</h4>
              <div className="flex space-x-4">
                <span className="hover:scale-110 cursor-pointer transition-transform">📱</span>
                <span className="hover:scale-110 cursor-pointer transition-transform">💼</span>
                <span className="hover:scale-110 cursor-pointer transition-transform">📧</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
            <p className="text-sm">{content.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
