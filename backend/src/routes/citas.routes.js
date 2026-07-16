import { Router } from 'express';
import { pool } from '../config/db.js';
import { verificarToken } from '../middleware/auth.js';
import { EXPIRA_MINUTOS, DIAS_ANTICIPACION_MAX } from '../config/constants.js';
import { hhmmToMin, minToHHMM, fechaHoyStr, fechaMaximaStr } from '../utils/fechas.js';
import { calcularDisponibilidad, expirarPendientesVencidas } from '../services/disponibilidad.js';

const router = Router();

// ---------- Reglas de combinación de servicios ----------
// La misma lógica vive también en el frontend (Citas.tsx) para guiar al
// cliente mientras elige, pero se repite aquí porque el frontend nunca es
// una barrera de seguridad real.
function validarCombinacion(servicioRows) {
  const categorias = servicioRows.map(s => s.categoria || 'otro');

  const exclusivos = categorias.filter(c => c === 'exclusivo').length;
  if (exclusivos > 0 && servicioRows.length > 1) {
    return 'Ese servicio no se puede combinar con otros — agéndalo solo';
  }

  if (categorias.includes('corte_hombre') && categorias.includes('corte_mujer')) {
    return 'No puedes combinar corte de hombre con corte de mujer en la misma cita';
  }

  const maxPermitido = categorias.includes('color') ? 3 : 2;
  if (servicioRows.length > maxPermitido) {
    return categorias.includes('color')
      ? 'Como máximo se pueden combinar 3 servicios (incluyendo el tinte)'
      : 'Como máximo se pueden combinar 2 servicios por cita';
  }

  return null;
}

