import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import reviewerRoutes from './routes/reviewers.routes.js';
import categoriaRoutes from './routes/categorias.routes.js';
import usuarioRoutes from './routes/usuarios.routes.js';
import divisaRoutes from './routes/divisas.routes.js';
import gastoRoutes from './routes/gastos.routes.js';
import reportRoutes from './routes/reports.routes.js';
import ingresoRoutes from './routes/ingresos.routes.js';
import notificacionRoutes from './routes/notificaciones.routes.js';
import { readOnlyForReviewers, requireAuth } from './middlewares/auth.middleware.js';

export const app = express();
app.use(cors());
app.use(express.json());

// Rutas públicas
app.use('/api/auth', authRoutes);

// Todo lo demás requiere sesión; los revisores solo pueden leer.
app.use('/api', requireAuth, readOnlyForReviewers);
app.use('/api/reviewers', reviewerRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/users', usuarioRoutes);
app.use('/api/divisas', divisaRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/notificaciones', notificacionRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status && err.status < 500 ? err.status : 500).json({ error: err.message });
});
