import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Google Gemini no está configurado. Variable de entorno GEMINI_API_KEY faltante.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface DetectedEntity {
  type: string; // "fecha", "monto", "nombre", "dirección", "teléfono", "email", "ecuacion", "formula", "tema", "concepto", "contexto", etc.
  value: string;
  confidence: string; // "alta", "media", "baja"
}

export interface GeminiAnalysisResult {
  summary: string;
  label: string;
  detectedInfo: {
    entities: DetectedEntity[];
    keyPoints: string[];
    documentType: string;
    understanding: string; // Explicación de lo que el LLM comprendió
  };
  tags: string[]; // Múltiples etiquetas para mejor categorización
}

/**
 * Analiza el texto extraído y genera un análisis comprensivo usando Google Gemini
 */
export const analyzeTextWithGemini = async (
  extractedText: string,
  userDescription: string
): Promise<GeminiAnalysisResult> => {
  if (!genAI) {
    throw new Error('Google Gemini no está configurado. Por favor, configura la variable de entorno GEMINI_API_KEY');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Eres un asistente experto en análisis y comprensión de documentos de cualquier tipo, incluyendo apuntes escritos a mano de cualquier índole (en pizarra, papel, cuaderno, etc.), notas personales, ecuaciones, diagramas, y cualquier contenido. Tu tarea es analizar profundamente el texto extraído de un documento OCR y la descripción proporcionada por el usuario.

**CONTEXTO DEL USUARIO:**
"${userDescription}"

**TEXTO EXTRAÍDO DEL DOCUMENTO (OCR):**
${extractedText}

**INSTRUCCIONES:**
1. **Comprensión del documento**: Analiza qué tipo de documento es y qué información contiene. Considera tanto el texto extraído como la descripción del usuario para entender el contexto completo. El documento puede ser:
   - **Apuntes escritos a mano** de cualquier tipo (en pizarra, papel, cuaderno, etc.) - pueden ser académicos, personales, profesionales, creativos, etc.
   - **Notas de clase, reuniones o cualquier contexto** escritas a mano
   - **Ecuaciones o fórmulas** (si están presentes, de cualquier área: matemáticas, física, química, etc.)
   - **Diagramas o esquemas** explicados en texto
   - **Documentos administrativos** (facturas, recetas médicas, citas, etc.)
   - **Notas personales** o recordatorios
   - **Cualquier otro tipo de documento** o apunte escrito a mano

2. **Análisis de contenido del apunte**: Si el documento es un apunte escrito a mano:
   - Identifica el tema, contexto o área de conocimiento (puede ser académico, profesional, personal, creativo, etc.)
   - Extrae los conceptos principales y temas tratados
   - Si hay ecuaciones o fórmulas (de cualquier tipo), identifícalas y explica su significado
   - Identifica términos clave, definiciones, o conceptos importantes
   - Reconoce si hay estructuras como listas, esquemas, o diagramas descritos
   - Determina el contexto (académico, profesional, personal, etc.) si es posible

3. **Análisis de ecuaciones y fórmulas** (si están presentes): Si el documento contiene ecuaciones, fórmulas o contenido matemático/científico:
   - Identifica todas las ecuaciones presentes (escritas a mano o impresas)
   - Interpreta las fórmulas y explica su significado en el contexto del documento
   - Identifica variables, constantes y operadores
   - Si es posible, transcribe las ecuaciones en formato estándar
   - Explica el contexto del contenido (matemático, físico, químico, etc.)

4. **Extracción de entidades**: Identifica y extrae información estructurada del documento:
   - **Fechas** (fechas importantes, vencimientos, citas, fechas históricas)
   - **Montos o cantidades monetarias**
   - **Nombres** de personas, empresas, instituciones, personajes históricos, autores
   - **Direcciones**
   - **Números de teléfono**
   - **Correos electrónicos**
   - **Números de referencia, códigos, IDs**
   - **Ecuaciones y fórmulas** (si están presentes, de cualquier tipo)
   - **Términos técnicos o especializados** (conceptos, definiciones, teoremas, etc.)
   - **Temas o áreas de conocimiento** (pueden ser académicos, profesionales, personales, creativos, etc.)
   - **Conceptos clave** o ideas principales
   - Cualquier otra información relevante según el tipo de documento

5. **Puntos clave**: Identifica los 3-5 puntos más importantes del documento. Si es un apunte, incluye los conceptos principales. Si contiene ecuaciones, incluye las fórmulas clave y su significado.

6. **Etiquetado**: Asigna una etiqueta principal y etiquetas secundarias que describan el documento:
   - Para apuntes: ["Apunte", "Tema o Contexto", "Subtema"] (ej: ["Apunte", "Historia", "Revolución Francesa"] o ["Apunte", "Reunión", "Notas de proyecto"] o ["Apunte", "Personal", "Lista de tareas"])
   - Para apuntes con ecuaciones: ["Apunte", "Matemáticas", "Ecuaciones"] o ["Apunte", "Física", "Fórmulas"]
   - Para documentos administrativos: ["Factura", "Servicios", "Pago Pendiente"]
   - Para notas: ["Nota Personal", "Recordatorio"]
   - Incluye etiquetas relacionadas con el contenido específico

7. **Resumen comprensivo**: Genera un resumen que explique:
   - Qué es el documento y de qué trata
   - Qué información o conceptos principales contiene
   - Si hay ecuaciones o fórmulas, explica qué representan y su contexto
   - Si es un apunte, resume los temas y conceptos principales (sin importar si es académico, profesional, personal, etc.)
   - Qué acciones o información relevante se puede extraer
   - El contexto o temático del documento

8. **Explicación de comprensión**: Explica brevemente qué entendiste del documento y cómo relacionaste el texto OCR con la descripción del usuario. Si es un apunte, explica los temas principales identificados. Si detectaste ecuaciones o contenido técnico, explica cómo las interpretaste.

Responde SOLO con un objeto JSON válido en el siguiente formato (sin markdown, sin código, solo JSON puro):
{
  "summary": "Resumen comprensivo del documento explicando qué es, qué contiene y qué información relevante. Si es un apunte, resume los conceptos principales. Si hay ecuaciones, explica su significado y contexto.",
  "label": "Etiqueta principal del documento",
  "detectedInfo": {
    "entities": [
      {"type": "fecha", "value": "15/03/2024", "confidence": "alta"},
      {"type": "monto", "value": "$500.00", "confidence": "alta"},
      {"type": "nombre", "value": "Juan Pérez", "confidence": "media"},
      {"type": "tema", "value": "Historia de Chile", "confidence": "alta"},
      {"type": "concepto", "value": "Revolución Industrial", "confidence": "alta"},
      {"type": "ecuacion", "value": "x^2 + y^2 = r^2", "confidence": "alta"},
      {"type": "formula", "value": "E = mc²", "confidence": "alta"}
    ],
    "keyPoints": ["Punto clave 1", "Punto clave 2", "Punto clave 3", "Conceptos principales si es un apunte", "Ecuaciones con su significado si las hay"],
    "documentType": "Tipo específico de documento (ej: Apunte de historia, Apunte de matemáticas, Apunte de literatura, Factura de servicios, Receta médica, Nota personal, etc.)",
    "understanding": "Explicación de lo que comprendiste del documento y cómo relacionaste el OCR con la descripción del usuario. Si es un apunte, explica los temas principales. Si hay ecuaciones o contenido técnico, explica cómo las interpretaste."
  },
  "tags": ["Etiqueta1", "Etiqueta2", "Etiqueta3", "Tema o contexto si es un apunte (ej: 'Historia', 'Reunión', 'Personal', 'Matemáticas', etc.)"]
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional, sin markdown, sin explicaciones fuera del JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No se recibió respuesta de Gemini');
    }

    // Intentar parsear la respuesta JSON
    try {
      // Limpiar la respuesta en caso de que tenga markdown o texto adicional
      let jsonString = content.trim();
      
      // Remover markdown code blocks si existen
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Buscar el objeto JSON
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonString);

      // Validar y construir la respuesta con valores por defecto
      return {
        summary: parsed.summary || 'No se pudo generar resumen',
        label: parsed.label || 'Documento General',
        detectedInfo: {
          entities: Array.isArray(parsed.detectedInfo?.entities) 
            ? parsed.detectedInfo.entities 
            : [],
          keyPoints: Array.isArray(parsed.detectedInfo?.keyPoints)
            ? parsed.detectedInfo.keyPoints
            : [],
          documentType: parsed.detectedInfo?.documentType || parsed.label || 'Documento General',
          understanding: parsed.detectedInfo?.understanding || 'Análisis del documento completado',
        },
        tags: Array.isArray(parsed.tags) && parsed.tags.length > 0
          ? parsed.tags
          : [parsed.label || 'Documento General'],
      };
    } catch (parseError) {
      // Si no se puede parsear como JSON, intentar extraer información del texto
      console.warn('No se pudo parsear la respuesta como JSON, usando respuesta directa');
      console.warn('Respuesta recibida:', content.substring(0, 500));
      
      // Respuesta por defecto con estructura mínima
      return {
        summary: content.substring(0, 500),
        label: 'Documento General',
        detectedInfo: {
          entities: [],
          keyPoints: [],
          documentType: 'Documento General',
          understanding: 'Se procesó el documento pero no se pudo extraer información estructurada. El resumen contiene la información disponible.',
        },
        tags: ['Documento General'],
      };
    }
  } catch (error) {
    console.error('Error en Google Gemini:', error);
    if (error instanceof Error) {
      throw new Error(`Error al analizar el documento: ${error.message}`);
    }
    throw new Error('Error desconocido al analizar el documento');
  }
};

