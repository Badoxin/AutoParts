import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

router.get('/servicios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM servicios WHERE activo = 1 ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
