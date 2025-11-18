# Apunto Backend API

Backend API para la aplicación móvil Apunto que analiza documentos y apuntes de cualquier tipo usando OCR (Google Vision API o Tesseract.js) y Google Gemini para análisis comprensivo de texto.

## Características

- ✅ Extracción de texto con Google Vision API (recomendado) o Tesseract.js (alternativa gratuita)
- ✅ Análisis comprensivo con Google Gemini (gratis)
- ✅ Soporte para apuntes escritos a mano de cualquier índole (en pizarra, papel, cuaderno, etc.) - académicos, profesionales, personales, creativos, etc.
- ✅ Detección de ecuaciones y fórmulas escritas a mano (si están presentes)
- ✅ Extracción de entidades estructuradas (fechas, montos, nombres, conceptos, temas, etc.)
- ✅ API REST con Express y TypeScript
- ✅ Manejo de imágenes base64
- ✅ Validación de entrada
- ✅ Manejo de errores robusto
- ✅ CORS configurado

## Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Cuenta de Google para obtener API key de Gemini (gratis)

## Instalación

```bash
cd backend
npm install
```

## Configuración

1. Copia el archivo de ejemplo de variables de entorno:

```bash
cp env.example .env
```

2. Edita el archivo `.env` y configura tu API key de Gemini:

```env
# Google Gemini (LLM para análisis de documentos)
# Obtén tu API key en: https://aistudio.google.com/apikey
# Esta misma API key se usa para Google Vision API si está habilitado
GEMINI_API_KEY=tu-gemini-api-key

# OCR: Configuración del servicio de extracción de texto
# 
# Opción 1: Google Vision API (RECOMENDADO - más preciso)
# - Tier gratuito: 1,000 unidades/mes
# - Después: $1.50 por cada 1,000 unidades
# - Para usar Google Vision API, descomenta la siguiente línea:
USE_GOOGLE_VISION_OCR=true
# 
# Opción 2: Tesseract.js (alternativa gratuita)
# - Completamente gratis e ilimitado
# - Funciona localmente (no requiere API keys)
# - Para usar Tesseract.js, comenta o elimina USE_GOOGLE_VISION_OCR

# Servidor
PORT=3000
CORS_ORIGIN=*
```

### Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key" o "Get API Key"
4. Copia la API key generada
5. Pégala en el archivo `.env`

## Ejecución

### Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000` con hot-reload.

### Producción

```bash
npm run build
npm start
```

## Endpoints

### GET /health

Verifica el estado del servidor.

**Response:**
```json
{
  "status": "ok",
  "message": "Apunto Backend API"
}
```

### POST /api/analyze

