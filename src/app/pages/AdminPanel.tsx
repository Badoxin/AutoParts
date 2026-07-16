import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { DatePickerField } from '../components/DatePickerField';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, CheckCircle2, XCircle, CalendarClock, CalendarOff, Trash2,
  Phone, User, Clock, Plus,
} from 'lucide-react';

interface CitaAdmin {
  id: number;
  usuario_id: number | null;
  nombre_cliente: string;
  telefono_cliente: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  comentarios: string | null;
  creado_en: string;
  servicios: { nombre: string; precio: number; duracion: number }[];
}

interface DiaCerradoAdmin {
  id: number;
  fecha: string;
  motivo: string | null;
}

function iniciales(nombre: string) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
}

function formatearFechaCorta(fecha: string) {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ---------------- Página principal ----------------

export function AdminPanel() {
  const { user, authFetch } = useAuth();
  const [tab, setTab] = useState<'citas' | 'disponibilidad'>('citas');

  if (user && user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Panel de Administrador' }]} />
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/40 text-primary font-medium flex items-center justify-center shrink-0">
            {user ? iniciales(user.nombre) : ''}
          </div>
          <div className="min-w-0">
            <h1 className="text-foreground font-medium text-lg truncate">{user?.nombre}</h1>
            <p className="text-muted-foreground text-xs">Administradora</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setTab('citas')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors ${
              tab === 'citas' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <CalendarClock className="w-4 h-4" /> Citas
          </button>
          <button
            onClick={() => setTab('disponibilidad')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors ${
              tab === 'disponibilidad' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <CalendarOff className="w-4 h-4" /> Disponibilidad
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'citas' ? (
            <motion.div key="tab-citas" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <TabCitas authFetch={authFetch} />
            </motion.div>
          ) : (
            <motion.div key="tab-disponibilidad" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <TabDisponibilidad authFetch={authFetch} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
    </div>
  );
}

// ---------------- Tab: Citas ----------------

function TabCitas({ authFetch }: { authFetch: ReturnType<typeof useAuth>['authFetch'] }) {
  const [citas, setCitas] = useState<CitaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ocupadoId, setOcupadoId] = useState<number | null>(null);
  const [filtroAgenda, setFiltroAgenda] = useState<'hoy' | 'semana' | 'todas'>('todas');
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaAdmin | null>(null);

  const cargar = useCallback(() => {
    setCargando(true);
    authFetch('/admin/citas')
      .then(r => r.json())
      .then(data => setCitas(Array.isArray(data) ? data : []))
      .catch(() => setCitas([]))
      .finally(() => setCargando(false));
  }, [authFetch]);

  useEffect(() => { cargar(); }, [cargar]);

  const decidir = async (cita: CitaAdmin, estado: 'confirmada' | 'rechazada') => {
    setOcupadoId(cita.id);
    try {
      await authFetch(`/admin/citas/${cita.id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      cargar();
    } finally {
      setOcupadoId(null);
    }
  };

  const colorEstado: Record<string, string> = {
    pendiente: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    confirmada: 'bg-green-500/10 text-green-500 border-green-500/30',
    rechazada: 'bg-destructive/10 text-destructive border-destructive/30',
    expirada: 'bg-secondary/40 text-muted-foreground border-border',
    cancelada: 'bg-secondary/40 text-muted-foreground border-border',
  };

  const pendientes = citas.filter(c => c.estado === 'pendiente');

  const hoyStr = new Date().toISOString().slice(0, 10);
  const enUnaSemana = new Date();
  enUnaSemana.setDate(enUnaSemana.getDate() + 7);
  const semanaStr = enUnaSemana.toISOString().slice(0, 10);

  const agenda = citas
    .filter(c => c.estado !== 'pendiente')
    .filter(c => {
      if (filtroAgenda === 'hoy') return c.fecha === hoyStr;
      if (filtroAgenda === 'semana') return c.fecha >= hoyStr && c.fecha <= semanaStr;
      return true;
    })
    .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* Agenda (izquierda) */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-foreground font-medium uppercase text-sm mb-1">Agenda</h2>
              <p className="text-muted-foreground text-sm">Citas confirmadas y su historial</p>
            </div>
            <div className="flex gap-2">
              {(['hoy', 'semana', 'todas'] as const).map(opcion => (
                <button
                  key={opcion}
                  onClick={() => setFiltroAgenda(opcion)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-widest border transition-colors ${
                    filtroAgenda === opcion ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {opcion === 'hoy' ? 'Hoy' : opcion === 'semana' ? 'Esta semana' : 'Todas'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {cargando ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : agenda.length === 0 ? (
              <p className="text-muted-foreground text-sm px-5 py-6">No hay citas en este rango</p>
            ) : (
              <div className="divide-y divide-border">
                {agenda.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCitaSeleccionada(c)}
                    className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 flex-wrap hover:bg-muted/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <p className="text-foreground text-sm font-medium">{c.servicios.map(s => s.nombre).join(', ')}</p>
                        <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border ${colorEstado[c.estado] || colorEstado.expirada}`}>
                          {c.estado}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3" /> {formatearFechaCorta(c.fecha)} · {c.hora_inicio.slice(0, 5)}–{c.hora_fin.slice(0, 5)}
                      </p>
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {c.nombre_cliente}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pendientes (derecha) */}
        <div>
          <div className="mb-4">
            <h2 className="text-foreground font-medium uppercase text-sm mb-1">Pendientes</h2>
            <p className="text-muted-foreground text-sm">{pendientes.length} esperando respuesta</p>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {cargando ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : pendientes.length === 0 ? (
              <p className="text-muted-foreground text-sm px-5 py-6">No hay citas esperando respuesta</p>
            ) : (
              <div className="divide-y divide-border">
                {pendientes.map(c => (
                  <div key={c.id} className="px-4 py-4">
                    <button
                      onClick={() => setCitaSeleccionada(c)}
                      className="w-full text-left mb-3"
                    >
                      <p className="text-foreground text-sm font-medium mb-1.5">{c.servicios.map(s => s.nombre).join(', ')}</p>
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3" /> {formatearFechaCorta(c.fecha)} · {c.hora_inicio.slice(0, 5)}–{c.hora_fin.slice(0, 5)}
                      </p>
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {c.nombre_cliente}
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decidir(c, 'rechazada')}
                        disabled={ocupadoId === c.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg border border-border disabled:opacity-60"
                      >
                        {ocupadoId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Rechazar
                      </button>
                      <button
                        onClick={() => decidir(c, 'confirmada')}
                        disabled={ocupadoId === c.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium uppercase tracking-wide text-primary hover:bg-primary/10 rounded-lg border border-primary/30 disabled:opacity-60"
                      >
                        {ocupadoId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Aceptar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {citaSeleccionada && (
        <DetalleCitaModal
          cita={citaSeleccionada}
          colorEstado={colorEstado}
          onClose={() => setCitaSeleccionada(null)}
        />
      )}
    </div>
  );
}

// ---------------- Modal de detalle de una cita ----------------

function DetalleCitaModal({
  cita,
  colorEstado,
  onClose,
}: {
  cita: CitaAdmin;
  colorEstado: Record<string, string>;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-foreground text-lg font-medium">Detalle de la cita</h3>
          <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border ${colorEstado[cita.estado] || colorEstado.expirada}`}>
            {cita.estado}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1.5">Servicios</p>
            <ul className="space-y-1">
              {cita.servicios.map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm text-foreground">
                  <span>{s.nombre}</span>
                  <span className="text-muted-foreground">${s.precio} · {s.duracion} min</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            {formatearFechaCorta(cita.fecha)} · {cita.hora_inicio.slice(0, 5)}–{cita.hora_fin.slice(0, 5)}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <User className="w-4 h-4 text-primary shrink-0" />
            {cita.nombre_cliente}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            {cita.telefono_cliente}
          </div>

          {cita.comentarios && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1.5">Comentarios</p>
              <p className="text-sm text-foreground italic">"{cita.comentarios}"</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn-glow-soft mt-6 w-full py-2.5 text-sm font-medium uppercase tracking-widest"
        >
          Cerrar
        </button>
      </motion.div>
    </div>
  );
}

// ---------------- Tab: Disponibilidad (ausencias / días cerrados) ----------------

function TabDisponibilidad({ authFetch }: { authFetch: ReturnType<typeof useAuth>['authFetch'] }) {
  const [dias, setDias] = useState<DiaCerradoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fechaNueva, setFechaNueva] = useState('');
  const [motivoNuevo, setMotivoNuevo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [ocupadoId, setOcupadoId] = useState<number | null>(null);

  const cargar = useCallback(() => {
    setCargando(true);
    authFetch('/admin/dias-cerrados')
      .then(r => r.json())
      .then(data => setDias(Array.isArray(data) ? data : []))
      .catch(() => setDias([]))
      .finally(() => setCargando(false));
  }, [authFetch]);

  useEffect(() => { cargar(); }, [cargar]);

  const hoyISO = () => new Date().toISOString().slice(0, 10);
  const maxISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().slice(0, 10);
  };

  const agregar = async () => {
    if (!fechaNueva) return;
    setGuardando(true);
    setError('');
    try {
      const r = await authFetch('/admin/dias-cerrados', {
        method: 'POST',
        body: JSON.stringify({ fecha: fechaNueva, motivo: motivoNuevo.trim() || null }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'No se pudo cerrar ese día');
      setFechaNueva('');
      setMotivoNuevo('');
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar ese día');
    } finally {
      setGuardando(false);
    }
  };

  const reabrir = async (id: number) => {
    setOcupadoId(id);
    try {
      await authFetch(`/admin/dias-cerrados/${id}`, { method: 'DELETE' });
      cargar();
    } finally {
      setOcupadoId(null);
    }
  };

  const formatearFechaCorta = (fecha: string) =>
    new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-foreground font-medium uppercase text-sm mb-1">Disponibilidad</h2>
        <p className="text-muted-foreground text-sm">
          Marca los días en que vas a estar ausente — dejan de ofrecerse para agendar y en /citas
          los clientes ven que ese día está cerrado.
        </p>
      </div>

      {/* Formulario para cerrar un nuevo día */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-3 items-end">
          <div>
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1.5 block">
              Fecha a cerrar
            </label>
            <DatePickerField value={fechaNueva} onChange={setFechaNueva} minDate={hoyISO()} maxDate={maxISO()} />
          </div>
          <div>
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1.5 block">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={motivoNuevo}
              onChange={e => setMotivoNuevo(e.target.value)}
              placeholder="Ej. Vacaciones, cita médica..."
              className="w-full bg-muted border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary placeholder:text-muted-foreground text-sm"
            />
          </div>
          <button
            onClick={agregar}
            disabled={!fechaNueva || guardando}
            className="btn-glow flex items-center justify-center gap-2 px-5 py-2.5 font-medium uppercase tracking-widest text-sm whitespace-nowrap"
          >
            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Cerrar día
          </button>
        </div>
        {error && (
          <p className="text-destructive text-xs mt-3">{error}</p>
        )}
      </div>

      {/* Lista de próximos días cerrados */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {cargando ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : dias.length === 0 ? (
          <p className="text-muted-foreground text-sm px-5 py-6">No tienes ningún día cerrado próximamente</p>
        ) : (
          <div className="divide-y divide-border">
            {dias.map(d => (
              <div key={d.id} className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  <CalendarOff className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium capitalize">{formatearFechaCorta(d.fecha)}</p>
                    {d.motivo && <p className="text-muted-foreground text-xs mt-0.5">{d.motivo}</p>}
                  </div>
                </div>
                <button
                  onClick={() => reabrir(d.id)}
                  disabled={ocupadoId === d.id}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-60 shrink-0"
                  title="Reabrir este día"
                >
                  {ocupadoId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
