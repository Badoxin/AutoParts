import { useState, useEffect } from 'react';
import { Menu, X, MapPin, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { useAuth } from '../context/AuthContext';
import { siteInfo } from '../config/siteInfo';

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  const esPersonalInterno = user?.rol === 'admin';

  const links = [
    { to: '/servicios',  label: 'Servicios'  },
    { to: '/citas',      label: 'Citas'      },
    { to: '/contacto',   label: 'Contacto'   },
  ].filter(link => !(esPersonalInterno && (link.to === '/citas' || link.to === '/contacto')));

  // Solo relevante en modo overlay: una vez que el usuario baja del hero,
  // la barra pasa de transparente sobre la foto a un fondo sólido normal.
  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 72);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  /* ---------- Modo overlay: barra única, fundida sobre la imagen del hero ---------- */
  if (overlay) {
    const solid = scrolled;
    return (
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          solid ? 'bg-card/95 backdrop-blur-sm shadow-sm border-b border-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setMenuAbierto(false)}>
              <img
                src="/logo.png"
                alt={siteInfo.nombre}
                className="w-10 h-10 object-contain rounded-full bg-white/90 p-0.5"
              />
              <div className="hidden sm:block">
                <span className={`font-semibold text-lg tracking-wide leading-none block transition-colors ${solid ? 'text-foreground' : 'text-white drop-shadow-sm'}`}>
                  {siteInfo.nombre}
                </span>
                <span className={`text-xs tracking-widest uppercase transition-colors ${solid ? 'text-primary' : 'text-[#E4CBEE]'}`}>
                  {siteInfo.tagline}
                </span>
              </div>
            </Link>

            {/* Links */}
            <div className={`hidden md:flex items-center space-x-8 ${esPersonalInterno ? 'md:ml-auto md:mr-8' : ''}`}>
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`font-medium uppercase tracking-wide text-sm transition-colors ${
                    solid
                      ? isActive(to) ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-muted-foreground hover:text-primary'
                      : isActive(to) ? 'text-white border-b-2 border-white pb-0.5' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <a
                href={`tel:${siteInfo.telefono.replace(/\D/g, '')}`}
                className={`flex items-center gap-1.5 text-sm transition-colors ${solid ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'}`}
              >
                <Phone className="w-3.5 h-3.5" />
                {siteInfo.telefono}
              </a>
            </div>

            {/* Iconos */}
            <div className="flex items-center gap-4">
              <UserMenu onDark={!solid} />
              <button
                onClick={() => setMenuAbierto(v => !v)}
                className={`md:hidden transition-colors ${solid ? 'text-muted-foreground hover:text-primary' : 'text-white'}`}
                aria-label="Abrir menú"
              >
                {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Menú móvil desplegable */}
        {menuAbierto && (
          <div className="md:hidden bg-card border-t border-border">
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuAbierto(false)}
                  className={`px-3 py-2.5 rounded-lg font-medium uppercase tracking-wide text-sm transition-colors ${
                    isActive(to) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <a
                href={`tel:${siteInfo.telefono.replace(/\D/g, '')}`}
                className="flex items-center gap-2 px-3 py-2.5 text-muted-foreground text-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                {siteInfo.telefono}
              </a>
            </div>
          </div>
        )}
      </header>
    );
  }

  /* ---------- Modo normal: barra sólida de siempre, usada en el resto del sitio ---------- */
  return (
    <div className="sticky top-0 z-50">
      {/* Sub-barra delgada: dirección a la izquierda, teléfono a la derecha */}
      <div className="bg-primary border-b border-primary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-[11px] sm:text-xs text-white/90">
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{siteInfo.direccion}</span>
          </span>
          <a
            href={`tel:${siteInfo.telefono.replace(/\D/g, '')}`}
            className="flex items-center gap-1.5 shrink-0 ml-3 hover:text-primary transition-colors"
          >
            <Phone className="w-3 h-3 shrink-0" />
            {siteInfo.telefono}
          </a>
        </div>
      </div>

      <nav className="bg-card/95 backdrop-blur-sm border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setMenuAbierto(false)}>
            <img
              src="/logo.png"
              alt={siteInfo.nombre}
              className="w-10 h-10 object-contain rounded-full"
            />
            <div className="hidden sm:block">
              <span className="text-foreground font-semibold text-lg tracking-wide leading-none block">
                {siteInfo.nombre}
              </span>
              <span className="text-primary text-xs tracking-widest uppercase">
                {siteInfo.tagline}
              </span>
            </div>
          </Link>

          {/* Links */}
          <div className={`hidden md:flex items-center space-x-6 ${esPersonalInterno ? 'md:ml-auto md:mr-8' : ''}`}>
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-medium uppercase tracking-wide text-sm transition-colors ${
                  isActive(to)
                    ? 'text-primary border-b-2 border-primary pb-0.5'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Iconos */}
          <div className="flex items-center gap-4">
            <UserMenu />
            <button
              onClick={() => setMenuAbierto(v => !v)}
              className="md:hidden text-muted-foreground hover:text-primary transition-colors"
              aria-label="Abrir menú"
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuAbierto(false)}
                className={`px-3 py-2.5 rounded-lg font-medium uppercase tracking-wide text-sm transition-colors ${
                  isActive(to) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
      </nav>
    </div>
  );
}
