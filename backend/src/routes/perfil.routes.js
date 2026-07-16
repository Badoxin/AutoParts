import { Router } from 'express';
import { pool } from '../config/db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, correo, telefono, rol, creado_en FROM usuarios WHERE id = ?',
      [req.usuarioId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
});

router.put('/perfil', verificarToken, async (req, res) => {
  const { nombre, telefono } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (telefono && !/^\d{10}$/.test(telefono)) {
    return res.status(400).json({ error: 'El teléfono debe tener exactamente 10 dígitos' });
  }
  try {
    await pool.query('UPDATE usuarios SET nombre = ?, telefono = ? WHERE id = ?', [nombre, telefono || null, req.usuarioId]);
    const [rows] = await pool.query('SELECT id, nombre, correo, telefono, rol FROM usuarios WHERE id = ?', [req.usuarioId]);
    res.json({ mensaje: 'Perfil actualizado', usuario: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

export default router;
