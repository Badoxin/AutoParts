import { useState, useEffect } from 'react';
import { X, Mail, Lock, LogIn, User, Phone, UserPlus, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'registro';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'registro'>(initialView);

  useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <h2 className="text-white font-black uppercase tracking-wider text-base">
                {view === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-4">

            {/* LOGIN  */}
            {view === 'login' && (
              <>
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                    <input type="checkbox" className="accent-orange-500" />
                    Recordarme
                  </label>
                  <span className="text-orange-500 hover:text-orange-400 cursor-pointer transition-colors text-xs">
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors text-sm">
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>

                <p className="text-center text-gray-500 text-sm">
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => setView('registro')}
                    className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </>
            )}

            {/* REGISTRO */}
            {view === 'registro' && (
              <>
                <button
                  onClick={() => setView('login')}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 transition-colors text-xs mb-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Volver a iniciar sesión
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                      Nombre
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Juan"
                        className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                      Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="García"
                      className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      placeholder="+52 000 000 0000"
                      className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      placeholder="Repite tu contraseña"
                      className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 text-gray-400 text-xs cursor-pointer">
                  <input type="checkbox" className="accent-orange-500 mt-0.5 shrink-0" />
                  <span>
                    Acepto los{' '}
                    <span className="text-orange-500">términos y condiciones</span>
                    {' '}y la{' '}
                    <span className="text-orange-500">política de privacidad</span>
                  </span>
                </label>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors text-sm">
                  <UserPlus className="w-4 h-4" />
                  Crear Cuenta
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}