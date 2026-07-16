import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn, UserPlus, LogOut, ChevronDown, UserCircle, Scissors, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function UserMenu({ onDark = false }: { onDark?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout, openLogin, openRegistro } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleNav = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogin = () => {
    setIsOpen(false);
    openLogin();
  };

  const handleRegistro = () => {
    setIsOpen(false);
    openRegistro();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-1.5 transition-colors ${
          onDark ? 'text-white/90 hover:text-white' : 'text-muted-foreground hover:text-primary'
        }`}
      >
        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-foreground text-xs font-bold">{user.nombre.charAt(0).toUpperCase()}</span>
            </div>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        ) : (
          <User className="w-5 h-5" />
        )}
      </button>

      <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <span className="text-foreground font-bold">{user.nombre.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground font-semibold text-sm truncate">{user.nombre}</p>
                    <p className="text-muted-foreground text-xs truncate">{user.correo}</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                {user.rol !== 'admin' && (
                  <button
                    onClick={() => handleNav('/perfil')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
                  >
                    <UserCircle className="w-4 h-4 text-primary" />
                    Mi Perfil
                  </button>
                )}
                {user.rol === 'admin' && (
                  <button
                    onClick={() => handleNav('/admin')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
                  >
                  <Shield className="w-4 h-4 text-primary" />
                    Panel de Administrador
                  </button>
                )}
              </div>

              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-primary hover:opacity-70 hover:bg-muted transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border">
                <p className="text-muted-foreground text-xs">Inicia sesión para acceder a tu cuenta</p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4 text-primary" />
                  Iniciar Sesión
                </button>
                <button
                  onClick={handleRegistro}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4 text-primary" />
                  Registrarse
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}