import { createWorker, Worker } from 'tesseract.js';

/**
 * Extrae texto de una imagen usando Tesseract.js OCR (por defecto)
 * o Google Vision API si está configurado
 * 
 * Tesseract.js: Gratis, ilimitado, local, open source
 * Google Vision API: 1,000 unidades/mes gratis, luego $1.50 por 1,000 unidades
 */
export const extractTextFromImage = async (imageBuffer: Buffer): Promise<string> => {
  // Verificar si se debe usar Google Vision API
  const useGoogleVision = process.env.USE_GOOGLE_VISION_OCR === 'true';
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_VISION_API_KEY;

  if (useGoogleVision && apiKey) {
    return extractTextFromImageWithGoogleVision(imageBuffer);
  }

  // Por defecto usar Tesseract.js (gratis, ilimitado)
  return extractTextFromImageWithTesseract(imageBuffer);
};

/**
 * Extrae texto usando Tesseract.js (gratis, ilimitado, local)
 */
const extractTextFromImageWithTesseract = async (imageBuffer: Buffer): Promise<string> => {
  let worker: Worker | null = null;
  
  try {
    console.log('Iniciando extracción de texto con Tesseract.js OCR (gratis, local)...');
    
    // Crear worker con soporte para español e inglés
    worker = await createWorker('spa+eng');
    
    // Reconocer texto de la imagen
    const { data: { text } } = await worker.recognize(imageBuffer);

    if (!text || text.trim().length === 0) {
      return 'No se pudo extraer texto del documento.';
    }

    console.log('Extracción de texto con Tesseract.js completada exitosamente');
    return text.trim();
  } catch (error) {
    console.error('Error en Tesseract.js OCR:', error);
    if (error instanceof Error) {
      throw new Error(`Error al procesar el documento con OCR: ${error.message}`);
    }
    throw new Error('Error desconocido al procesar el documento con OCR');
  } finally {
    // Asegurarse de terminar el worker siempre
    if (worker) {
      await worker.terminate().catch(() => {
        // Ignorar errores al terminar
      });
    }
  }
};

/**
 * Extrae texto usando Google Vision API
 * Tier gratuito: 1,000 unidades/mes
 * Después: $1.50 por cada 1,000 unidades
 * Requiere GEMINI_API_KEY o GOOGLE_VISION_API_KEY
 */
const extractTextFromImageWithGoogleVision = async (
  imageBuffer: Buffer
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_VISION_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Vision API no está configurado. Se requiere GEMINI_API_KEY o GOOGLE_VISION_API_KEY');
  }

  try {
    console.log('Iniciando extracción de texto con Google Vision API...');
    
    // Convertir buffer a base64
    const base64Image = imageBuffer.toString('base64');
    
    // Llamar a Google Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION', // Detecta texto en documentos, incluyendo ecuaciones escritas a mano
                },
              ],
              imageContext: {
                languageHints: ['es', 'en'], // Español e inglés para mejor detección
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
      throw new Error(
        errorData.error?.message || `Error de Google Vision API: ${response.status}`
      );
    }

    const data = (await response.json()) as {
      responses: Array<{ textAnnotations?: Array<{ description?: string }> }>;
    };
    const textAnnotations = data.responses[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      return 'No se pudo extraer texto del documento.';
    }

    // El primer elemento contiene todo el texto
    const extractedText = textAnnotations[0].description || '';
    
    console.log('Extracción de texto con Google Vision completada exitosamente');
    return extractedText.trim();
  } catch (error) {
    console.error('Error en Google Vision API:', error);
    if (error instanceof Error) {
      throw new Error(`Error al procesar el documento con Google Vision: ${error.message}`);
    }
    throw new Error('Error desconocido al procesar el documento con Google Vision');
  }
};

