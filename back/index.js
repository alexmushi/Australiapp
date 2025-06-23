import express from 'express';
import cors from 'cors';
import { testConnection, sequelize } from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import reviewerRoutes from './routes/reviewers.routes.js';
import categoriaRoutes from './routes/categorias.routes.js';
import usuarioRoutes from './routes/usuarios.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/reviewers', reviewerRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/users', usuarioRoutes);

async function start() {
  await testConnection();
  await sequelize.sync({ alter: true });
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`🚀 Backend corriendo en puerto ${port}`));
}

start();