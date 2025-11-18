import express, { Request, Response } from 'express';
import * as HistoryService from '../services/historyService';

const router = express.Router();

/**
 * GET /api/history
 * Obtiene el historial de análisis
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await HistoryService.getHistory(userId, limit, offset);
    const total = await HistoryService.getHistoryCount(userId);

    res.json({
      history,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      error: 'Error al obtener historial',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

/**
 * GET /api/history/:id
 * Obtiene un análisis específico por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.headers['x-user-id'] as string | undefined;

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'El ID debe ser un número',
      });
    }

    const analysis = await HistoryService.getAnalysisById(id, userId);

    if (!analysis) {
      return res.status(404).json({
        error: 'Análisis no encontrado',
        message: 'No se encontró el análisis con el ID proporcionado',
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error obteniendo análisis:', error);
    res.status(500).json({
      error: 'Error al obtener análisis',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

/**
 * DELETE /api/history/:id
 * Elimina un análisis del historial
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.headers['x-user-id'] as string | undefined;

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'El ID debe ser un número',
      });
    }

    const deleted = await HistoryService.deleteAnalysis(id, userId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Análisis no encontrado',
        message: 'No se encontró el análisis con el ID proporcionado',
      });
    }

    res.json({
      message: 'Análisis eliminado correctamente',
      id,
    });
  } catch (error) {
    console.error('Error eliminando análisis:', error);
    res.status(500).json({
      error: 'Error al eliminar análisis',
      message: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

export default router;

