import { useState, useRef, useEffect } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  // Enfocar el input cuando se abre
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <nav className="bg-black border-b border-gray-800 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — se oculta cuando el buscador está abierto en móvil */}
          <Link to="/" className={`flex items-center gap-2 shrink-0 transition-opacity ${searchOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : ''}`}>
            <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">AutoParts</span>
          </Link>

          {/* Barra de búsqueda expandida */}
          {searchOpen && (
            <form
              onSubmit={handleSearch}
              className="absolute inset-x-0 top-0 h-16 bg-black flex items-center px-4 gap-3 md:relative md:inset-auto md:h-auto md:flex-1 md:mx-8"
            >
              <Search className="w-5 h-5 text-orange-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar refacción, marca, categoría..."
                className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Links centrales — se ocultan cuando el buscador está abierto */}
          {!searchOpen && (
            <div className="hidden md:flex items-center space-x-6">
              {[
                { to: '/catalogo', label: 'Catálogo' },
                { to: '/ofertas',  label: 'Ofertas'  },
                { to: '/contacto', label: 'Contacto' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`font-semibold uppercase tracking-wide text-sm transition-colors ${
                    isActive(to)
                      ? 'text-orange-500 border-b-2 border-orange-500 pb-0.5'
                      : 'text-gray-300 hover:text-orange-500'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Iconos derecha */}
          <div className={`flex items-center gap-4 ${searchOpen ? 'hidden md:flex' : ''}`}>
            <button
              onClick={() => setSearchOpen(prev => !prev)}
              className={`transition-colors ${searchOpen ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
            >
              <Search className="w-5 h-5" />
            </button>
            <UserMenu />
            <button className="md:hidden text-gray-300 hover:text-orange-500 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}