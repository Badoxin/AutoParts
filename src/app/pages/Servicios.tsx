import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { ServicioBanner, descripcionPara } from '../components/ServicioBanner';
import { Clock, Plus } from 'lucide-react';

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  duracion: number;
}

// Mismo respaldo que en Home: se usa solo si /api/servicios no responde
// (por ejemplo, backend apagado), para que la página nunca se vea vacía.
// Refleja la lista real de precios/duraciones de Dayandi.
const SERVICIOS_RESPALDO: Servicio[] = [
  { id: -1, nombre: 'Corte con desvanecido', precio: 150, duracion: 90 },
  { id: -2, nombre: 'Corte mujer',           precio: 150, duracion: 20 },
  { id: -3, nombre: 'Barba',                 precio: 50,  duracion: 20 },
  { id: -4, nombre: 'Tinte',                 precio: 450, duracion: 60 },
  { id: -5, nombre: 'Permanente',            precio: 500, duracion: 120 },
  { id: -6, nombre: 'Peinado y maquillaje',  precio: 400, duracion: 40 },
];

function formatearDuracion(minutos: number) {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

export function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/servicios')
      .then((res) => res.json())
      .then((data: Servicio[]) => {
        const lista = Array.isArray(data) && data.length > 0 ? data : SERVICIOS_RESPALDO;
        setServicios(lista);
      })
      .catch(() => {
        setServicios(SERVICIOS_RESPALDO);
      })
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Servicios' }]} />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center">
        <p className="eyebrow text-muted-foreground mb-3 tracking-[0.2em] uppercase text-xs">
          Dayandi · Estética Unisex
        </p>
        <h1 className="text-foreground text-4xl md:text-5xl font-serif">Nuestros servicios</h1>
        <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-lg">
          Elige tu experiencia Dayandi. Calidad, estilo y atención personalizada en cada visita.
        </p>
      </section>

      {cargando && (
        <p className="text-center text-muted-foreground py-16">Cargando servicios…</p>
      )}

      {!cargando && servicios.length === 0 && (
        <p className="text-center text-muted-foreground py-16">
          Todavía no hay servicios cargados.
        </p>
      )}

      {!cargando && servicios.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 items-start">
            {servicios.map((servicio) => {
              const estaAbierto = abierto === servicio.id;
              return (
                <button
                  key={servicio.id}
                  type="button"
                  onClick={() => setAbierto(estaAbierto ? null : servicio.id)}
                  aria-expanded={estaAbierto}
                  className={`group w-full text-left rounded-xl overflow-hidden bg-card border transition-all duration-300 ease-out
                    hover:-translate-y-1.5 hover:shadow-lg
                    ${estaAbierto ? 'border-primary/50 shadow-lg -translate-y-1.5' : 'border-border shadow-sm'}`}
                >
                  <div className="relative">
                    <ServicioBanner nombre={servicio.nombre} variant="card" className="w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-foreground text-lg font-serif tracking-wide">
                        {servicio.nombre}
                      </h3>
                      <span
                        className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-primary/30 text-primary transition-transform duration-300 ${
                          estaAbierto ? 'rotate-45 bg-primary/10' : ''
                        }`}
                      >
                        <Plus size={14} strokeWidth={2} />
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <Clock size={14} strokeWidth={1.5} />
                        {formatearDuracion(servicio.duracion)}
                      </span>
                      <span className="text-highlight text-lg">${servicio.precio}</span>
                    </div>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        estaAbierto ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-muted-foreground text-sm border-t border-border pt-3">
                          {descripcionPara(servicio.nombre)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
