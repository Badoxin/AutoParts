import { useState } from 'react';
import { Scissors, Palette, Sparkles, Footprints, Wind, Wand2, Slice, type LucideIcon } from 'lucide-react';

// Convierte "Corte de cabello" -> "corte-de-cabello" para buscar la imagen en
// /public/gallery/servicios/{slug}.jpg. Cuando subas fotos reales del salón,
// solo tienen que llamarse igual que el nombre del servicio en la BD.
function slugificar(nombre: string) {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Ícono representativo por tipo de servicio, para el placeholder mientras no
// hay foto. Es solo una guía visual, no depende de datos reales del backend.
function iconoPara(nombre: string): LucideIcon {
  const n = nombre.toLowerCase();
  if (n.includes('tinte') || n.includes('color')) return Palette;
  if (n.includes('manicure') || n.includes('uña')) return Sparkles;
  if (n.includes('pedicure')) return Footprints;
  if (n.includes('permanente')) return Wind;
  if (n.includes('maquillaje')) return Wand2;
  if (n.includes('peinado')) return Wand2;
  if (n.includes('barba')) return Slice;
  if (n.includes('corte')) return Scissors;
  return Sparkles;
}

// Descripción genérica por categoría, mientras el negocio no tenga una
// descripción propia guardada en la BD para cada servicio.
export function descripcionPara(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes('tinte') || n.includes('color')) return 'Color a tu medida, con productos profesionales y acabado uniforme.';
  if (n.includes('manicure') || n.includes('uña')) return 'Cuidado completo de manos y uñas, con acabado prolijo.';
  if (n.includes('pedicure')) return 'Cuidado y relajación para tus pies, de principio a fin.';
  if (n.includes('permanente')) return 'Ondas duraderas con un acabado natural, pensadas para tu tipo de cabello.';
  if (n.includes('maquillaje')) return 'Peinado y maquillaje profesional para ocasiones especiales.';
  if (n.includes('peinado')) return 'Un peinado impecable para cualquier ocasión especial.';
  if (n.includes('corte') && n.includes('barba')) return 'Corte y arreglo de barba en una sola visita, con acabado parejo.';
  if (n.includes('barba')) return 'Arreglo y perfilado de barba, con acabado preciso.';
  if (n.includes('corte')) return 'Un corte pensado a tu medida, con acabado profesional.';
  return 'Un servicio pensado para que salgas renovada.';
}

interface ServicioBannerProps {
  nombre: string;
  variant?: 'card' | 'hero';
  className?: string;
}

export function ServicioBanner({ nombre, variant = 'card', className = '' }: ServicioBannerProps) {
  const [fallo, setFallo] = useState(false);
  const Icono = iconoPara(nombre);
  const src = `/gallery/servicios/${slugificar(nombre)}.jpg`;
  const alturaClase = variant === 'hero' ? 'aspect-[21/9]' : 'aspect-[4/3]';

  if (fallo) {
    return (
      <div
        className={`${alturaClase} ${className} flex items-center justify-center bg-gradient-to-br from-secondary to-muted`}
      >
        <Icono
          className="text-primary/40"
          strokeWidth={1}
          size={variant === 'hero' ? 56 : 36}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={nombre}
      onError={() => setFallo(true)}
      className={`${alturaClase} ${className} object-cover`}
    />
  );
}
