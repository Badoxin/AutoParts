import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogIn, UserPlus, LogOut, Heart, ChevronDown } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface UserData {
  name: string;
  email: string;
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'registro'>('login');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAuth = (view: 'login' | 'registro') => {
    setAuthView(view);
    setAuthOpen(true);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsOpen(false);
  };

  return (
    <>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialView={authView}
      />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-1.5 text-gray-300 hover:text-orange-500 transition-colors"
        >
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          ) : (
            <User className="w-5 h-5" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">

            {user ? (
              <>
                <div className="px-4 py-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">{user.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-gray-400 text-xs">Inicia sesión para acceder a tu cuenta</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => openAuth('login')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                  >
                    <LogIn className="w-4 h-4 text-orange-500" />
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => openAuth('registro')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                  >
                    <UserPlus className="w-4 h-4 text-orange-500" />
                    Registrarse
                  </button>
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </>
  );
}