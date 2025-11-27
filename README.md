# Apunto Backend API

Backend API para la aplicación móvil Apunto que analiza documentos y apuntes de cualquier tipo usando Azure Document Intelligence (OCR) y Azure OpenAI (GPT-4o) para análisis comprensivo de texto.

## Características

- ✅ Extracción de texto con Azure Document Intelligence (OCR preciso y robusto)
- ✅ Análisis comprensivo con Azure OpenAI GPT-4o via Foundry
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
- Suscripción de Azure (Student o cualquier otra)
- Región recomendada: **East US 2** (compatible con suscripciones Student)

## Instalación

```bash
cd backend
npm install
```

## Configuración

**IMPORTANTE**: El backend NO debe tener credenciales hardcodeadas en el código. Todas las configuraciones sensibles deben estar en variables de entorno.

1. Copia el archivo de ejemplo de variables de entorno:

```bash
cp env.example .env
```

2. Edita el archivo `.env` y configura tus credenciales de Azure:

**⚠️ NUNCA subas el archivo `.env` al repositorio. Está incluido en `.gitignore` por seguridad.**

```env
# Azure Document Intelligence (OCR)
# Región recomendada: East US 2 (compatible con suscripciones Student)
# Documentación: https://learn.microsoft.com/azure/ai-services/document-intelligence
# Modelo: prebuilt-read, API version: 2023-07-31
AZURE_DOC_ENDPOINT=https://tu-instancia.cognitiveservices.azure.com/
AZURE_DOC_KEY=tu-clave-de-document-intelligence

# Azure OpenAI (LLM - GPT-4o via Foundry)
# Región recomendada: East US 2 (compatible con suscripciones Student)
# Endpoint de Azure AI Services (termina en services.ai.azure.com)
# Deployment: gpt-4o
AZURE_OPENAI_ENDPOINT=https://tu-instancia.services.ai.azure.com/
AZURE_OPENAI_KEY=tu-clave-de-openai
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Servidor
PORT=3000
CORS_ORIGIN=*
```

### Obtener Credenciales de Azure

#### 1. Azure Document Intelligence

1. Ve al [Portal de Azure](https://portal.azure.com)
2. Crea un recurso de **Document Intelligence** en la región **East US 2**
3. Una vez creado, ve a "Keys and Endpoint"
4. Copia el **Endpoint** y una de las **Keys**
5. Pégalos en el archivo `.env` como `AZURE_DOC_ENDPOINT` y `AZURE_DOC_KEY`

#### 2. Azure OpenAI (Foundry)

1. Ve al [Portal de Azure](https://portal.azure.com)
2. Crea un recurso de **Azure OpenAI** en la región **East US 2**
3. Ve a Azure AI Foundry y crea un deployment de **gpt-4o**
4. Obtén el **Endpoint** (debe terminar en `services.ai.azure.com`)
5. Obtén la **Key** del recurso
6. Copia el nombre del **Deployment** (ej: `gpt-4o`)
7. Pégalos en el archivo `.env`

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
│   │   ├── ocrService.ts       # Servicio OCR (Azure Document Intelligence)
│   │   └── azureOpenAIService.ts # Servicio Azure OpenAI (GPT-4o)
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
3. **OCR**: Usa Azure Document Intelligence para extraer texto
4. **Extracción**: Obtiene el texto extraído del documento o apunte
5. **Análisis**: Envía el texto extraído y la descripción a Azure OpenAI (GPT-4o)
6. **Análisis comprensivo**: GPT-4o analiza el contenido y detecta:
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

### OCR: Azure Document Intelligence

- ✅ Modelo: `prebuilt-read`
- ✅ API version: `2023-07-31`
- ✅ Alta precisión, especialmente para texto escrito a mano
- ✅ Buen rendimiento con ecuaciones y fórmulas
- ✅ Procesamiento asíncrono con polling
- ⚠️ Requiere suscripción de Azure

### LLM: Azure OpenAI (GPT-4o)

- ✅ Desplegado via Azure AI Foundry
- ✅ Endpoint: `services.ai.azure.com`
- ✅ Excelente para análisis de texto y comprensión de contexto
- ✅ Capaz de analizar apuntes escritos a mano de cualquier índole
- ✅ Detecta y explica ecuaciones si están presentes
- ✅ Soporte para múltiples idiomas
- ✅ Respuestas siempre en español

## Límites y Validaciones

- Tamaño máximo de imagen: 10MB
- Formatos soportados: JPEG, PNG, GIF, WebP
- La imagen debe ser un data URI válido (data:image/...;base64,...)
- Idiomas OCR soportados: Múltiples idiomas (configurado en Azure Document Intelligence)

## Seguridad

- ⚠️ **IMPORTANTE**: Nunca expongas las API keys en el código del cliente
- Las API keys deben estar solo en el backend (archivo `.env`)
- En producción, usa variables de entorno del servidor
- Configura CORS apropiadamente para producción
- Considera implementar rate limiting para prevenir abuso

## Troubleshooting

### Error: "Azure Document Intelligence no está configurado"

- Verifica que `AZURE_DOC_ENDPOINT` y `AZURE_DOC_KEY` estén en tu archivo `.env`
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto `backend/`
- Verifica que las credenciales sean válidas
- Verifica que el endpoint termine en `cognitiveservices.azure.com`

### Error: "Azure OpenAI no está configurado"

- Verifica que `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY` y `AZURE_OPENAI_DEPLOYMENT` estén en `.env`
- Verifica que el endpoint termine en `services.ai.azure.com` (Foundry)
- Verifica que el deployment name sea correcto (ej: `gpt-4o`)

### Error: CORS

- Verifica que `CORS_ORIGIN` en `.env` permita el origen de la app móvil
- En desarrollo, puedes usar `*` temporalmente
- En producción, especifica el dominio exacto de tu app

### Error: "No se pudo extraer texto"

- Verifica que la imagen sea legible y contenga texto
- Verifica que el formato de imagen sea soportado
- Asegúrate de que la imagen no esté corrupta
- Azure Document Intelligence funciona bien con texto escrito a mano

### Error: OCR timeout

- El OCR de Azure puede tardar unos segundos en procesar
- El sistema hace polling automático hasta obtener resultados
- Si el error persiste, verifica la conectividad con Azure

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

### Azure Document Intelligence (OCR)

- **Tier gratuito**: Consulta los límites actuales en Azure
- Después: Consulta precios en el [Portal de Azure](https://azure.microsoft.com/pricing/details/ai-document-intelligence/)
- Región recomendada: **East US 2** (compatible con suscripciones Student)

### Azure OpenAI (GPT-4o)

- **Suscripción Student**: Créditos gratuitos disponibles
- Después: Consulta precios en el [Portal de Azure](https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/)
- Región recomendada: **East US 2** (compatible con suscripciones Student)

## Licencia

Proyecto de prototipo - Uso interno
