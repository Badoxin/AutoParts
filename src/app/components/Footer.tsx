import { Facebook, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteInfo } from '../config/siteInfo';

export function Footer() {
  return (
    <footer
      className="mt-20 border-t border-border"
      style={{
        backgroundImage: `url('/gallery/local-interior.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div style={{ background: 'rgba(52, 41, 79, 0.94)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Logo + descripción */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt={siteInfo.nombre}
                  className="w-10 h-10 object-contain rounded-full bg-white p-0.5"
                />
                <div>
                  <span className="text-white font-semibold text-base tracking-wide block leading-none">
                    {siteInfo.nombre}
                  </span>
                  <span className="text-[#C9A6D6] text-xs tracking-widest uppercase">
                    {siteInfo.tagline}
                  </span>
                </div>
              </Link>
              <p className="text-white/60 text-sm mb-5 leading-relaxed">
                {siteInfo.descripcionFooter}
              </p>
              <div className="flex gap-3">
  <a href={siteInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-white/25 rounded-full flex items-center justify-center text-white/60 hover:text-[#C9A6D6] hover:border-[#C9A6D6] transition-colors">
    <Facebook className="w-4 h-4" />
  </a>
</div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-white font-semibold uppercase tracking-widest text-xs mb-5">
                Enlaces Rápidos
              </h3>
              <ul className="space-y-3">
                {[
                  { to: '/servicios', label: 'Servicios' },
                  { to: '/citas',     label: 'Citas'     },
                  { to: '/contacto',  label: 'Contacto'  },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-white/60 hover:text-[#C9A6D6] transition-colors text-sm"
                    >
                      <ChevronRight className="w-3 h-3 text-[#C9A6D6]" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-white font-semibold uppercase tracking-widest text-xs mb-5">
                Contacto
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: Phone,  value: siteInfo.telefono },
                  { icon: MapPin, value: siteInfo.direccion },
                ].map(({ icon: Icon, value }) => (
                  <li key={value} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-[#C9A6D6] shrink-0 mt-0.5" />
                    <span className="text-white/60 text-sm">{value}</span>
                  </li>
                ))}
              </ul>

              {/* Horario */}
              <div className="mt-5">
                <p className="text-white text-xs font-semibold uppercase tracking-widest mb-2">Horario</p>
                <p className="text-white/60 text-sm">{siteInfo.horarioEntreSemana}</p>
                <p className="text-white/60 text-sm">{siteInfo.horarioDomingo}</p>
              </div>
            </div>

          </div>

          <div className="border-t border-white/10 pt-5 text-center">
            <p className="text-white/35 text-[11px] tracking-wide">
              &copy; 2026 {siteInfo.nombre} {siteInfo.tagline}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}