// Citas del cliente logueado.
router.get('/citas/mias', verificarToken, async (req, res) => {
  try {
    await expirarPendientesVencidas(pool);
    const [citas] = await pool.query(
      `SELECT id, fecha, hora_inicio, hora_fin, estado, comentarios, creado_en
       FROM citas WHERE usuario_id = ? ORDER BY fecha DESC, hora_inicio DESC`,
      [req.usuarioId]
    );
    if (citas.length === 0) return res.json([]);

    const ids = citas.map(c => c.id);
    const placeholders = ids.map(() => '?').join(',');
    const [servicios] = await pool.query(
      `SELECT cs.cita_id, s.nombre, cs.precio_en_cita, cs.duracion_en_cita
       FROM cita_servicios cs JOIN servicios s ON s.id = cs.servicio_id
       WHERE cs.cita_id IN (${placeholders})`,
      ids
    );
    const porCita = {};
    for (const s of servicios) {
      (porCita[s.cita_id] ||= []).push({ nombre: s.nombre, precio: s.precio_en_cita, duracion: s.duracion_en_cita });
    }
    res.json(citas.map(c => ({ ...c, servicios: porCita[c.id] || [] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
});

// Crea una pre-reserva. AHORA REQUIERE CUENTA (verificarToken) — ya no se
// puede agendar como invitado, por seguridad y para evitar el problema de
// que alguien sin cuenta se quedara "atorado" sin poder agendar otra vez.
router.post('/citas', verificarToken, async (req, res) => {
  const { servicios, fecha, horaInicio, nombreCliente, telefonoCliente, comentarios } = req.body;

  if (!Array.isArray(servicios) || servicios.length === 0) {
    return res.status(400).json({ error: 'Debes elegir al menos un servicio' });
  }
  if (!fecha || !horaInicio || !nombreCliente || !telefonoCliente) {
    return res.status(400).json({ error: 'Fecha, hora, nombre y teléfono son obligatorios' });
  }
  if (!/^\d{10}$/.test(telefonoCliente)) {
    return res.status(400).json({ error: 'El teléfono debe tener exactamente 10 dígitos' });
  }
  if (fecha < fechaHoyStr()) {
    return res.status(400).json({ error: 'No se pueden agendar citas en fechas pasadas' });
  }
  if (fecha > fechaMaximaStr()) {
    return res.status(400).json({ error: `Solo se pueden agendar citas hasta ${DIAS_ANTICIPACION_MAX} días por adelantado` });
  }

  const conn = await pool.getConnection();
  try {
    // El token ya viene verificado por el middleware, pero por si la base
    // se reinstaló y el usuario_id del token ya no existe, lo confirmamos.
    const [usuarioExiste] = await conn.query('SELECT id FROM usuarios WHERE id = ?', [req.usuarioId]);
    if (usuarioExiste.length === 0) {
      conn.release();
      return res.status(401).json({ error: 'Tu sesión ya no es válida, vuelve a iniciar sesión' });
    }
    const usuarioId = req.usuarioId;

    // Anti-spam: si ya tiene una cita pendiente o confirmada, no puede
    // apartar otra hasta que esa se resuelva.
    await expirarPendientesVencidas(conn);
    const [activas] = await conn.query(
      `SELECT id, estado, fecha, hora_inicio FROM citas
       WHERE estado IN ('pendiente','confirmada')
         AND fecha >= ?
         AND usuario_id = ?
       ORDER BY fecha ASC, hora_inicio ASC LIMIT 1`,
      [fechaHoyStr(), usuarioId]
    );
    if (activas.length > 0) {
      conn.release();
      const c = activas[0];
      const estadoTexto = c.estado === 'pendiente' ? 'está pendiente de confirmación' : 'ya está confirmada';
      return res.status(409).json({
        error: `Ya tienes una cita que ${estadoTexto} (${c.fecha} ${c.hora_inicio.slice(0, 5)}). ` +
          `Espera a que se resuelva antes de agendar otra.`,
      });
    }

    const placeholders = servicios.map(() => '?').join(',');
    const [servicioRows] = await conn.query(
      `SELECT id, nombre, precio, duracion, categoria FROM servicios WHERE id IN (${placeholders}) AND activo = 1`,
      servicios
    );
    if (servicioRows.length !== servicios.length) {
      conn.release();
      return res.status(404).json({ error: 'Uno o más servicios no existen o ya no están disponibles' });
    }

    const errorCombinacion = validarCombinacion(servicioRows);
    if (errorCombinacion) {
      conn.release();
      return res.status(400).json({ error: errorCombinacion });
    }

    const duracionTotal = servicioRows.reduce((total, s) => total + s.duracion, 0);
    const inicioMin = hhmmToMin(horaInicio);
    const horaFin = minToHHMM(inicioMin + duracionTotal);

    await conn.beginTransaction();
    await conn.query('SELECT id FROM citas WHERE fecha = ? FOR UPDATE', [fecha]);

    const libres = await calcularDisponibilidad(conn, fecha, duracionTotal);
    if (!libres.includes(minToHHMM(inicioMin))) {
      await conn.rollback();
      conn.release();
      return res.status(409).json({ error: 'Ese horario ya no está disponible, elige otro' });
    }

    const [resultado] = await conn.query(
      `INSERT INTO citas
         (usuario_id, nombre_cliente, telefono_cliente, fecha, hora_inicio, hora_fin, estado, comentarios, expira_en)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [usuarioId, nombreCliente, telefonoCliente, fecha, minToHHMM(inicioMin), horaFin, comentarios || null, EXPIRA_MINUTOS]
    );
    const citaId = resultado.insertId;

    for (const s of servicioRows) {
      await conn.query(
        'INSERT INTO cita_servicios (cita_id, servicio_id, precio_en_cita, duracion_en_cita) VALUES (?, ?, ?, ?)',
        [citaId, s.id, s.precio, s.duracion]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({
      mensaje: 'Pre-reserva creada con éxito',
      cita: {
        id: citaId,
        fecha,
        horaInicio: minToHHMM(inicioMin),
        horaFin,
        servicios: servicioRows.map(s => ({ nombre: s.nombre, precio: s.precio, duracion: s.duracion })),
      },
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ error: 'Error al agendar la cita' });
  }
});

export default router;