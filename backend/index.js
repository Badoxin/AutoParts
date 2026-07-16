import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PORT } from './src/config/constants.js';
import { uploadsDir } from './src/middleware/upload.js';
import { manejarErroresDeSubida } from './src/middleware/errorHandler.js';

import serviciosRoutes from './src/routes/servicios.routes.js';
import disponibilidadRoutes from './src/routes/disponibilidad.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import perfilRoutes from './src/routes/perfil.routes.js';
import citasRoutes from './src/routes/citas.routes.js';
import contactoRoutes from './src/routes/contacto.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Rutas públicas / de cliente (todas bajo /api)
app.use('/api', serviciosRoutes);
app.use('/api', disponibilidadRoutes);
app.use('/api', authRoutes);
app.use('/api', perfilRoutes);
app.use('/api', citasRoutes);
app.use('/api', contactoRoutes);

// Panel de la administradora (todas bajo /api/admin, requieren sesión de admin)
app.use('/api/admin', adminRoutes);

app.use(manejarErroresDeSubida);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
