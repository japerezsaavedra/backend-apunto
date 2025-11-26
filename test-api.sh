#!/bin/bash

# Script para probar la API de Apunto
# Uso: ./test-api.sh [local|azure]

ENVIRONMENT=${1:-local}

if [ "$ENVIRONMENT" = "azure" ]; then
  API_URL="https://backendapunto.azurewebsites.net"
  echo "🔍 Probando API en Azure: $API_URL"
else
  API_URL="http://localhost:3000"
  echo "🔍 Probando API local: $API_URL"
fi

echo ""
echo "=========================================="
echo "1. Health Check"
echo "=========================================="
curl -s "$API_URL/health" | jq '.' || curl -s "$API_URL/health"
echo ""
echo ""

echo "=========================================="
echo "2. Obtener Historial (GET /api/history)"
echo "=========================================="
curl -s "$API_URL/api/history?limit=5" | jq '.' || curl -s "$API_URL/api/history?limit=5"
echo ""
echo ""

echo "=========================================="
echo "3. Probar Análisis (POST /api/analyze)"
echo "=========================================="
echo "⚠️  Nota: Este endpoint requiere una imagen base64 y descripción"
echo "   Para probarlo completamente, usa la app móvil o Postman"
echo ""
echo "Ejemplo de request válido:"
echo 'curl -X POST "$API_URL/api/analyze" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"image": "data:image/png;base64,iVBORw0KGgo...", "description": "Apunte de matemáticas"}'"'"''
echo ""


