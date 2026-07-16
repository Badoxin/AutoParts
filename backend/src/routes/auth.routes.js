import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { SALT_ROUNDS } from '../config/constants.js';
import { sanitizarUsuario, generarToken } from '../utils/auth.js';

const router = Router();

router.post('/registro', async (req, res) => {
  const { nombre, correo, telefono, contrasena } = req.body;
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  }
  if (telefono && !/^\d{10}$/.test(telefono)) {
    return res.status(400).json({ error: 'El teléfono debe tener exactamente 10 dígitos' });
  }
  try {
    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existentes.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }
    const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);
    const sql = "INSERT INTO usuarios (nombre, correo, telefono, contrasena, rol) VALUES (?, ?, ?, ?, 'cliente')";
    const [resultado] = await pool.query(sql, [nombre, correo, telefono || null, hash]);
    const usuario = { id: resultado.insertId, nombre, correo, telefono: telefono || null, rol: 'cliente' };
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', token: generarToken(usuario), usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const coincide = await bcrypt.compare(contrasena, rows[0].contrasena);
    if (!coincide) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = sanitizarUsuario(rows[0]);
    res.json({ mensaje: 'Login exitoso', token: generarToken(usuario), usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
