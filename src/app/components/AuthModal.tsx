import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, LogIn, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const { modalMode, closeModal, login, registro, openLogin, openRegistro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState<'login' | 'registro' | null>(null);

  const [loginForm, setLoginForm] = useState({ correo: '', contrasena: '' });
  const [registroForm, setRegistroForm] = useState({ nombre: '', correo: '', telefono: '', contrasena: '' });

  useEffect(() => {
    setError('');
    setLoading(false);
    setExito(null);
  }, [modalMode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeModal]);

  useEffect(() => {
    if (!exito) return;
    const timer = setTimeout(() => closeModal(), 1400);
    return () => clearTimeout(timer);
  }, [exito, closeModal]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.correo, loginForm.contrasena);
      setExito('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error, intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registro(registroForm.nombre, registroForm.correo, registroForm.telefono, registroForm.contrasena);
      setExito('registro');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error, intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {modalMode && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2B2019]/70 backdrop-blur-sm"
      onClick={closeModal}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              {exito
                ? <CheckCircle2 className="w-4 h-4 text-foreground" />
                : modalMode === 'login'
                  ? <LogIn className="w-4 h-4 text-foreground" />
                  : <UserPlus className="w-4 h-4 text-foreground" />}
            </div>
            <h2 className="text-foreground font-black uppercase tracking-wide text-sm">
              {exito
                ? (exito === 'login' ? '¡Bienvenido!' : '¡Cuenta creada!')
                : (modalMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </h2>
          </div>
          <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {exito ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <p className="text-foreground font-bold mb-1">
                {exito === 'login' ? 'Sesión iniciada correctamente' : 'Tu cuenta se creó con éxito'}
              </p>
              <p className="text-muted-foreground text-sm">Ya puedes agendar tu cita</p>
            </div>
          ) : (
          <>
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2.5 text-destructive text-sm">
              {error}
            </div>
          )}

          {modalMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    maxLength={100}
                    value={loginForm.correo}
                    onChange={e => setLoginForm(prev => ({ ...prev, correo: e.target.value }))}
                    placeholder="tu@correo.com"
                    className="w-full bg-muted border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    maxLength={72}
                    value={loginForm.contrasena}
                    onChange={e => setLoginForm(prev => ({ ...prev, contrasena: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-muted border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full flex items-center justify-center gap-2 py-3 font-black uppercase tracking-widest text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Entrar
              </button>

              <p className="text-center text-muted-foreground text-sm">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={openRegistro} className="text-primary hover:opacity-70 font-semibold">
                  Regístrate aquí
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegistro} className="space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    maxLength={60}
                    value={registroForm.nombre}
                    onChange={e => setRegistroForm(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Tu nombre"
                    className="w-full bg-muted border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    maxLength={100}
                    value={registroForm.correo}
                    onChange={e => setRegistroForm(prev => ({ ...prev, correo: e.target.value }))}
                    placeholder="tu@correo.com"
                    className="w-full bg-muted border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    value={registroForm.telefono}
                    onChange={e => {
                      const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setRegistroForm(prev => ({ ...prev, telefono: soloNumeros }));
                    }}
                    placeholder="10 dígitos, ej. 6535384367"
                    className="w-full bg-muted border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    maxLength={72}
                    value={registroForm.contrasena}
                    onChange={e => setRegistroForm(prev => ({ ...prev, contrasena: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-muted border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full flex items-center justify-center gap-2 py-3 font-black uppercase tracking-widest text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Crear Cuenta
              </button>

              <p className="text-center text-muted-foreground text-sm">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={openLogin} className="text-primary hover:opacity-70 font-semibold">
                  Inicia sesión
                </button>
              </p>
            </form>
          )}
          </>
          )}
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}