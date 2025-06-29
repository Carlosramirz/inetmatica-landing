#!/bin/bash

echo "🚀 Iniciando Inetmatica Landing Page en Hostinger VPS"
echo "=" | tr -d '\n'; for i in {1..60}; do echo -n "="; done; echo

# Verificar que estamos en el directorio correcto
if [ ! -f "server.js" ]; then
    echo "❌ Error: No se encuentra server.js. Ejecuta este script desde el directorio del proyecto."
    exit 1
fi

echo "📁 Verificando estructura de archivos..."
if [ ! -d "public" ]; then
    echo "❌ Error: Directorio public/ no encontrado"
    exit 1
fi

# Corregir permisos (crítico para Linux)
echo "🔒 Corrigiendo permisos de archivos..."
chmod 755 public/
chmod 644 public/* 2>/dev/null || true
chmod 644 server.js
chmod 644 package.json
chmod 644 .env 2>/dev/null || true

# Verificar archivos críticos
echo "🔍 Verificando archivos críticos..."
files=("public/index.html" "public/styles.css" "public/script.js" "public/translations.js" "public/inetmaticapng.png")
missing_files=()

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - NO ENCONTRADO"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Error: Faltan archivos críticos. Verifica tu instalación."
    exit 1
fi

# Verificar e instalar dependencias
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando dependencias"
        exit 1
    fi
fi

# Verificar variables de entorno
echo "🌐 Verificando configuración..."
if [ ! -f ".env" ]; then
    echo "⚠️  Advertencia: Archivo .env no encontrado. Creando desde env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Archivo .env creado. DEBES editarlo con tus credenciales reales."
    else
        echo "❌ Error: No se encuentra env.example"
        exit 1
    fi
fi

# Detener procesos PM2 existentes
echo "🛑 Deteniendo procesos PM2 existentes..."
pm2 delete inetmatica-backend 2>/dev/null || true

# Verificar que el puerto esté libre
PORT=${PORT:-3000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto $PORT está ocupado. Intentando liberar..."
    PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
    kill -9 $PID 2>/dev/null || true
    sleep 2
fi

# Iniciar aplicación
echo "🚀 Iniciando aplicación..."
if [ -f "ecosystem.config.js" ]; then
    echo "📋 Usando configuración PM2..."
    pm2 start ecosystem.config.js
else
    echo "📋 Iniciando directamente con PM2..."
    pm2 start server.js --name "inetmatica-backend"
fi

# Verificar que la aplicación esté corriendo
sleep 3
if pm2 list | grep -q "inetmatica-backend"; then
    echo "✅ Aplicación iniciada correctamente"
    
    # Verificar que los archivos estáticos se sirven
    echo "🔍 Verificando archivos estáticos..."
    
    # Esperar un poco más para que el servidor esté completamente listo
    sleep 2
    
    if curl -s -I http://localhost:$PORT/styles.css | grep -q "200 OK"; then
        echo "✅ CSS se sirve correctamente"
    else
        echo "❌ CSS no se sirve correctamente"
    fi
    
    if curl -s -I http://localhost:$PORT/script.js | grep -q "200 OK"; then
        echo "✅ JavaScript se sirve correctamente"
    else
        echo "❌ JavaScript no se sirve correctamente"
    fi
    
    echo ""
    echo "🎉 ¡Aplicación iniciada exitosamente!"
    echo "🌐 Accede a: http://tu-ip-o-dominio:$PORT"
    echo "📊 Ver estado: pm2 status"
    echo "📋 Ver logs: pm2 logs inetmatica-backend"
    
else
    echo "❌ Error iniciando la aplicación"
    echo "📋 Ver logs de error: pm2 logs"
    exit 1
fi 