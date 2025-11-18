import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

/**
 * Inicializa el pool de conexiones a PostgreSQL
 */
export const initializeDatabase = (): void => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('DATABASE_URL no está configurada. El historial no se guardará en la base de datos.');
    return;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20, // máximo de conexiones en el pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Verificar conexión y crear tabla
    pool.query('SELECT NOW()')
      .then(() => {
        console.log('Conexión a PostgreSQL establecida correctamente');
        // Crear tabla si no existe
        createTableIfNotExists();
      })
      .catch((err) => {
        console.error('Error conectando a PostgreSQL:', err);
        pool = null;
      });
  } catch (error) {
    console.error('Error inicializando PostgreSQL:', error);
    pool = null;
  }
};

/**
 * Crea la tabla de historial si no existe
 */
const createTableIfNotExists = async (): Promise<void> => {
  if (!pool) return;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS analysis_history (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255),
      description TEXT NOT NULL,
      extracted_text TEXT NOT NULL,
      summary TEXT NOT NULL,
      label VARCHAR(255) NOT NULL,
      detected_info JSONB,
      tags TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON analysis_history(created_at DESC);
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Tabla analysis_history verificada/creada correctamente');
  } catch (error) {
    console.error('Error creando tabla:', error);
  }
};

/**
 * Obtiene el pool de conexiones
 */
export const getPool = (): Pool | null => {
  return pool;
};

/**
 * Ejecuta una query de forma segura
 */
export const query = async (text: string, params?: any[]): Promise<any> => {
  if (!pool) {
    throw new Error('Base de datos no inicializada. Verifica DATABASE_URL en las variables de entorno.');
  }
  return pool.query(text, params);
};

/**
 * Cierra todas las conexiones
 */
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Conexiones a PostgreSQL cerradas');
  }
};

