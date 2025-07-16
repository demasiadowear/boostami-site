import React, { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';

const Home = () => {
  const { content } = useContent();
  const [typedText, setTypedText] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Stili inline per effetti speciali
  const heroStyle = {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 30%, #be185d 70%, #1e40af 100%)',
    position: 'relative',
    overflow: 'hidden'
  };

  const particleStyle = (delay, duration) => ({
    animation: `pulse ${duration}s infinite ${delay}s`
  });

  const glowButtonStyle = {
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
    boxShadow: '0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease'
  };

  const cardStyle = {
    background: 'rgba(15, 15, 35, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(236, 72, 153, 0.3)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  };

  const gradientTextStyle = {
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

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

  // CSS per animazioni
  const cssAnimations = `
    <style>
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      @keyframes glowPulse {
        0%, 100% { 
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.5),
                      0 0 40px rgba(139, 92, 246, 0.3),
                      0 0 60px rgba(59, 130, 246, 0.2);
        }
        50% { 
          box-shadow: 0 0 30px rgba(236, 72, 153, 0.8),
                      0 0 60px rgba(139, 92, 246, 0.6),
                      0 0 90px rgba(59, 130, 246, 0.4);
        }
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      .hero-floating {
        animation: float 6s ease-in-out infinite;
      }
      
      .glow-pulse {
        animation: glowPulse 3s ease-in-out infinite;
      }
      
      .card-hover:hover {
        transform: translateY(-20px) scale(1.02) !important;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(236, 72, 153, 0.4) !important;
      }
      
      .btn-hover:hover {
        transform: translateY(-2px) scale(1.05) !important;
        box-shadow: 0 20px 40px rgba(236, 72, 153, 0.4) !important;
      }
      
      .text-glow {
        text-shadow: 0 0 20px rgba(236, 72, 153, 0.6);
      }
      
      .border-glow:hover {
        border-color: rgba(236, 72, 153, 0.6) !important;
        box-shadow: 0 0 20px rgba(236, 72, 153, 0.3) !important;
      }
    </style>
  `;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: cssAnimations }} />
      <div className="bg-gray-900 text-white min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={heroStyle}>
          {/* Particles Background con glow */}
          <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  background: `rgba(236, 72, 153, ${0.3 + Math.random() * 0.7})`,
                  boxShadow: `0 0 10px rgba(236, 72, 153, 0.8)`,
                  ...particleStyle(Math.random() * 3, 3 + Math.random() * 4)
                }}
              />
            ))}
          </div>

          {/* Overlay gradient */}
          <div 
            className="absolute inset-0" 
            style={{
              background: 'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              zIndex: 2
            }}
          />

          <div className="container mx-auto px-4 text-center relative" style={{ zIndex: 10 }}>
            {/* Logo/Brand con float */}
            <div className="mb-8 hero-floating">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black leading-none text-glow">
                <span className="text-white">BOOST</span>
                <span style={gradientTextStyle}>AMI</span>
              </h1>
            </div>

            {/* Typewriter Subtitle */}
            <div className="text-lg md:text-2xl lg:text-4xl font-light mb-6 h-12 md:h-16">
              <span 
                className="pr-1" 
                style={{ 
                  borderRight: '3px solid #ec4899',
                  animation: 'blink-caret 1s step-end infinite'
                }}
              >
                {typedText}
              </span>
              {typedText.length < content.hero.title.length && (
                <span className="animate-ping text-2xl">🚀</span>
              )}
            </div>

            {/* Subtitle */}
            <p className="text-base md:text-xl lg:text-2xl font-light mb-8 max-w-4xl mx-auto opacity-90 px-4">
              {content.hero.subtitle}
            </p>

            {/* CTA Buttons con effetti */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 px-4">
              <button 
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 btn-hover glow-pulse"
                style={glowButtonStyle}
              >
                🚀 {content.hero.ctaText}
              </button>
              <button 
                className="w-full sm:w-auto px-8 py-4 bg-transparent rounded-full font-semibold text-lg transition-all duration-300 btn-hover border-glow"
                style={{
                  border: '2px solid rgba(236, 72, 153, 0.5)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                📈 Scopri di più
              </button>
            </div>

            {/* Stats con gradient */}
            <div id="stats-section" className="grid grid-cols-3 gap-4 max-w-2xl mx-auto px-4">
              {content.about.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="text-2xl md:text-4xl font-black"
                    style={gradientTextStyle}
                  >
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
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 text-glow">
                I Nostri{' '}
                <span style={gradientTextStyle}>SUPERPOWERS</span>
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
                  className={`card-hover p-6 md:p-8 rounded-3xl transition-all duration-500 ease-out relative ${
                    index === 1 ? 'lg:scale-110' : ''
                  }`}
                  style={{
                    ...cardStyle,
                    ...(index === 1 ? {
                      boxShadow: '0 25px 50px rgba(236, 72, 153, 0.4), 0 0 0 1px rgba(236, 72, 153, 0.3)',
                      border: '1px solid rgba(236, 72, 153, 0.5)'
                    } : {})
                  }}
                >
                  {/* Badge per servizio popolare */}
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span 
                        className="px-4 py-2 rounded-full text-sm font-bold text-black glow-pulse"
                        style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)'
                        }}
                      >
                        🔥 PIÙ POPOLARE
                      </span>
                    </div>
                  )}

                  {/* Service Icon */}
                  <div className="text-4xl md:text-6xl mb-6">
                    {index === 0 ? '🧠' : index === 1 ? '🚀' : '💻'}
                  </div>

                  {/* Service Title */}
                  <h3 
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={gradientTextStyle}
                  >
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className="text-gray-300 mb-6 text-base md:text-lg">
                    {service.description}
                  </p>

                  {/* Price */}
                  <div className="text-3xl md:text-4xl font-black text-white mb-4 text-glow">
                    {service.price}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm md:text-base">
                        <span className="mr-3 flex-shrink-0" style={{ color: '#10b981', textShadow: '0 0 10px #10b981' }}>✅</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button 
                    className={`w-full py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 btn-hover`}
                    style={index === 1 
                      ? {
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          color: '#000',
                          boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)'
                        }
                      : {
                          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
                          color: '#fff'
                        }
                    }
                  >
                    {index === 1 ? '🔥 VOGLIO QUESTO!' : 'SCEGLI QUESTO'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section 
          className="py-12 md:py-20 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #581c87 0%, #1e40af 100%)'
          }}
        >
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* Text Content */}
              <div>
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 text-white">
                  {content.about.title}<br />
                  <span style={gradientTextStyle}>I VISIONARI</span>
                </h2>
                
                <div className="text-lg md:text-xl text-white mb-6 md:mb-8 leading-relaxed">
                  <p className="mb-4">
                    Boostami è un team di <strong>professionisti visionari</strong> che trasforma 
                    le aziende in <span style={{ color: '#ec4899', fontWeight: '600', textShadow: '0 0 10px #ec4899' }}>macchine di successo</span>.
                  </p>
                  <p>
                    {content.about.content}
                  </p>
                </div>

                <button 
                  className="px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-lg transition-all duration-300 transform btn-hover"
                  style={glowButtonStyle}
                >
                  🚀 Scopri la nostra storia
                </button>
              </div>

              {/* Visual Content */}
              <div className="relative">
                <div className="text-center hero-floating">
                  <div className="text-6xl md:text-9xl opacity-20">🚀</div>
                </div>
                
                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 mt-8">
                  <div 
                    className="p-4 md:p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div className="text-2xl md:text-4xl font-black" style={{ color: '#fbbf24', textShadow: '0 0 15px #fbbf24' }}>2000+</div>
                    <div className="text-xs md:text-sm font-medium text-white">Ore di Consulenza</div>
                  </div>
                  <div 
                    className="p-4 md:p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div className="text-2xl md:text-4xl font-black" style={{ color: '#10b981', textShadow: '0 0 15px #10b981' }}>150M€</div>
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
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 text-glow">
                Pronto a{' '}
                <span style={gradientTextStyle}>DOMINARE</span>
                <br />il tuo mercato?
              </h2>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto">
                Non aspettare che la concorrenza ti superi. 
                <strong> Agisci ORA</strong> e trasforma il tuo business in una macchina di successo.
              </p>
              
              <div className="space-y-4 md:space-y-6">
                <button 
                  className="w-full sm:w-auto px-8 md:px-16 py-4 md:py-6 rounded-full font-bold text-xl md:text-2xl transition-all duration-300 transform btn-hover glow-pulse"
                  style={{
                    ...glowButtonStyle,
                    fontSize: 'clamp(1.2rem, 4vw, 2rem)'
                  }}
                >
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
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-white text-glow">
                {content.contact.title}
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                {content.contact.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              {[
                { icon: '📧', label: 'Email', value: content.contact.email },
                { icon: '📞', label: 'Telefono', value: content.contact.phone },
                { icon: '📍', label: 'Indirizzo', value: content.contact.address }
              ].map((contact, index) => (
                <div 
                  key={index}
                  className="text-center p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 border-glow"
                  style={{
                    background: 'rgba(31, 41, 55, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(236, 72, 153, 0.2)'
                  }}
                >
                  <div className="text-3xl md:text-4xl mb-4">{contact.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{contact.label}</h3>
                  <p className="text-gray-400">{contact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 md:py-12 bg-black text-gray-400 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                  <span style={gradientTextStyle}>BOOSTAMI</span>
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
                  <span className="hover:scale-110 cursor-pointer transition-transform text-2xl">📱</span>
                  <span className="hover:scale-110 cursor-pointer transition-transform text-2xl">💼</span>
                  <span className="hover:scale-110 cursor-pointer transition-transform text-2xl">📧</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
              <p className="text-sm">{content.footer.copyright}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
