#!/bin/bash

echo "🔧 Script de solución automática - Inetmatica Landing Page"
echo "=========================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "server.js" ]; then
    echo "❌ Error: No se encuentra server.js. Ejecuta este script desde el directorio del proyecto."
    exit 1
fi

echo "📁 Directorio correcto verificado"

# Paso 1: Detener todos los procesos PM2
echo "🛑 Deteniendo procesos PM2..."
pm2 delete all 2>/dev/null || echo "No hay procesos PM2 para detener"

# Paso 2: Verificar y corregir permisos
echo "🔒 Corrigiendo permisos de archivos..."
chmod 755 public/ 2>/dev/null || true
chmod 644 public/* 2>/dev/null || true
chmod 644 server.js package.json 2>/dev/null || true
chmod 644 .env 2>/dev/null || true

# Paso 3: Verificar archivo .env
echo "🔧 Verificando archivo .env..."
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo "📋 Creando .env desde env.example..."
        cp env.example .env
        echo "⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones reales"
    else
        echo "❌ No se encuentra env.example. Creando .env básico..."
        cat > .env << EOF
PORT=3000
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=contacto.inetmatica@gmail.com
EMAIL_PASS=kpeq pdrb tyrv nyrk
EMAIL_TO=inetmatica@gmail.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5
DOMAIN=http://31.97.145.48:3000
EOF
    fi
else
    echo "✅ Archivo .env existe"
fi

# Paso 4: Verificar dependencias
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
else
    echo "✅ node_modules existe"
fi

# Paso 5: Verificar puertos en uso
echo "🌐 Verificando puertos en uso..."
PORT_IN_USE=$(netstat -tlnp 2>/dev/null | grep :3000 | wc -l)
if [ "$PORT_IN_USE" -gt 0 ]; then
    echo "⚠️  Puerto 3000 está en uso. Intentando liberar..."
    # Intentar matar procesos en puerto 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Paso 6: Probar sintaxis del servidor
echo "🔍 Verificando sintaxis del servidor..."
node -c server.js
if [ $? -ne 0 ]; then
    echo "❌ Error de sintaxis en server.js"
    exit 1
fi
echo "✅ Sintaxis del servidor correcta"

# Paso 7: Crear archivo ecosystem.config.js si no existe
echo "⚙️  Verificando configuración PM2..."
if [ ! -f "ecosystem.config.js" ]; then
    echo "📋 Creando ecosystem.config.js..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'inetmatica-landing',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
fi

# Crear directorio de logs
mkdir -p logs

# Paso 8: Ejecutar diagnóstico
echo "🔍 Ejecutando diagnóstico..."
node diagnose.js

# Paso 9: Intentar iniciar el servidor
echo "🚀 Iniciando servidor..."

# Opción 1: Intentar con PM2
if command -v pm2 >/dev/null 2>&1; then
    echo "📋 Iniciando con PM2..."
    pm2 start ecosystem.config.js
    sleep 3
    
    # Verificar si PM2 está funcionando
    if pm2 list | grep -q "online"; then
        echo "✅ Servidor iniciado correctamente con PM2"
        echo "📋 Estado de PM2:"
        pm2 status
        echo ""
        echo "📋 Para ver logs: pm2 logs"
        echo "📋 Para reiniciar: pm2 restart inetmatica-landing"
        echo "📋 Para detener: pm2 stop inetmatica-landing"
    else
        echo "⚠️  PM2 no funcionó. Intentando inicio directo..."
        pm2 delete all 2>/dev/null || true
        
        # Opción 2: Inicio directo
        echo "🔄 Iniciando servidor directamente..."
        nohup node server.js > logs/server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > server.pid
        
        sleep 3
        
        if kill -0 $SERVER_PID 2>/dev/null; then
            echo "✅ Servidor iniciado directamente (PID: $SERVER_PID)"
            echo "📋 Para ver logs: tail -f logs/server.log"
            echo "📋 Para detener: kill $SERVER_PID"
        else
            echo "❌ Error iniciando el servidor"
            echo "📋 Revisando logs..."
            tail -20 logs/server.log 2>/dev/null || echo "No hay logs disponibles"
            exit 1
        fi
    fi
else
    echo "❌ PM2 no está instalado"
    
    # Instalar PM2
    echo "📥 Instalando PM2..."
    npm install -g pm2
    
    if [ $? -eq 0 ]; then
        echo "✅ PM2 instalado. Reintentando..."
        pm2 start ecosystem.config.js
    else
        echo "❌ Error instalando PM2. Iniciando directamente..."
        nohup node server.js > logs/server.log 2>&1 &
        echo $! > server.pid
    fi
fi

# Paso 10: Verificar que el servidor responde
echo "🌐 Verificando que el servidor responde..."
sleep 5

# Probar conexión local
if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Servidor responde correctamente en localhost:3000"
elif curl -s http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    echo "✅ Servidor responde correctamente en 127.0.0.1:3000"
else
    echo "⚠️  Servidor no responde en localhost. Verificando logs..."
    
    # Mostrar logs recientes
    if [ -f "logs/server.log" ]; then
        echo "📋 Últimas líneas del log:"
        tail -10 logs/server.log
    fi
    
    if command -v pm2 >/dev/null 2>&1; then
        echo "📋 Logs de PM2:"
        pm2 logs --lines 10
    fi
fi

echo ""
echo "🎉 Script de solución completado"
echo "📋 El servidor debería estar funcionando en http://31.97.145.48:3000"
echo "📋 Si hay problemas, revisa los logs con: pm2 logs o tail -f logs/server.log" 