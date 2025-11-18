import { query } from './database';

export interface HistoryItem {
  id: number;
  user_id?: string;
  description: string;
  extracted_text: string;
  summary: string;
  label: string;
  detected_info?: {
    entities: Array<{ type: string; value: string; confidence: string }>;
    keyPoints: string[];
    documentType: string;
    understanding: string;
  };
  tags?: string[];
  created_at: Date;
}

/**
 * Guarda un análisis en el historial
 */
export const saveAnalysis = async (
  description: string,
  extractedText: string,
  summary: string,
  label: string,
  detectedInfo?: HistoryItem['detected_info'],
  tags?: string[],
  userId?: string
): Promise<HistoryItem> => {
  try {
    const result = await query(
      `INSERT INTO analysis_history 
       (user_id, description, extracted_text, summary, label, detected_info, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId || null,
        description,
        extractedText,
        summary,
        label,
        detectedInfo ? JSON.stringify(detectedInfo) : null,
        tags || [],
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error guardando análisis en historial:', error);
    throw new Error('No se pudo guardar el análisis en el historial');
  }
};

/**
 * Obtiene el historial de análisis
 */
export const getHistory = async (
  userId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<HistoryItem[]> => {
  try {
    let result;
    
    if (userId) {
      result = await query(
        `SELECT * FROM analysis_history 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
    } else {
      result = await query(
        `SELECT * FROM analysis_history 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
    }

    return result.rows.map((row: any) => ({
      ...row,
      detected_info: row.detected_info 
        ? (typeof row.detected_info === 'string' ? JSON.parse(row.detected_info) : row.detected_info)
        : null,
    }));
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    throw new Error('No se pudo obtener el historial');
  }
};

/**
 * Obtiene un análisis específico por ID
 */
export const getAnalysisById = async (id: number, userId?: string): Promise<HistoryItem | null> => {
  try {
    let result;
    
    if (userId) {
      result = await query(
        `SELECT * FROM analysis_history 
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
    } else {
      result = await query(
        `SELECT * FROM analysis_history 
         WHERE id = $1`,
        [id]
      );
    }

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      detected_info: row.detected_info 
        ? (typeof row.detected_info === 'string' ? JSON.parse(row.detected_info) : row.detected_info)
        : null,
    };
  } catch (error) {
    console.error('Error obteniendo análisis por ID:', error);
    throw new Error('No se pudo obtener el análisis');
  }
};

/**
 * Elimina un análisis del historial
 */
export const deleteAnalysis = async (id: number, userId?: string): Promise<boolean> => {
  try {
    let result;
    
    if (userId) {
      result = await query(
        `DELETE FROM analysis_history 
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
      );
    } else {
      result = await query(
        `DELETE FROM analysis_history 
         WHERE id = $1
         RETURNING id`,
        [id]
      );
    }

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error eliminando análisis:', error);
    throw new Error('No se pudo eliminar el análisis');
  }
};

/**
 * Obtiene el conteo total de análisis
 */
export const getHistoryCount = async (userId?: string): Promise<number> => {
  try {
    let result;
    
    if (userId) {
      result = await query(
        `SELECT COUNT(*) as count FROM analysis_history WHERE user_id = $1`,
        [userId]
      );
    } else {
      result = await query(`SELECT COUNT(*) as count FROM analysis_history`);
    }

    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error obteniendo conteo de historial:', error);
    return 0;
  }
};

