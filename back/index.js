import express from 'express';
import { testConnection, sequelize } from './config/index.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

async function start() {
  await testConnection();
  await sequelize.sync({ alter: true });
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`🚀 Backend corriendo en puerto ${port}`));
}

start();
