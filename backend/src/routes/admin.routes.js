import { Router } from 'express';
import { pool } from '../config/db.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import { expirarPendientesVencidas } from '../services/disponibilidad.js';

const router = Router();
router.use(verificarToken, verificarAdmin);

// ---------- Citas ----------

async function adjuntarServicios(citas) {
  if (citas.length === 0) return citas;
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
  return citas.map(c => ({ ...c, servicios: porCita[c.id] || [] }));
}

// Lista de citas para el panel. ?estado=pendiente para filtrar (ej. la
// bandeja principal), sin filtro devuelve todas (para una vista de agenda).
router.get('/citas', async (req, res) => {
  const { estado } = req.query;
  try {
    await expirarPendientesVencidas(pool);
    let sql = `SELECT id, usuario_id, nombre_cliente, telefono_cliente, fecha, hora_inicio, hora_fin,
                      estado, comentarios, creado_en
               FROM citas`;
    const params = [];
    if (estado) {
      sql += ' WHERE estado = ?';
      params.push(estado);
    }
    sql += ' ORDER BY fecha ASC, hora_inicio ASC';
    const [citas] = await pool.query(sql, params);
    res.json(await adjuntarServicios(citas));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
});

// Detalle de una cita puntual — es lo que abre el enlace directo que llega
// por WhatsApp (https://.../admin/cita/:id), para aceptar/rechazar con un clic.
router.get('/citas/:id', async (req, res) => {
  try {
    await expirarPendientesVencidas(pool);
    const [rows] = await pool.query(
      `SELECT id, usuario_id, nombre_cliente, telefono_cliente, fecha, hora_inicio, hora_fin,
              estado, comentarios, creado_en
       FROM citas WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });
    const [conServicios] = await adjuntarServicios(rows);
    res.json(conServicios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la cita' });
  }
});

// Aceptar o rechazar una pre-reserva pendiente.
router.patch('/citas/:id/estado', async (req, res) => {
  const { estado } = req.body;
  if (!['confirmada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ error: "El estado debe ser 'confirmada' o 'rechazada'" });
  }
  try {
    await expirarPendientesVencidas(pool);
    const [actual] = await pool.query('SELECT estado FROM citas WHERE id = ?', [req.params.id]);
    if (actual.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });
    if (actual[0].estado !== 'pendiente') {
      return res.status(409).json({ error: `Esta cita ya está en estado "${actual[0].estado}", no se puede modificar` });
    }
    await pool.query('UPDATE citas SET estado = ? WHERE id = ?', [estado, req.params.id]);
    res.json({ mensaje: estado === 'confirmada' ? 'Cita confirmada' : 'Cita rechazada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la cita' });
  }
});

// ---------- Días cerrados (ausencias / vacaciones de la dueña) ----------
// Solo se manejan cierres de DÍA COMPLETO desde el panel (hora_inicio/hora_fin
// en NULL); los bloqueos parciales (ej. la hora de comida) siguen siendo
// cosa de editar directo la tabla `horarios`/`dias_cerrados` si algún día
// se necesita, no hay UI para eso todavía.

router.get('/dias-cerrados', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, fecha, motivo FROM dias_cerrados
       WHERE hora_inicio IS NULL AND hora_fin IS NULL AND fecha >= CURDATE()
       ORDER BY fecha ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los días cerrados' });
  }
});

router.post('/dias-cerrados', async (req, res) => {
  const { fecha, motivo } = req.body;
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Fecha inválida' });
  }
  try {
    const [existente] = await pool.query(
      'SELECT id FROM dias_cerrados WHERE fecha = ? AND hora_inicio IS NULL AND hora_fin IS NULL',
      [fecha]
    );
    if (existente.length > 0) {
      return res.status(409).json({ error: 'Ese día ya está marcado como cerrado' });
    }
    const [resultado] = await pool.query(
      'INSERT INTO dias_cerrados (fecha, hora_inicio, hora_fin, motivo) VALUES (?, NULL, NULL, ?)',
      [fecha, motivo?.trim() || null]
    );
    res.status(201).json({ id: resultado.insertId, fecha, motivo: motivo?.trim() || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cerrar el día' });
  }
});

router.delete('/dias-cerrados/:id', async (req, res) => {
  try {
    const [resultado] = await pool.query('DELETE FROM dias_cerrados WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Día reabierto' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reabrir el día' });
  }
});

// ---------- Mensajes de contacto ----------

router.get('/mensajes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mensajes_contacto ORDER BY creado_en DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
});

router.patch('/mensajes/:id/leido', async (req, res) => {
  const { leido } = req.body;
  if (typeof leido !== 'boolean') {
    return res.status(400).json({ error: 'El campo leido debe ser true o false' });
  }
  try {
    const [resultado] = await pool.query('UPDATE mensajes_contacto SET leido = ? WHERE id = ?', [leido ? 1 : 0, req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json({ mensaje: 'Mensaje actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el mensaje' });
  }
});

router.delete('/mensajes/:id', async (req, res) => {
  try {
    const [resultado] = await pool.query('DELETE FROM mensajes_contacto WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json({ mensaje: 'Mensaje eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el mensaje' });
  }
});

export default router;
