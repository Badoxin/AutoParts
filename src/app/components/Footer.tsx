import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer
      className="mt-20 border-t border-gray-800"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=60')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div style={{ background: 'rgba(0,0,0,0.82)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Logo + descripción */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="text-white font-bold text-xl">AutoParts</span>
              </Link>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Tu aliado en refacciones automotrices de calidad.<br />
                Más de 10 años de experiencia en San Luis Río Colorado.
              </p>
                <div className="flex gap-3">
                  <a href="#" className="w-9 h-9 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-100 hover:text-orange-500 hover:border-orange-500 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-100 hover:text-orange-500 hover:border-orange-500 transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-100 hover:text-orange-500 hover:border-orange-500 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-5">
                Enlaces Rápidos
              </h3>
              <ul className="space-y-3">
                {[
                  { to: '/catalogo', label: 'Catálogo' },
                  { to: '/ofertas',  label: 'Ofertas'  },
                  { to: '/contacto', label: 'Contacto' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors text-sm"
                    >
                      <ChevronRight className="w-3 h-3 text-orange-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-5">
                Contacto
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: Phone,  value: '653 517 0902' },
                  { icon: Mail,   value: 'contacto@autoparts.mx' },
                  { icon: MapPin, value: 'San Luis Río Colorado, Sonora' },
                ].map(({ icon: Icon, value }) => (
                  <li key={value} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-600 text-xs">
              &copy; 2026 AutoParts. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}