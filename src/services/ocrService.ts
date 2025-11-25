/**
 * Servicio de OCR usando Azure Document Intelligence
 * Usa el modelo prebuilt-read con API version 2023-07-31
 */

const AZURE_DOC_ENDPOINT = process.env.AZURE_DOC_ENDPOINT;
const AZURE_DOC_KEY = process.env.AZURE_DOC_KEY;

if (!AZURE_DOC_ENDPOINT || !AZURE_DOC_KEY) {
  console.warn('Azure Document Intelligence no está configurado. Variables de entorno faltantes.');
}

/**
 * Extrae texto de una imagen usando Azure Document Intelligence
 */
export const extractTextFromImage = async (imageBuffer: Buffer): Promise<string> => {
  if (!AZURE_DOC_ENDPOINT || !AZURE_DOC_KEY) {
    throw new Error('Azure Document Intelligence no está configurado. Por favor, configura las variables de entorno AZURE_DOC_ENDPOINT y AZURE_DOC_KEY');
  }

  try {
    console.log('Iniciando extracción de texto con Azure Document Intelligence...');

    const url = `${AZURE_DOC_ENDPOINT.replace(/\/$/, '')}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2023-07-31`;

    const headers = {
      'Ocp-Apim-Subscription-Key': AZURE_DOC_KEY,
      'Content-Type': 'image/jpeg'
    };

    // Iniciar el análisis
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: imageBuffer
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(
        errorData.error?.message || `Error de Azure Document Intelligence: ${response.status}`
      );
    }

    // Obtener la URL de operación para polling
    const operationLocation = response.headers.get('operation-location');
    if (!operationLocation) {
      throw new Error('No se recibió operation-location header en la respuesta de OCR');
    }

    // Polling hasta que termine el análisis
    console.log('Esperando resultados del OCR...');
    let result;
    while (true) {
      const pollResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_DOC_KEY
        }
      });

      if (!pollResponse.ok) {
        throw new Error(`Error al consultar estado del OCR: ${pollResponse.status}`);
      }

      result = await pollResponse.json() as {
        status: string;
        analyzeResult?: {
          pages: Array<{
            lines: Array<{
              content: string;
            }>;
          }>;
        };
      };

      const status = result.status;
      if (status === 'succeeded' || status === 'failed') {
        break;
      }

      // Esperar 1 segundo antes de volver a consultar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (result.status !== 'succeeded') {
      throw new Error(`OCR falló: ${JSON.stringify(result)}`);
    }

    // Extraer el texto de todas las páginas
    const pages = result.analyzeResult?.pages || [];
    const texto = pages
      .flatMap(page => page.lines.map(line => line.content))
      .join('\n');

    if (!texto || texto.trim().length === 0) {
      return 'No se pudo extraer texto del documento.';
    }

    console.log('Extracción de texto con Azure Document Intelligence completada exitosamente');
    return texto.trim();
  } catch (error) {
    console.error('Error en Azure Document Intelligence:', error);
    if (error instanceof Error) {
      throw new Error(`Error al procesar el documento con OCR: ${error.message}`);
    }
    throw new Error('Error desconocido al procesar el documento con OCR');
  }
};

