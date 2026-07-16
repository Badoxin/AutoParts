import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock, CalendarDays, Loader2, AlertCircle, CalendarOff } from 'lucide-react';

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function parseISO(iso: string) {
  return new Date(iso + 'T00:00:00');
}

interface CalendarTimePickerProps {
  fecha: string;                     // ISO "YYYY-MM-DD" seleccionada, o ''
  onFechaChange: (fecha: string) => void;
  minDate: string;                   // ISO
  maxDate: string;                   // ISO
  horas: string[];                   // "HH:MM:SS" o "HH:MM"
  horaSeleccionada: string;
  onHoraChange: (hora: string) => void;
  cargandoHoras: boolean;
  formatearHora: (hhmmss: string) => string;
  diasCerrados?: string[];           // fechas ISO en las que Dayandi no atiende (ausencia/vacaciones)
}

export function CalendarTimePicker({
  fecha, onFechaChange, minDate, maxDate,
  horas, horaSeleccionada, onHoraChange, cargandoHoras, formatearHora,
  diasCerrados = [],
}: CalendarTimePickerProps) {
  const min = parseISO(minDate);
  const max = parseISO(maxDate);
  const cerradoHoy = fecha !== '' && diasCerrados.includes(fecha);

  const [mesVisible, setMesVisible] = useState(() => {
    const base = fecha ? parseISO(fecha) : min;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const puedeRetroceder = useMemo(() => {
    const finAnterior = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 0);
    return finAnterior >= new Date(min.getFullYear(), min.getMonth(), 1);
  }, [mesVisible, min]);

  const puedeAvanzar = useMemo(() => {
    const inicioSiguiente = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1);
    return inicioSiguiente <= new Date(max.getFullYear(), max.getMonth(), max.getDate());
  }, [mesVisible, max]);

  const celdas = useMemo(() => {
    const primero = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    const offset = (primero.getDay() + 6) % 7; // 0 = Lunes
    const inicioGrid = new Date(primero);
    inicioGrid.setDate(primero.getDate() - offset);

    const dias: { fecha: Date; delMes: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicioGrid);
      d.setDate(inicioGrid.getDate() + i);
      dias.push({ fecha: d, delMes: d.getMonth() === mesVisible.getMonth() });
    }
    return dias;
  }, [mesVisible]);

  const fechaLarga = fecha
    ? parseISO(fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Calendario */}
      <div className="bg-muted/50 border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => puedeRetroceder && setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}
            disabled={!puedeRetroceder}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-foreground font-bold text-sm uppercase tracking-wide">
            {MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
          </p>
          <button
            type="button"
            onClick={() => puedeAvanzar && setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))}
            disabled={!puedeAvanzar}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-muted-foreground text-xs font-bold py-1">{d}</div>
          ))}
        </div>

        <motion.div
          key={`${mesVisible.getFullYear()}-${mesVisible.getMonth()}`}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="grid grid-cols-7 gap-1"
        >
          {celdas.map(({ fecha: d, delMes }) => {
            const iso = toISO(d);
            const esCerrado = diasCerrados.includes(iso);
            const deshabilitado = iso < minDate || iso > maxDate || esCerrado;
            const seleccionado = iso === fecha;
            const esHoy = iso === toISO(new Date());
            return (
              <button
                key={iso}
                type="button"
                onClick={() => !deshabilitado && onFechaChange(iso)}
                disabled={deshabilitado}
                title={esCerrado ? 'Dayandi cerrado ese día' : undefined}
                className={`aspect-square rounded-lg text-sm font-semibold transition-colors relative ${
                  seleccionado
                    ? 'bg-primary text-foreground'
                    : esCerrado && delMes
                    ? 'text-muted-foreground/40 line-through cursor-not-allowed'
                    : deshabilitado || !delMes
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : esHoy
                    ? 'border border-primary text-foreground hover:bg-secondary'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Horarios */}
      <div className="bg-muted/50 border border-border rounded-xl p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm font-semibold">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          {fecha ? <span className="capitalize">{fechaLarga}</span> : <span className="text-muted-foreground">Selecciona una fecha</span>}
        </div>

        <AnimatePresence mode="wait">
          {!fecha ? (
            <motion.div
              key="vacio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-8"
            >
              <CalendarDays className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground text-sm">Elige una fecha para ver horarios</p>
            </motion.div>
          ) : cargandoHoras ? (
            <motion.div
              key="cargando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex items-center justify-center py-10"
            >
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </motion.div>
          ) : cerradoHoy ? (
            <motion.div
              key="cerrado"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-muted-foreground text-sm bg-muted border border-border rounded-lg px-4 py-3"
            >
              <CalendarOff className="w-4 h-4 shrink-0 text-primary" />
              Dayandi está cerrado ese día — elige otra fecha
            </motion.div>
          ) : horas.length > 0 ? (
            <motion.div
              key="horas"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-3 gap-2 overflow-y-auto max-h-64 pr-1"
            >
              {horas.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onHoraChange(h.slice(0, 5))}
                  className={`py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                    horaSeleccionada === h.slice(0, 5)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card/60 text-muted-foreground hover:border-border'
                  }`}
                >
                  {formatearHora(h)}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="sin-horas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              No hay horarios disponibles ese día
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}