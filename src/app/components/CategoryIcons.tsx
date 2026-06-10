interface IconProps {
  className?: string;
}

export function FrenosIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Disco de freno */}
      <circle cx="32" cy="32" r="26" />
      <circle cx="32" cy="32" r="18" />
      <circle cx="32" cy="32" r="6" />
      {/* Ventilaciones */}
      <line x1="32" y1="14" x2="32" y2="20" />
      <line x1="32" y1="44" x2="32" y2="50" />
      <line x1="14" y1="32" x2="20" y2="32" />
      <line x1="44" y1="32" x2="50" y2="32" />
      <line x1="19.5" y1="19.5" x2="23.7" y2="23.7" />
      <line x1="40.3" y1="40.3" x2="44.5" y2="44.5" />
      <line x1="44.5" y1="19.5" x2="40.3" y2="23.7" />
      <line x1="23.7" y1="40.3" x2="19.5" y2="44.5" />
      {/* Tornillos */}
      <circle cx="32" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="32" cy="54" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="32" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="54" cy="32" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MotorIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Bloque motor */}
      <rect x="10" y="20" width="44" height="28" rx="3" />
      {/* Cabeza */}
      <rect x="14" y="14" width="36" height="8" rx="2" />
      {/* Pistones */}
      <rect x="18" y="24" width="8" height="12" rx="1" />
      <rect x="28" y="24" width="8" height="12" rx="1" />
      <rect x="38" y="24" width="8" height="12" rx="1" />
      {/* Válvulas */}
      <line x1="22" y1="14" x2="22" y2="20" />
      <line x1="32" y1="14" x2="32" y2="20" />
      <line x1="42" y1="14" x2="42" y2="20" />
      {/* Carter */}
      <path d="M10 48 Q32 56 54 48" />
      {/* Bujia */}
      <line x1="22" y1="8" x2="22" y2="14" />
      <circle cx="22" cy="7" r="2" />
    </svg>
  );
}

export function SuspensionIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Amortiguador - tubo exterior */}
      <rect x="27" y="4" width="10" height="36" rx="5" />
      {/* Tubo interior */}
      <rect x="29" y="30" width="6" height="22" rx="3" />
      {/* Resorte helicoidal */}
      <path d="M22 12 Q18 15 22 18 Q26 21 22 24 Q18 27 22 30 Q26 33 22 36" strokeWidth="2.5" />
      {/* Tope superior */}
      <ellipse cx="32" cy="6" rx="8" ry="3" />
      {/* Base */}
      <ellipse cx="32" cy="52" rx="6" ry="2.5" />
      {/* Brazo */}
      <line x1="32" y1="52" x2="48" y2="58" strokeWidth="2.5" />
      <circle cx="49" cy="58" r="3" />
    </svg>
  );
}

export function BateriasIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Cuerpo batería */}
      <rect x="8" y="20" width="48" height="34" rx="3" />
      {/* Tapa */}
      <rect x="8" y="16" width="48" height="6" rx="2" />
      {/* Terminal positivo */}
      <rect x="16" y="10" width="8" height="8" rx="1.5" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="20" y1="11" x2="20" y2="13" />
      {/* Terminal negativo */}
      <rect x="40" y="10" width="8" height="8" rx="1.5" />
      <line x1="42" y1="12" x2="46" y2="12" />
      {/* Celdas */}
      <line x1="20" y1="26" x2="20" y2="48" />
      <line x1="28" y1="26" x2="28" y2="48" />
      <line x1="36" y1="26" x2="36" y2="48" />
      <line x1="44" y1="26" x2="44" y2="48" />
      {/* Texto indicador */}
      <line x1="12" y1="37" x2="16" y2="37" />
    </svg>
  );
}

export function LlantasIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Llanta exterior */}
      <circle cx="32" cy="32" r="27" strokeWidth="5" />
      {/* Rin */}
      <circle cx="32" cy="32" r="18" />
      {/* Centro */}
      <circle cx="32" cy="32" r="5" />
      {/* Rayos */}
      <line x1="32" y1="27" x2="32" y2="14" />
      <line x1="32" y1="37" x2="32" y2="50" />
      <line x1="27" y1="32" x2="14" y2="32" />
      <line x1="37" y1="32" x2="50" y2="32" />
      <line x1="28.5" y1="28.5" x2="19.4" y2="19.4" />
      <line x1="35.5" y1="35.5" x2="44.6" y2="44.6" />
      <line x1="35.5" y1="28.5" x2="44.6" y2="19.4" />
      <line x1="28.5" y1="35.5" x2="19.4" y2="44.6" />
      {/* Tornillos del rin */}
      <circle cx="32" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="32" cy="48" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="32" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="48" cy="32" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}