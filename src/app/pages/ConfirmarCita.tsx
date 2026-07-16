import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle2, XCircle, AlertCircle, User, Phone, Calendar, Clock } from 'lucide-react';

interface DetalleCita {
  id: number;
  nombre_cliente: string;
  telefono_cliente: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  comentarios: string | null;
  servicios: { nombre: string; precio: number; duracion: number }[];
}

function formatearFechaLarga(fecha: string) {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Página a la que llega la dueña desde el link de WhatsApp: ve el detalle de
// la cita y con un clic la acepta o rechaza.
//
// YA NO es pública por token: ahora solo funciona si quien la abre tiene
// una sesión iniciada como administradora en ese navegador/celular. Si un
// cliente (o cualquier otra persona) toca el link, se le manda a Inicio sin
// ver ningún dato de la cita. Por eso Dalila necesita mantener su sesión
// iniciada en el navegador de su celular para poder usar el link.
export function ConfirmarCita() {
  const { id } = useParams();
  const { user, isLoading: cargandoSesion, authFetch } = useAuth();

  const [cita, setCita] = useState<DetalleCita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<'confirmada' | 'rechazada' | null>(null);

  const cargar = () => {
    setCargando(true);
    setError('');
    authFetch(`/admin/citas/${id}`)
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'No se pudo cargar la cita');
        setCita(data);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'No se pudo cargar la cita'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (user?.rol === 'admin' && id) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  // Mientras se resuelve si hay sesión guardada, no se decide nada todavía
  // (si no se espera esto, por un instante parecería que "no eres admin"
  // aunque sí tengas sesión, mientras se lee el localStorage).
  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  // Cualquiera que no sea la administradora logueada: fuera, directo a Inicio.
  if (!user || user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const accionar = async (estado: 'confirmada' | 'rechazada') => {
    setProcesando(true);
    setError('');
    try {
      const r = await authFetch(`/admin/citas/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'No se pudo actualizar la cita');
      setResultado(estado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la cita');
    } finally {
      setProcesando(false);
    }
  };

  const total = cita?.servicios.reduce((sum, s) => sum + Number(s.precio), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card border border-border rounded-2xl p-8">

          {cargando ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : resultado ? (
            <div className="text-center py-6">
              {resultado === 'confirmada' ? (
                <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
              ) : (
                <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
              )}
              <h1 className="text-foreground text-2xl mb-2">
                {resultado === 'confirmada' ? 'Cita confirmada' : 'Cita rechazada'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {resultado === 'confirmada'
                  ? 'Listo, el horario queda apartado para el cliente.'
                  : 'El horario vuelve a quedar disponible para otros clientes.'}
              </p>
              <Link to="/admin" className="inline-block mt-6 text-primary text-sm font-medium uppercase tracking-widest">
                Ir al Panel de Administrador
              </Link>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">No se pudo cargar</p>
              <p className="text-muted-foreground text-sm">{error}</p>
              <Link to="/admin" className="inline-block mt-6 text-primary text-sm font-medium uppercase tracking-widest">
                Ir al Panel de Administrador
              </Link>
            </div>
          ) : cita ? (
            <>
              <p className="eyebrow text-muted-foreground mb-2">Solicitud de cita</p>
              <h1 className="text-foreground text-2xl mb-6">
                {cita.estado === 'pendiente' ? '¿Aceptas esta cita?' : `Esta cita ya está ${cita.estado}`}
              </h1>

              <div className="space-y-3 mb-6">
                <p className="text-foreground font-medium">{cita.servicios.map(s => s.nombre).join(', ')}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar size={15} strokeWidth={1.5} /> {formatearFechaLarga(cita.fecha)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock size={15} strokeWidth={1.5} /> {cita.hora_inicio.slice(0, 5)} – {cita.hora_fin.slice(0, 5)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <User size={15} strokeWidth={1.5} /> {cita.nombre_cliente}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone size={15} strokeWidth={1.5} /> {cita.telefono_cliente}
                </div>
                {cita.comentarios && (
                  <p className="text-muted-foreground text-sm italic">"{cita.comentarios}"</p>
                )}
                <p className="text-primary font-medium">${total}</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {cita.estado === 'pendiente' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => accionar('rechazada')}
                    disabled={procesando}
                    className="btn-glow-soft flex-1 flex items-center justify-center gap-2 py-3 font-medium uppercase tracking-widest text-sm"
                  >
                    {procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Rechazar
                  </button>
                  <button
                    onClick={() => accionar('confirmada')}
                    disabled={procesando}
                    className="btn-glow flex-1 flex items-center justify-center gap-2 py-3 font-medium uppercase tracking-widest text-sm"
                  >
                    {procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Aceptar
                  </button>
                </div>
              )}
            </>
          ) : null}

        </div>
      </section>

      <Footer />
    </div>
  );
}