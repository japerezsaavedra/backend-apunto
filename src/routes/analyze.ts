import express, { Request, Response } from 'express';
import { extractTextFromImage } from '../services/ocrService';
import { analyzeTextWithAzureOpenAI } from '../services/azureOpenAIService';
import { base64ToBuffer, isValidImageDataUri, getMimeTypeFromDataUri } from '../utils/imageConverter';

const router = express.Router();

interface AnalyzeRequest {
  image: string; // data URI base64
  description: string;
}

interface AnalyzeResponse {
  extractedText: string;
  summary: string;
  label: string;
  detectedInfo?: {
    entities: Array<{ type: string; value: string; confidence: string }>;
    keyPoints: string[];
    documentType: string;
    understanding: string;
  };
  tags?: string[];
  confidence?: number;
}

/**
 * POST /api/analyze
 * Analiza un documento usando OCR y LLM
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { image, description }: AnalyzeRequest = req.body;

    // Validaciones
    if (!image) {
      return res.status(400).json({
        error: 'Imagen requerida',
        message: 'El campo "image" es obligatorio',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: 'Descripción requerida',
        message: 'El campo "description" es obligatorio',
      });
    }

    if (!isValidImageDataUri(image)) {
      return res.status(400).json({
        error: 'Formato de imagen inválido',
        message: 'La imagen debe ser un data URI válido (data:image/...;base64,...)',
      });
    }

    // Convertir imagen base64 a Buffer
    let imageBuffer: Buffer;
    try {
      imageBuffer = base64ToBuffer(image);
    } catch (error) {
      return res.status(400).json({
        error: 'Error al procesar imagen',
        message: 'No se pudo convertir la imagen base64',
      });
    }

    // Validar tamaño de imagen (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageBuffer.length > maxSize) {
      return res.status(400).json({
        error: 'Imagen demasiado grande',
        message: 'El tamaño máximo permitido es 10MB',
      });
    }

    // Paso 1: Extraer texto con OCR (Azure Document Intelligence)
    console.log('Iniciando extracción de texto con OCR...');
    const extractedText = await extractTextFromImage(imageBuffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: 'No se pudo extraer texto',
        message: 'El documento no contiene texto legible o la imagen no es válida',
      });
    }

    // Paso 2: Analizar con Azure OpenAI (GPT-4o)
    console.log('Iniciando análisis con Azure OpenAI...');
    const analysis = await analyzeTextWithAzureOpenAI(extractedText, description);
    console.log('Análisis completado con Azure OpenAI');

    // Respuesta exitosa
    const response: AnalyzeResponse = {
      extractedText: extractedText.trim(),
      summary: analysis.summary,
      label: analysis.label,
      detectedInfo: analysis.detectedInfo,
      tags: analysis.tags,
    };

    console.log('Análisis completado exitosamente');
    res.json(response);

  } catch (error) {
    console.error('Error en /api/analyze:', error);

    if (error instanceof Error) {
      // Errores conocidos
      if (error.message.includes('no está configurado')) {
        return res.status(500).json({
          error: 'Servicio no configurado',
          message: error.message,
        });
      }

      // Incluir más detalles del error para debugging
      const errorDetails = {
        error: 'Error al procesar el documento',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };

      console.error('Detalles del error:', errorDetails);
      
      return res.status(500).json(errorDetails);
    }

    // Error desconocido
    const unknownError = {
      error: 'Error interno del servidor',
      message: 'Ocurrió un error inesperado al procesar el documento',
      details: error ? String(error) : 'Error desconocido',
    };
    
    console.error('Error desconocido:', unknownError);
    res.status(500).json(unknownError);
  }
});

export default router;

