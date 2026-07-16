import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { CalendarTimePicker } from '../components/CalendarTimePicker';
import { siteInfo } from '../config/siteInfo';
import {
  Scissors, ChevronRight, ChevronLeft, LogIn, UserPlus,
  Loader2, CheckCircle2, AlertCircle, MessageCircle, Copy, Check,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  duracion: number;
  categoria?: 'corte_hombre' | 'corte_mujer' | 'barba' | 'color' | 'exclusivo' | 'otro';
}

interface CitaConfirmada {
  id: number;
  fecha: string;
  horaInicio: string;
  servicios: { nombre: string; precio: number; duracion: number }[];
  nombreCliente: string;
  telefonoCliente: string;
}

interface CitaMia {
  id: number;
  fecha: string;
  hora_inicio: string;
  estado: string;
  servicios: { nombre: string }[];
}

// ---------- Reglas de combinación de servicios ----------
function categoriaDe(servicios: Servicio[], id: number) {
  return servicios.find(s => s.id === id)?.categoria;
}

function puedeAgregar(servicios: Servicio[], actuales: number[], candidatoId: number): boolean {
  const cat = categoriaDe(servicios, candidatoId);
  const catsActuales = actuales.map(id => categoriaDe(servicios, id));

  if (cat === 'exclusivo') return actuales.length === 0;
  if (catsActuales.includes('exclusivo')) return false;

  if (cat === 'corte_hombre' && catsActuales.includes('corte_mujer')) return false;
  if (cat === 'corte_mujer' && catsActuales.includes('corte_hombre')) return false;
  if (cat && cat !== 'otro' && catsActuales.includes(cat)) return false;

  const maxPermitido = cat === 'color' || catsActuales.includes('color') ? 3 : 2;
  return actuales.length < maxPermitido;
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function maxFechaISO() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function formatearHora(hhmmss: string) {
  const [h, m] = hhmmss.split(':').map(Number);
  const periodo = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${periodo}`;
}

function formatearFechaLarga(fecha: string) {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Link de WhatsApp con el mensaje ya armado. Ya no lleva token: el acceso a
// aceptar/rechazar ahora se controla con sesión de admin (ver ConfirmarCita.tsx).
function linkWhatsApp(cita: CitaConfirmada) {
  const numero = '52' + siteInfo.telefono.replace(/\D/g, '');
  const listaServicios = cita.servicios.map(s => s.nombre).join(', ');
  const total = cita.servicios.reduce((sum, s) => sum + Number(s.precio), 0);
  const linkAccion = `${siteInfo.sitioUrl}/confirmar-cita/${cita.id}`;
  const texto =
    `Hola, quiero confirmar mi cita en Dayandi:\n\n` +
    `Servicio(s): ${listaServicios}\n` +
    `Fecha: ${formatearFechaLarga(cita.fecha)}\n` +
    `Hora: ${formatearHora(cita.horaInicio + ':00')}\n` +
    `Total: $${total}\n\n` +
    `Nombre: ${cita.nombreCliente}\n` +
    `Teléfono: ${cita.telefonoCliente}\n\n` +
    `Para aceptar o rechazar: ${linkAccion}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function linkConfirmacion(cita: CitaConfirmada) {
  return `${siteInfo.sitioUrl}/confirmar-cita/${cita.id}`;
}

export function Citas() {
  const { user, isLoading: cargandoSesion, authFetch, openLogin, openRegistro } = useAuth();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);

  const [paso, setPaso] = useState(1);
  const [serviciosIds, setServiciosIds] = useState<number[]>([]);
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [comentarios, setComentarios] = useState('');

  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [citaConfirmada, setCitaConfirmada] = useState<CitaConfirmada | null>(null);

  const [avisoPrevio, setAvisoPrevio] = useState<CitaMia | null>(null);
  const [cargandoAviso, setCargandoAviso] = useState(true);

  const [diasCerrados, setDiasCerrados] = useState<{ fecha: string; motivo: string | null }[]>([]);
  const [copiado, setCopiado] = useState(false);

  // Si ya tiene una cita pendiente/confirmada próxima, se lo avisamos en vez
  // de dejarlo agendar otra por accidente (esto ahora se consulta directo al
  // backend con su cuenta, ya no depende de localStorage).
  useEffect(() => {
    if (!user) { setCargandoAviso(false); return; }
    authFetch('/citas/mias')
      .then(r => r.json())
      .then((data: CitaMia[]) => {
        const activas = (Array.isArray(data) ? data : [])
          .filter(c => ['pendiente', 'confirmada'].includes(c.estado) && c.fecha >= hoyISO())
          .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));
        setAvisoPrevio(activas[0] || null);
      })
      .catch(() => setAvisoPrevio(null))
      .finally(() => setCargandoAviso(false));
  }, [user, authFetch]);

  useEffect(() => {
    const params = new URLSearchParams({ desde: hoyISO(), hasta: maxFechaISO() });
    fetch(`http://localhost:3000/api/dias-cerrados?${params}`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => setDiasCerrados(Array.isArray(data) ? data : []))
      .catch(() => setDiasCerrados([]));
  }, []);

  const serviciosSeleccionados = useMemo(
    () => servicios.filter(s => serviciosIds.includes(s.id)),
    [servicios, serviciosIds]
  );
  const totalSeleccionado = serviciosSeleccionados.reduce((sum, s) => sum + Number(s.precio), 0);

  useEffect(() => {
    if (user) {
      setNombreCliente(prev => prev || user.nombre);
      setTelefonoCliente(prev => prev || user.telefono || '');
    }
  }, [user]);

  useEffect(() => {
    fetch('http://localhost:3000/api/servicios')
      .then(r => r.json())
      .then(data => setServicios(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCargandoCatalogo(false));
  }, []);

  useEffect(() => {
    if (serviciosIds.length === 0 || !fecha) {
      setHorasDisponibles([]);
      return;
    }
    setCargandoHoras(true);
    setHoraInicio('');
    const params = new URLSearchParams({ servicios: serviciosIds.join(','), fecha });
    fetch(`http://localhost:3000/api/disponibilidad?${params}`)
      .then(r => r.json())
      .then(data => setHorasDisponibles(data.horas || []))
      .catch(() => setHorasDisponibles([]))
      .finally(() => setCargandoHoras(false));
  }, [serviciosIds, fecha]);

  const toggleServicio = (id: number) => {
    setServiciosIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (!puedeAgregar(servicios, prev, id)) return prev;
      return [...prev, id];
    });
  };

  const irAPaso2 = () => serviciosIds.length > 0 && setPaso(2);
  const irAPaso3 = () => fecha && horaInicio && setPaso(3);

  const confirmarCita = async () => {
    if (serviciosIds.length === 0 || !fecha || !horaInicio || !nombreCliente.trim() || !telefonoCliente.trim()) return;
    setEnviando(true);
    setErrorEnvio('');
    try {
      const response = await authFetch('/citas', {
        method: 'POST',
        body: JSON.stringify({
          servicios: serviciosIds,
          fecha,
          horaInicio,
          nombreCliente: nombreCliente.trim(),
          telefonoCliente: telefonoCliente.trim(),
          comentarios: comentarios.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo agendar la cita');
      const nuevaCita: CitaConfirmada = {
        id: data.cita.id,
        fecha: data.cita.fecha,
        horaInicio: data.cita.horaInicio,
        servicios: data.cita.servicios,
        nombreCliente: nombreCliente.trim(),
        telefonoCliente: telefonoCliente.trim(),
      };
      setCitaConfirmada(nuevaCita);
    } catch (err) {
      setErrorEnvio(err instanceof Error ? err.message : 'No se pudo agendar la cita');
    } finally {
      setEnviando(false);
    }
  };

  const copiarEnlace = async (cita: CitaConfirmada) => {
    try {
      await navigator.clipboard.writeText(linkConfirmacion(cita));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // si el navegador bloquea el portapapeles, el link sigue visible como texto
    }
  };

  const reiniciar = () => {
    setPaso(1);
    setServiciosIds([]);
    setFecha('');
    setHoraInicio('');
    setComentarios('');
    setCitaConfirmada(null);
    setErrorEnvio('');
  };

  // La dueña no agenda citas para sí misma: usa su propio panel.
  if (user?.rol === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Mientras se resuelve si hay sesión guardada, no mostramos nada todavía
  // (evita el parpadeo de "necesitas cuenta" un instante antes de detectar
  // que sí la tiene).
  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  // Ya no se puede agendar como invitado: hace falta cuenta.
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumbs items={[{ label: 'Agendar Cita' }]} />
          </div>
        </div>
        <section className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Scissors className="w-12 h-12 text-primary mx-auto mb-5" />
          <h1 className="text-foreground text-3xl mb-3">Necesitas una cuenta</h1>
          <p className="text-muted-foreground mb-8">
            Para agendar tu cita en Dayandi primero crea una cuenta o inicia sesión —
            es rápido y así protegemos tus citas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={openLogin}
              className="btn-glow-soft inline-flex items-center justify-center gap-2 px-6 py-3 font-medium uppercase tracking-widest text-sm"
            >
              <LogIn className="w-4 h-4" /> Iniciar sesión
            </button>
            <button
              onClick={openRegistro}
              className="btn-glow inline-flex items-center justify-center gap-2 px-6 py-3 font-medium uppercase tracking-widest text-sm"
            >
              <UserPlus className="w-4 h-4" /> Crear cuenta
            </button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Agendar Cita' }]} />
        </div>
      </div>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="text-center mb-10">
          <p className="eyebrow text-muted-foreground mb-3">Dayandi · Estética Unisex</p>
          <h1 className="text-4xl md:text-5xl text-foreground mb-3">Agendar Cita</h1>
          <p className="text-muted-foreground">Reserva tu espacio en menos de un minuto</p>
        </div>

        <AnimatePresence mode="wait">
        {cargandoAviso ? (
          <motion.div key="cargando-aviso" className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </motion.div>
        ) : citaConfirmada ? (
          <motion.div
            key="confirmada"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-2xl p-10 text-center"
          >
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
            <h2 className="text-foreground text-2xl mb-2">¡Cita apartada!</h2>
            <p className="text-muted-foreground mb-1">
              {citaConfirmada.servicios.map(s => s.nombre).join(', ')}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              {formatearFechaLarga(citaConfirmada.fecha)} · {formatearHora(citaConfirmada.horaInicio + ':00')}
            </p>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-5 mb-8 text-left">
              <p className="text-foreground text-sm font-medium mb-3">
                Último paso: confírmala por WhatsApp
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                Tu horario queda apartado un rato, pero para que quede confirmada de verdad
                hay que avisarle a Dayandi por WhatsApp. Te dejamos el mensaje ya escrito,
                solo dale enviar.
              </p>
              <a
                href={linkWhatsApp(citaConfirmada)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow inline-flex items-center justify-center gap-2 px-6 py-3 font-medium uppercase tracking-widest text-sm w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar por WhatsApp
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/perfil"
                className="btn-glow-soft inline-flex items-center justify-center gap-2 px-6 py-3 font-medium uppercase tracking-widest text-sm"
              >
                Ver Mis Citas
              </Link>
            </div>
          </motion.div>
        ) : avisoPrevio ? (
          <motion.div
            key="aviso-previo"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-2xl p-10 text-center"
          >
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
            <h2 className="text-foreground text-2xl mb-2">
              {avisoPrevio.estado === 'confirmada' ? 'Tu cita ya está confirmada' : 'Tu cita está pendiente de confirmación'}
            </h2>
            <p className="text-muted-foreground mb-1">
              {avisoPrevio.servicios.map(s => s.nombre).join(', ')}
            </p>
            <p className="text-muted-foreground text-sm mb-2">
              {formatearFechaLarga(avisoPrevio.fecha)} · {formatearHora(avisoPrevio.hora_inicio)}
              {avisoPrevio.estado === 'confirmada'
                ? ' — te esperamos en Dayandi'
                : ' — en cuanto Dayandi la confirme te lo hacemos saber por WhatsApp'}
            </p>
            <Link to="/perfil" className="inline-block text-primary text-sm font-medium uppercase tracking-widest mt-4">
              Ver Mis Citas
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="pasos"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-10">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      paso === n ? 'bg-primary text-primary-foreground' : paso > n ? 'bg-primary/30 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {n}
                  </div>
                  {n < 3 && <div className={`w-10 h-0.5 ${paso > n ? 'bg-primary/50' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">

              <AnimatePresence mode="wait">
              {cargandoCatalogo ? (
                <motion.div
                  key="cargando"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center py-20"
                >
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </motion.div>
              ) : paso === 1 ? (
                <motion.div
                  key="paso1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="p-6 sm:p-8"
                >
                  <h2 className="text-foreground font-medium uppercase tracking-wide text-sm mb-1.5 flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-primary" /> Elige tu(s) servicio(s)
                  </h2>
                  <p className="text-muted-foreground text-xs mb-4">
                    Puedes combinar hasta 2 servicios (3 si uno es Tinte). Corte de hombre y Corte mujer
                    no se pueden combinar entre sí.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    {servicios.map(s => {
                      const seleccionado = serviciosIds.includes(s.id);
                      const deshabilitado = !seleccionado && !puedeAgregar(servicios, serviciosIds, s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleServicio(s.id)}
                          disabled={deshabilitado}
                          className={`text-left p-4 rounded-lg border transition-colors ${
                            seleccionado
                              ? 'border-primary bg-primary/10'
                              : deshabilitado
                              ? 'border-border bg-muted/20 opacity-40 cursor-not-allowed'
                              : 'border-border bg-muted/50 hover:border-primary/40'
                          }`}
                        >
                          <p className="text-foreground font-medium text-sm">{s.nombre}</p>
                          <p className="text-muted-foreground text-xs mt-1">${s.precio} · {s.duracion} min</p>
                        </button>
                      );
                    })}
                  </div>

                  {serviciosSeleccionados.length > 0 && (
                    <p className="text-primary text-sm font-medium mt-4 mb-2">
                      Total: ${totalSeleccionado} · {serviciosSeleccionados.reduce((s, x) => s + x.duracion, 0)} min
                    </p>
                  )}

                  <button
                    onClick={irAPaso2}
                    disabled={serviciosIds.length === 0}
                    className="btn-glow w-full mt-6 flex items-center justify-center gap-2 py-3 font-medium uppercase tracking-widest text-sm"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : paso === 2 ? (
                <motion.div
                  key="paso2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="p-6 sm:p-8"
                >
                  <CalendarTimePicker
                    fecha={fecha}
                    onFechaChange={setFecha}
                    minDate={hoyISO()}
                    maxDate={maxFechaISO()}
                    horas={horasDisponibles}
                    horaSeleccionada={horaInicio}
                    onHoraChange={setHoraInicio}
                    cargandoHoras={cargandoHoras}
                    formatearHora={formatearHora}
                    diasCerrados={diasCerrados.map(d => d.fecha)}
                  />

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setPaso(1)}
                      className="btn-glow-soft flex items-center justify-center gap-2 px-5 py-3 font-medium uppercase tracking-widest text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" /> Atrás
                    </button>
                    <button
                      onClick={irAPaso3}
                      disabled={!fecha || !horaInicio}
                      className="btn-glow flex-1 flex items-center justify-center gap-2 py-3 font-medium uppercase tracking-widest text-sm"
                    >
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="paso3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="p-6 sm:p-8"
                >
                  <h2 className="text-foreground font-medium uppercase tracking-wide text-sm mb-4">Confirma tu cita</h2>

                  <div className="bg-muted/50 border border-border rounded-lg p-5 mb-6 space-y-2">
                    <p className="text-foreground font-medium">{serviciosSeleccionados.map(s => s.nombre).join(', ')}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatearFechaLarga(fecha)} · {formatearHora(horaInicio + ':00')}
                    </p>
                    <p className="text-primary font-medium text-sm pt-1">${totalSeleccionado}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1.5 block">
                        Tu nombre
                      </label>
                      <input
                        type="text"
                        value={nombreCliente}
                        onChange={e => setNombreCliente(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full bg-muted border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1.5 block">
                        Tu teléfono
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={telefonoCliente}
                        onChange={e => setTelefonoCliente(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10 dígitos"
                        className="w-full bg-muted border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <label className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1.5 block">
                    Comentarios (opcional)
                  </label>
                  <textarea
                    value={comentarios}
                    onChange={e => setComentarios(e.target.value)}
                    placeholder="Algo que Dayandi deba saber..."
                    rows={3}
                    maxLength={300}
                    className="w-full bg-muted border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary mb-6 resize-none placeholder:text-muted-foreground"
                  />

                  {errorEnvio && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 mb-6">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorEnvio}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaso(2)}
                      className="btn-glow-soft flex items-center justify-center gap-2 px-5 py-3 font-medium uppercase tracking-widest text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" /> Atrás
                    </button>
                    <button
                      onClick={confirmarCita}
                      disabled={enviando || !nombreCliente.trim() || !telefonoCliente.trim()}
                      className="btn-glow flex-1 flex items-center justify-center gap-2 py-3 font-medium uppercase tracking-widest text-sm"
                    >
                      {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Confirmar Cita
                    </button>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </section>

      <Footer />
    </div>
  );
}