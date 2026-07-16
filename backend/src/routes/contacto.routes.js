import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

// Pública: cualquier visitante (con o sin sesión) puede enviar un mensaje.
router.post('/contacto', async (req, res) => {
  const { nombre, telefono, mensaje } = req.body;
  if (!nombre || !mensaje) {
    return res.status(400).json({ error: 'Nombre y mensaje son obligatorios' });
  }
  try {
    await pool.query(
      'INSERT INTO mensajes_contacto (nombre, telefono, mensaje) VALUES (?, ?, ?)',
      [nombre.trim(), telefono?.trim() || null, mensaje.trim()]
    );
    res.status(201).json({ mensaje: 'Mensaje enviado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

export default router;
