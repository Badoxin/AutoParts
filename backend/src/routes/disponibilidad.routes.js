import { Router } from 'express';
import { pool } from '../config/db.js';
import { calcularDisponibilidad } from '../services/disponibilidad.js';

const router = Router();

// GET /api/disponibilidad?servicios=1,3&fecha=2026-07-20
// `servicios` es una lista de ids separados por coma (el cliente puede elegir
// varios). El sistema suma sus duraciones antes de calcular los horarios libres.
router.get('/disponibilidad', async (req, res) => {
  const { servicios, fecha } = req.query;

  if (!servicios || !fecha) {
    return res.status(400).json({ error: 'servicios y fecha son obligatorios' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido' });
  }

  const idsServicios = String(servicios)
    .split(',')
    .map(s => Number(s.trim()))
    .filter(Boolean);
  if (idsServicios.length === 0) {
    return res.status(400).json({ error: 'Debes elegir al menos un servicio' });
  }

  try {
    const placeholders = idsServicios.map(() => '?').join(',');
    const [servicioRows] = await pool.query(
      `SELECT id, duracion FROM servicios WHERE id IN (${placeholders}) AND activo = 1`,
      idsServicios
    );
    if (servicioRows.length !== idsServicios.length) {
      return res.status(404).json({ error: 'Uno o más servicios no existen o ya no están disponibles' });
    }
    const duracionTotal = servicioRows.reduce((total, s) => total + s.duracion, 0);

    const horas = await calcularDisponibilidad(pool, fecha, duracionTotal);
    res.json({ horas, duracionTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular disponibilidad' });
  }
});

// GET /api/dias-cerrados?desde=2026-07-01&hasta=2026-07-31
// Pública, de solo lectura: devuelve las fechas que la dueña marcó como
// cerradas TODO el día (no incluye bloqueos parciales tipo "comida"), para
// que el cliente las vea marcadas/deshabilitadas en el calendario de /citas
// en vez de encontrarse un "no hay horarios" sin explicación.
router.get('/dias-cerrados', async (req, res) => {
  const { desde, hasta } = req.query;
  if (!desde || !hasta) {
    return res.status(400).json({ error: 'desde y hasta son obligatorios' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT fecha, motivo FROM dias_cerrados
       WHERE fecha BETWEEN ? AND ? AND hora_inicio IS NULL AND hora_fin IS NULL
       ORDER BY fecha`,
      [desde, hasta]
    );
    res.json(rows.map(r => ({ fecha: r.fecha, motivo: r.motivo })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los días cerrados' });
  }
});

export default router;
