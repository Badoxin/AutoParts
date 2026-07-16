import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { siteInfo } from '../config/siteInfo';

const galeria = [
  { src: '/gallery/corte-1.jpg', alt: 'Color castaño con reflejos', caption: 'Color castaño',  rotate: '-rotate-3' },
  { src: '/gallery/corte-2.jpg', alt: 'Color rojo intenso en cabello largo', caption: 'Rojo intenso', rotate: 'rotate-2' },
  { src: '/gallery/corte-3.jpg', alt: 'Corte desvanecido caballero', caption: 'Desvanecido', rotate: 'rotate-3' },
  { src: '/gallery/corte-4.jpg', alt: 'Corte bob mujer', caption: 'Bob moderno', rotate: '-rotate-2' },
];

export function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar overlay />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/gallery/local-interior.jpg"
            alt={siteInfo.nombre}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(1.1) saturate(1.15) sepia(0.04) contrast(1.03)' }}
          />
          {/* Velo neutro y cálido -sin tinte morado- solo para dar contraste al texto.
              Se concentra a la izquierda, donde va el texto, y se disuelve hacia la derecha
              para dejar ver el salón en sus colores reales. */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-[#E4CBEE]/70 bg-white/5 backdrop-blur-sm text-[#F0D9F9] text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
              ✦ Estética Unisex ✦
            </div>

            {/* Título */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl italic text-white leading-[1.05] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
              {siteInfo.nombreLinea1}
            </h1>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl italic leading-[1.05] mb-8"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                backgroundImage: 'linear-gradient(90deg, #F0D9F9, #C9A6D6)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.3))',
              }}
            >
              {siteInfo.nombreLinea2}
            </h1>

            <p className="text-lg text-white mb-2">
              <strong className="font-medium">{siteInfo.descripcionHero}</strong>
            </p>
            <p className="text-white/70 mb-10">
              {siteInfo.ciudad} · {siteInfo.horarioResumen}
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/citas"
                className="bg-gradient-to-r from-[#A263AC] to-[#5C4A87] text-white px-8 py-4 rounded-full font-medium uppercase tracking-widest flex items-center gap-2 text-sm shadow-[0_8px_28px_rgba(92,74,135,0.5)] hover:shadow-[0_10px_36px_rgba(162,99,172,0.65)] hover:-translate-y-0.5 transition-all"
              >
                <Calendar className="w-5 h-5" />
                Agendar Cita
              </Link>
              <Link
                to="/servicios"
                className="border border-white/50 hover:border-white bg-white/5 hover:bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-full font-medium uppercase tracking-widest flex items-center gap-2 transition-all text-sm"
              >
                Ver Servicios
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
          <span>Scroll</span>
          <div className="w-px h-8 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* Un espacio diseñado para ti */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <p className="eyebrow text-primary/70 mb-4">Nuestro espacio</p>
            <h2 className="text-4xl sm:text-5xl text-foreground mb-6 leading-[1.15]">
              Un espacio{' '}
              <span style={{ color: '#A263AC' }}>diseñado</span>{' '}
              para ti
            </h2>
            <p className="text-foreground/80 mb-5 leading-relaxed text-lg">
              {siteInfo.aboutTexto1}
            </p>
            <p className="text-muted-foreground mb-9 leading-relaxed border-l-2 border-primary/25 pl-4 italic">
              {siteInfo.aboutTexto2}
            </p>
            <Link
              to="/contacto"
              className="btn-glow-outline inline-flex items-center gap-2 px-6 py-3 font-medium uppercase tracking-wide text-sm"
            >
              <MapPin className="w-4 h-4" />
              Cómo llegar
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            {galeria.map(({ src, alt, caption, rotate }) => (
              <Link
                key={src}
                to="/servicios"
                className={`group relative block bg-white p-3 pb-7 shadow-lg ${rotate} hover:rotate-0 hover:-translate-y-1 hover:shadow-2xl hover:z-10 transition-all duration-300 ease-out`}
              >
                <div className="overflow-hidden">
                  <img
                    src={src}
                    alt={alt}
                    className="object-cover h-36 sm:h-44 w-full transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <p
                  className="text-center text-muted-foreground mt-2"
                  style={{ fontFamily: "'Parisienne', cursive", fontSize: '1.05rem' }}
                >
                  {caption}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-[420px] h-[420px] rounded-full bg-[#A263AC]/10 blur-3xl" />
        </div>

        <div className="relative">
          <h2 className="text-4xl sm:text-5xl md:text-6xl text-foreground mb-6 leading-tight">
            ¿Listo para tu{' '}
            <span
              className="block sm:inline"
              style={{ fontFamily: "'Parisienne', cursive", fontWeight: 400, color: '#5C4A87', fontSize: '1.4em' }}
            >
              nuevo look?
            </span>
          </h2>
          <p className="text-muted-foreground mb-12 text-lg max-w-xl mx-auto">
            Agenda tu cita hoy y déjate consentir por Dayandi en {siteInfo.ciudad}.
          </p>
          <Link
            to="/citas"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#A263AC] to-[#5C4A87] text-white px-12 py-6 rounded-full font-medium uppercase tracking-widest text-base shadow-[0_10px_40px_rgba(92,74,135,0.5)] hover:shadow-[0_10px_50px_rgba(162,99,172,0.65)] hover:-translate-y-0.5 transition-all"
          >
            <Calendar className="w-6 h-6" />
            Agendar Mi Cita
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
