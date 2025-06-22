import express from 'express';
import { testConnection, sequelize } from './config/index.js';

const app = express();
app.use(express.json());

// Ejemplo de ruta
// import authRoutes from './routes/auth.routes.js';
// app.use('/api/auth', authRoutes);

async function start() {
  await testConnection();
  await sequelize.sync({ alter: true });
  app.listen(3000, () => console.log('🚀 Backend corriendo en puerto 3000'));
}

start();
