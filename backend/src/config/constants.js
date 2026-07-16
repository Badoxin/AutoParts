export const JWT_SECRET = process.env.JWT_SECRET || 'cambia_esto_en_produccion';
export const SALT_ROUNDS = 10;
export const PASO_MINUTOS = 30; // granularidad de los horarios que se ofrecen al cliente
export const DIAS_ANTICIPACION_MAX = 30; // no se puede agendar más allá de esta ventana
export const PORT = process.env.PORT || 3000;

// Minutos que una pre-reserva ("pendiente") se mantiene apartada esperando
// que el admin la acepte o rechace. Pasado este tiempo se marca "expirada"
// y el horario vuelve a estar disponible.
export const EXPIRA_MINUTOS = 15;
