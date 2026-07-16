import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock } from 'lucide-react';

function formatearHora12(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const periodo = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${periodo}`;
}

interface TimePickerFieldProps {
  value: string; // "HH:MM"
  onChange: (hora: string) => void;
  stepMinutes?: number; // default 30
  placeholder?: string;
}

export function TimePickerField({ value, onChange, stepMinutes = 30, placeholder = 'Elige una hora' }: TimePickerFieldProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, []);

  const opciones = useMemo(() => {
    const lista: string[] = [];
    for (let mins = 0; mins < 24 * 60; mins += stepMinutes) {
      const h = Math.floor(mins / 60).toString().padStart(2, '0');
      const m = (mins % 60).toString().padStart(2, '0');
      lista.push(`${h}:${m}`);
    }
    return lista;
  }, [stepMinutes]);

  useEffect(() => {
    if (abierto && listaRef.current) {
      const seleccionado = listaRef.current.querySelector('[data-seleccionado="true"]');
      seleccionado?.scrollIntoView({ block: 'center' });
    }
  }, [abierto]);

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto(o => !o)}
        className="flex items-center justify-between gap-3 bg-muted border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary text-sm text-left w-full"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{value ? formatearHora12(value) : placeholder}</span>
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute z-50 mt-2 bg-card border border-border rounded-xl shadow-xl w-40"
        >
          <div ref={listaRef} className="max-h-56 overflow-y-auto py-1">
            {opciones.map(hhmm => (
              <button
                key={hhmm}
                type="button"
                data-seleccionado={hhmm === value}
                onClick={() => { onChange(hhmm); setAbierto(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  hhmm === value ? 'bg-primary text-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {formatearHora12(hhmm)}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}