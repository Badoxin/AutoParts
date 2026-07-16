import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

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
function formatearCorta(iso: string) {
  return parseISO(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface DatePickerFieldProps {
  value: string;                 // ISO "YYYY-MM-DD" o ''
  onChange: (fecha: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
}

export function DatePickerField({ value, onChange, minDate, maxDate, placeholder = 'dd/mm/aaaa' }: DatePickerFieldProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [mesVisible, setMesVisible] = useState(() => parseISO(value || minDate || toISO(new Date())));

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, []);

  const min = minDate ? parseISO(minDate) : null;
  const max = maxDate ? parseISO(maxDate) : null;

  const puedeRetroceder = !min || new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 0) >= new Date(min.getFullYear(), min.getMonth(), 1);
  const puedeAvanzar = !max || new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1) <= new Date(max.getFullYear(), max.getMonth(), max.getDate());

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

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto(o => !o)}
        className="flex items-center justify-between gap-3 bg-muted border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary text-sm text-left"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{value ? formatearCorta(value) : placeholder}</span>
        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute z-50 mt-2 bg-card border border-border rounded-xl p-4 shadow-xl w-72"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => puedeRetroceder && setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}
              disabled={!puedeRetroceder}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
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
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-muted-foreground text-xs font-bold py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {celdas.map(({ fecha: d, delMes }) => {
              const iso = toISO(d);
              const deshabilitado = (minDate && iso < minDate) || (maxDate && iso > maxDate);
              const seleccionado = iso === value;
              const esHoy = iso === toISO(new Date());
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => { if (!deshabilitado) { onChange(iso); setAbierto(false); } }}
                  disabled={!!deshabilitado}
                  className={`aspect-square rounded-lg text-sm font-semibold transition-colors ${
                    seleccionado
                      ? 'bg-primary text-foreground'
                      : deshabilitado || !delMes
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : esHoy
                      ? 'border border-primary text-foreground hover:bg-muted'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}