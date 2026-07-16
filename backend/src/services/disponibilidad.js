import { PASO_MINUTOS } from '../config/constants.js';
import { hhmmToMin, minToHHMM, seOverlapan, diaSemanaDe, fechaHoyStr } from '../utils/fechas.js';

// Marca como 'expirada' cualquier cita 'pendiente' cuyo tiempo de espera ya
// se cumplió. Se llama "al vuelo" (aquí, antes de calcular disponibilidad o
// de listar citas en el panel de admin) en vez de depender de un proceso en
// segundo plano — así no se necesita un cron corriendo aparte en el VPS.
export async function expirarPendientesVencidas(conn) {
  await conn.query(
    `UPDATE citas SET estado = 'expirada'
     WHERE estado = 'pendiente' AND expira_en IS NOT NULL AND expira_en < NOW()`
  );
}

// Bloques de horario del negocio para un día de la semana (0=domingo..6=sábado).
export async function obtenerBloquesHorario(conn, diaSemana) {
  const [rows] = await conn.query(
    'SELECT hora_inicio, hora_fin, tolerancia_cierre_min FROM horarios WHERE dia_semana = ? ORDER BY hora_inicio',
    [diaSemana]
  );
  return rows;
}

// Cierres puntuales para una fecha (día festivo completo o bloqueo parcial, ej. comida).
export async function obtenerCierresDelDia(conn, fecha) {
  const [rows] = await conn.query(
    'SELECT hora_inicio, hora_fin FROM dias_cerrados WHERE fecha = ?',
    [fecha]
  );
  return rows;
}

async function obtenerOcupados(conn, fecha, excluirCitaId = null) {
  const params = [fecha];
  // 'pendiente' también cuenta como ocupado: mientras espera respuesta del
  // admin, ese horario queda apartado y nadie más puede tomarlo.
  let sql = "SELECT hora_inicio, hora_fin FROM citas WHERE fecha = ? AND estado IN ('pendiente','confirmada')";
  if (excluirCitaId) {
    sql += ' AND id <> ?';
    params.push(excluirCitaId);
  }
  const [citas] = await conn.query(sql, params);
  return citas.map(o => ({ inicio: hhmmToMin(o.hora_inicio), fin: hhmmToMin(o.hora_fin) }));
}

// Devuelve un arreglo de horas "HH:MM:SS" libres para una fecha y una
// duración total en minutos (la suma de los servicios elegidos).
export async function calcularDisponibilidad(conn, fecha, duracionMin, excluirCitaId = null) {
  await expirarPendientesVencidas(conn);

  const diaSemana = diaSemanaDe(fecha);
  const bloques = await obtenerBloquesHorario(conn, diaSemana);
  if (bloques.length === 0) return [];

  const cierresDia = await obtenerCierresDelDia(conn, fecha);
  // Cierre de día completo: viene con hora_inicio/hora_fin en NULL.
  if (cierresDia.some(c => c.hora_inicio === null && c.hora_fin === null)) return [];
  const bloqueosParciales = cierresDia
    .filter(c => c.hora_inicio !== null && c.hora_fin !== null)
    .map(c => ({ inicio: hhmmToMin(c.hora_inicio), fin: hhmmToMin(c.hora_fin) }));

  const ocupados = await obtenerOcupados(conn, fecha, excluirCitaId);

  const esHoy = fecha === fechaHoyStr();
  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  const disponibles = [];
  for (const bloque of bloques) {
    const inicioBloque = hhmmToMin(bloque.hora_inicio);
    // La "regla de cierre": se acepta que la cita termine hasta
    // tolerancia_cierre_min después de la hora_fin nominal del bloque.
    const limiteFin = hhmmToMin(bloque.hora_fin) + bloque.tolerancia_cierre_min;

    for (let inicio = inicioBloque; inicio + duracionMin <= limiteFin; inicio += PASO_MINUTOS) {
      if (esHoy && inicio <= minutosAhora) continue;
      const fin = inicio + duracionMin;
      const chocaOcupado = ocupados.some(o => seOverlapan(inicio, fin, o.inicio, o.fin));
      const chocaCierre = bloqueosParciales.some(o => seOverlapan(inicio, fin, o.inicio, o.fin));
      if (!chocaOcupado && !chocaCierre) disponibles.push(minToHHMM(inicio));
    }
  }
  return [...new Set(disponibles)].sort();
}