Analiza un documento o apunte usando OCR y LLM.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "description": "Apunte de historia sobre la Revolución Francesa"
}
```

**Response:**
```json
{
  "extractedText": "REVOLUCIÓN FRANCESA\n1789 - 1799\nCausas principales...",
  "summary": "Apunte académico sobre la Revolución Francesa que cubre el período 1789-1799, incluyendo causas principales, eventos clave y consecuencias históricas.",
  "label": "Apunte de Historia",
  "detectedInfo": {
    "entities": [
      {"type": "tema_academico", "value": "Historia de Francia", "confidence": "alta"},
      {"type": "concepto", "value": "Revolución Francesa", "confidence": "alta"},
      {"type": "fecha", "value": "1789", "confidence": "alta"},
      {"type": "fecha", "value": "1799", "confidence": "alta"}
    ],
    "keyPoints": [
      "Revolución Francesa (1789-1799)",
      "Causas: crisis económica y social",
      "Eventos clave: Toma de la Bastilla",
      "Consecuencias: fin del Antiguo Régimen"
    ],
    "documentType": "Apunte de historia sobre la Revolución Francesa",
    "understanding": "Documento académico que trata sobre la Revolución Francesa. El usuario indicó que es un apunte de historia, lo cual coincide con el contenido detectado sobre eventos históricos franceses del siglo XVIII."
  },
  "tags": ["Apunte", "Historia", "Revolución Francesa"]
}
```

**Ejemplo con ecuaciones (si están presentes):**
```json
{
  "extractedText": "DERIVADAS\nf(x) = x² + 2x + 1\nf'(x) = 2x + 2...",
  "summary": "Apunte de matemáticas sobre derivadas que incluye ejemplos de funciones polinómicas y sus derivadas.",
  "label": "Apunte de Matemáticas",
  "detectedInfo": {
    "entities": [
      {"type": "tema_academico", "value": "Cálculo diferencial", "confidence": "alta"},
      {"type": "concepto", "value": "Derivadas", "confidence": "alta"},
      {"type": "ecuacion", "value": "f(x) = x² + 2x + 1", "confidence": "alta"},
      {"type": "formula", "value": "f'(x) = 2x + 2", "confidence": "alta"}
    ],
    "keyPoints": [
      "Concepto de derivada",
      "Función: f(x) = x² + 2x + 1",
      "Derivada: f'(x) = 2x + 2"
    ],
    "documentType": "Apunte de matemáticas con ecuaciones sobre derivadas"
  },
  "tags": ["Apunte", "Matemáticas", "Ecuaciones", "Derivadas"]
}
```

**Errores:**

- `400`: Datos inválidos (imagen faltante, formato incorrecto, etc.)
- `500`: Error del servidor o servicios no configurados

## Estructura del Proyecto

```
backend/
├── src/
│   ├── server.ts              # Servidor Express principal
│   ├── routes/
│   │   └── analyze.ts          # Ruta POST /api/analyze
│   ├── services/
│   │   ├── ocrService.ts       # Servicio OCR (Google Vision o Tesseract.js)
│   │   └── geminiService.ts    # Servicio Google Gemini
│   └── utils/
│       └── imageConverter.ts   # Utilidades para imágenes
├── dist/                      # Código compilado (generado)
├── package.json
├── tsconfig.json
├── .env                       # Variables de entorno (no versionado)
├── env.example                # Ejemplo de variables de entorno
└── README.md
```

## Flujo de Procesamiento

1. **Recepción**: El backend recibe una imagen en formato base64 y una descripción
2. **Validación**: Valida el formato y tamaño de la imagen
3. **OCR**: Usa Google Vision API (si está configurado) o Tesseract.js para extraer texto
4. **Extracción**: Obtiene el texto extraído del documento o apunte
5. **Análisis**: Envía el texto extraído y la descripción a Google Gemini
6. **Análisis comprensivo**: Gemini analiza el contenido y detecta:
   - Tipo de documento (apunte, factura, nota, etc.)
   - Tema, contexto o área de conocimiento (si es un apunte)
   - Conceptos principales y temas tratados
   - Ecuaciones o fórmulas (si están presentes)
   - Entidades estructuradas (fechas, nombres, conceptos, etc.)
   - Puntos clave del documento
7. **Respuesta**: Retorna el texto extraído, resumen, etiquetas e información estructurada

## Tipos de Documentos Soportados

El sistema puede analizar:

- **Apuntes escritos a mano** de cualquier índole:
  - Pueden ser académicos, profesionales, personales, creativos, etc.
  - En pizarra, papel, cuaderno, etc.
  - Con o sin ecuaciones/fórmulas
  - Notas de clase escritas a mano
- **Documentos administrativos**:
  - Facturas, recetas médicas, citas, etc.
- **Notas personales**:
  - Recordatorios, listas, etc.
- **Cualquier documento con texto** legible

## Entidades Detectadas

El sistema puede detectar y extraer:

- **Fechas**: Fechas importantes, vencimientos, citas, fechas históricas
- **Montos**: Cantidades monetarias
- **Nombres**: Personas, empresas, instituciones, personajes históricos, autores
- **Direcciones**: Direcciones físicas
- **Contacto**: Teléfonos, correos electrónicos
- **Referencias**: Códigos, IDs, números de referencia
- **Ecuaciones**: Ecuaciones matemáticas (si están presentes)
- **Fórmulas**: Fórmulas científicas o técnicas (si están presentes)
- **Temas**: Áreas de conocimiento o contexto (pueden ser académicos, profesionales, personales, creativos, etc.)
- **Conceptos**: Conceptos clave, definiciones, ideas principales
- **Cualquier otra información relevante** según el tipo de documento

## Tecnologías Utilizadas

### OCR: Google Vision API (Recomendado)
- ✅ Tier gratuito: 1,000 unidades/mes
- ✅ Alta precisión, especialmente para texto escrito a mano
- ✅ Buen rendimiento con ecuaciones
- ⚠️ Después del límite: $1.50 por cada 1,000 unidades

### OCR: Tesseract.js (Alternativa)
- ✅ Completamente gratuito e ilimitado
- ✅ Open source
- ✅ Funciona localmente (no requiere API externa)
- ✅ Soporta más de 100 idiomas
- ⚠️ Puede ser menos preciso que Google Vision API

### LLM: Google Gemini
- ✅ Tier gratuito generoso (60 RPM, 1,500 RPD)
- ✅ Excelente para análisis de texto y comprensión de contexto
- ✅ Capaz de analizar apuntes escritos a mano de cualquier índole
- ✅ Detecta y explica ecuaciones si están presentes
- ✅ Soporte para múltiples idiomas

## Límites y Validaciones

- Tamaño máximo de imagen: 10MB
- Formatos soportados: JPEG, PNG, GIF, WebP
- La imagen debe ser un data URI válido (data:image/...;base64,...)
- Idiomas OCR soportados: Español e Inglés (configurable en Google Vision API)

## Seguridad

- ⚠️ **IMPORTANTE**: Nunca expongas las API keys en el código del cliente
- Las API keys deben estar solo en el backend (archivo `.env`)
- En producción, usa variables de entorno del servidor
- Configura CORS apropiadamente para producción
- Considera implementar rate limiting para prevenir abuso

## Troubleshooting

### Error: "Google Gemini no está configurado"

- Verifica que `GEMINI_API_KEY` esté en tu archivo `.env`
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto `backend/`
- Verifica que la API key sea válida

### Error: CORS

- Verifica que `CORS_ORIGIN` en `.env` permita el origen de la app móvil
- En desarrollo, puedes usar `*` temporalmente
- En producción, especifica el dominio exacto de tu app

### Error: "No se pudo extraer texto"

- Verifica que la imagen sea legible y contenga texto
- Verifica que el formato de imagen sea soportado
- Asegúrate de que la imagen no esté corrupta
- Para texto escrito a mano, Google Vision API suele funcionar mejor que Tesseract.js

### Error: Google Vision API no funciona

- Verifica que `USE_GOOGLE_VISION_OCR=true` esté en `.env`
- Verifica que `GEMINI_API_KEY` sea válida y tenga permisos para Vision API
- Si falla, el sistema automáticamente usará Tesseract.js como respaldo

## Desarrollo

### Scripts Disponibles

- `npm run dev`: Ejecuta el servidor en modo desarrollo con hot-reload
- `npm run build`: Compila TypeScript a JavaScript
- `npm start`: Ejecuta el servidor en modo producción
- `npm run type-check`: Verifica tipos sin compilar

### Agregar Nuevas Funcionalidades

1. Crea nuevos servicios en `src/services/`
2. Crea nuevas rutas en `src/routes/`
3. Agrega utilidades en `src/utils/`
4. Importa y usa en `src/server.ts`

## Costos

### Google Vision API (OCR - Opcional)
- **Gratis**: 1,000 unidades/mes
- Después: $1.50 por cada 1,000 unidades

### Tesseract.js OCR (Alternativa)
- **Gratis**: Sin límites, funciona localmente
- No requiere API keys ni servicios externos

### Google Gemini (LLM)
- **Gratis**: 60 requests por minuto, 1,500 requests por día
- Después: Consulta precios en Google AI Studio

## Licencia

Proyecto de prototipo - Uso interno
