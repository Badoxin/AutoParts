import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      // Antes iba de opacity 0 -> 1 (y viceversa al salir), lo que dejaba ver
      // de golpe el fondo crema del <body> a través del hueco y se sentía
      // como un "parpadeo". Acortamos el rango (0.55 -> 1) y el tiempo para
      // que el cambio sea apenas perceptible, más un settle que un fade.
      initial={{ opacity: 0.55 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.55 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
