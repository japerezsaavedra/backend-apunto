# Guía de Despliegue en Azure App Service

Esta guía explica cómo desplegar el backend de Apunto en Azure App Service usando GitHub Actions.

## Pasos para Desplegar

### 1. Crear App Service en Azure

**Opción A: Usando Azure CLI**
```bash
# Crear resource group
az group create --name apunto-resources --location "East US"

# Crear App Service Plan
az appservice plan create \
  --name apunto-plan \
  --resource-group apunto-resources \
  --sku B1 \
  --is-linux

# Crear Web App
az webapp create \
  --resource-group apunto-resources \
  --plan apunto-plan \
  --name apunto-backend \
  --runtime "NODE:20-lts"
```

**Opción B: Usando Azure Portal**
1. Ve a [Azure Portal](https://portal.azure.com)
2. Crea un nuevo App Service
3. Selecciona:
   - Runtime stack: Node.js 20 LTS
   - Operating System: Linux
   - Plan: B1 (Basic) o superior

### 2. Obtener el Publish Profile

1. Ve a Azure Portal → App Service → `apunto-backend`
2. Click en "Get publish profile" (en la barra superior)
3. Descarga el archivo `.PublishSettings`

### 3. Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click en "New repository secret"
4. Agrega:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: Copia TODO el contenido del archivo `.PublishSettings` descargado

### 4. Configurar Variables de Entorno en Azure

1. Ve a Azure Portal → App Service → `apunto-backend`
2. Configuration → Application settings
3. Click en "New application setting" y agrega:

   **Variables Requeridas:**
   - `GEMINI_API_KEY`: Tu API key de Google Gemini
   - `DATABASE_URL`: URL de conexión a PostgreSQL
   - `DATABASE_SSL`: `true` (para conexiones cloud)

   **Variables Opcionales:**
   - `CORS_ORIGIN`: Origen permitido (ej: `https://tu-app.com` o `*`)
   - `USE_GOOGLE_VISION_OCR`: `true` o `false` (default: `false`)
   - `PORT`: Puerto del servidor (default: `3000`, Azure lo configura automáticamente)
   - `NODE_ENV`: `production`

4. Click en "Save"

### 5. Configurar el Workflow

Edita `.github/workflows/azure-deploy.yml` y ajusta:
- `AZURE_WEBAPP_NAME`: Cambia `apunto-backend` por el nombre de tu App Service

## Configuración de Variables de Entorno

### Variables Requeridas

- `GEMINI_API_KEY`: API key de Google Gemini (obligatorio)
- `DATABASE_URL`: URL de conexión a PostgreSQL (obligatorio)
- `DATABASE_SSL`: `true` para conexiones cloud (obligatorio)
- `CORS_ORIGIN`: Origen permitido para CORS (opcional, default: `*`)

### Variables Opcionales

- `USE_GOOGLE_VISION_OCR`: `true` para usar Google Vision API, `false` para Tesseract.js
- `PORT`: Puerto del servidor (default: `3000`)
- `NODE_ENV`: Entorno (default: `production`)

### 6. Activar el Despliegue

El workflow se activa automáticamente cuando:
- Haces push a las ramas `main` o `master`
- Se modifican archivos en `backend/**`
- Lo ejecutas manualmente desde GitHub Actions

## Verificación del Despliegue

Después del despliegue, verifica que el servicio esté funcionando:

```bash
# Health check
curl https://apunto-backend.azurewebsites.net/health

# Debería responder:
# {"status":"ok","message":"Apunto Backend API"}
```

O visita la URL en tu navegador: `https://apunto-backend.azurewebsites.net/health`

## Troubleshooting

### Error: "Cannot find module"
- Verifica que el build de TypeScript se complete correctamente
- Asegúrate de que `dist/` contenga los archivos compilados
- Revisa los logs en Azure Portal → App Service → Log stream

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté correctamente configurado
- Asegúrate de que `DATABASE_SSL=true` para conexiones cloud
- Verifica que el firewall de PostgreSQL permita conexiones desde Azure
- En Azure Portal, agrega la IP del App Service a las reglas de firewall de PostgreSQL

### Error: "Gemini API key not found"
- Verifica que `GEMINI_API_KEY` esté configurado en Application settings
- Asegúrate de que no tenga espacios extra al inicio o final

### Error: "Application failed to start"
- Revisa los logs en Azure Portal → App Service → Log stream
- Verifica que el comando de inicio sea correcto: `node dist/server.js`
- Asegúrate de que el puerto sea configurado por Azure (variable `PORT`)

### Ver Logs en Tiempo Real
```bash
az webapp log tail --name apunto-backend --resource-group apunto-resources
```

## Actualización del Workflow

Para cambiar el nombre del App Service, edita la variable `AZURE_WEBAPP_NAME` en `.github/workflows/azure-deploy.yml`.

