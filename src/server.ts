import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRoutes from './routes/analyze';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas
app.use('/api', analyzeRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Apunto Backend API' });
});

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\nCerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nCerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`CORS configurado para: ${CORS_ORIGIN}`);
});

