import { createHmac } from 'crypto';
import { JWT_SECRET } from '../config/constants.js';

// Token corto y determinista por cita (no se guarda en la BD, se recalcula).
// Sirve para que el link que llega por WhatsApp pueda aceptar/rechazar esa
// cita puntual SIN necesitar sesión iniciada — pero nadie puede adivinarlo
// ni actuar sobre otra cita, porque depende del JWT_SECRET del servidor.
export function generarTokenCita(citaId) {
  return createHmac('sha256', JWT_SECRET).update(String(citaId)).digest('hex').slice(0, 20);
}

export function tokenCitaValido(citaId, token) {
  return typeof token === 'string' && token.length > 0 && token === generarTokenCita(citaId);
}
