import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Phone, Save, CheckCircle, Calendar, Scissors, Clock, Loader2,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000';

function urlCompleta(ruta: string | null | undefined) {
  if (!ruta) return null;
  return ruta.startsWith('http') ? ruta : `${API_BASE}${ruta}`;
}

interface Cita {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'finalizada';
  comentarios: string | null;
  servicio: string;
  precio: string;
}

const ESTADO_ESTILOS: Record<Cita['estado'], string> = {
  pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  confirmada: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  finalizada: 'bg-green-500/10 text-green-400 border-green-500/30',
  cancelada: 'bg-destructive/10 text-destructive border-destructive/30',
};

const ESTADO_LABEL: Record<Cita['estado'], string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

function formatearFecha(fecha: string) {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function Perfil() {
  const { user, isLoading, authFetch, updateUser } = useAuth();

  const [form, setForm] = useState({ nombre: '', telefono: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ nombre: user.nombre, telefono: user.telefono || '' });
    }
  }, [user]);

  if (!isLoading && !user) {
    return <Navigate to="/" replace />;
  }
  if (user?.rol === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (field: 'nombre' | 'telefono', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const response = await authFetch('/perfil', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar');
      updateUser(data.usuario);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Mi Perfil' }]} />
        </div>
      </div>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="bg-card border border-border rounded-xl overflow-hidden mb-10">

          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-foreground font-bold uppercase tracking-wide text-sm">Información Personal</h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">
                Nombre completo
              </label>
              <input
                value={form.nombre}
                onChange={e => handleChange('nombre', e.target.value)}
                placeholder="Tu nombre"
                maxLength={60}
                className="w-full bg-muted border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={user?.correo || ''}
                  disabled
                  className="w-full bg-muted/50 border border-border text-muted-foreground pl-10 pr-4 py-2.5 rounded-lg cursor-not-allowed"
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
                  value={form.telefono}
                  onChange={e => handleChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10 dígitos, ej. 6535384367"
                  maxLength={10}
                  className="w-full bg-muted border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            {saveError && <p className="text-destructive text-sm mb-3">{saveError}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 font-black uppercase tracking-widest text-sm transition-all ${
                saved ? 'bg-green-500 text-white rounded-full' : 'btn-glow'
              }`}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                : saved
                  ? <><CheckCircle className="w-4 h-4" /> Guardado</>
                  : <><Save className="w-4 h-4" /> Guardar Cambios</>
              }
            </button>
          </div>
        </div>

        <MisCitas authFetch={authFetch} />
      </section>

      <Footer />
    </div>
  );
}

// ---------------- Cliente: Mis Citas ----------------

function MisCitas({ authFetch }: { authFetch: ReturnType<typeof useAuth>['authFetch'] }) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargandoCitas, setCargandoCitas] = useState(true);

  useEffect(() => {
    setCargandoCitas(true);
    authFetch('/citas/mias')
      .then(res => res.json())
      .then(data => setCitas(Array.isArray(data) ? data : []))
      .catch(() => setCitas([]))
      .finally(() => setCargandoCitas(false));
  }, [authFetch]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="text-foreground font-bold uppercase tracking-wide text-sm">Mis Citas</h2>
        <span className="ml-auto text-muted-foreground text-xs">
          {citas.length} cita{citas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {cargandoCitas ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : citas.length > 0 ? (
        <div className="divide-y divide-border">
          {citas.map(cita => (
            <div key={cita.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Scissors className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-foreground font-bold text-sm">{cita.servicio}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatearFecha(cita.fecha)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {cita.hora_inicio.slice(0, 5)}
                  </span>
                </div>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border shrink-0 w-fit ${ESTADO_ESTILOS[cita.estado]}`}>
                {ESTADO_LABEL[cita.estado]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6">
          <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-foreground font-bold mb-1">Aún no tienes citas</p>
          <p className="text-muted-foreground text-sm mb-6">Agenda tu próxima visita en un par de clics</p>
          <Link
            to="/citas"
            className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 font-bold uppercase tracking-wide text-sm"
          >
            <Calendar className="w-4 h-4" />
            Agendar Cita
          </Link>
        </div>
      )}
    </div>
  );
}