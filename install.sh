#!/bin/bash

# 🚀 Script de Instalación Automática - Inetmatica
# Para VPS Ubuntu/Debian

echo "🚀 Iniciando instalación de Inetmatica Backend..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[ÉXITO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Actualizar sistema
print_status "Actualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js
print_status "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalación
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION instalado"
print_success "npm $NPM_VERSION instalado"

# 3. Instalar dependencias del proyecto
print_status "Instalando dependencias del proyecto..."
npm install

# 4. Instalar PM2
print_status "Instalando PM2..."
npm install -g pm2

# 5. Instalar Nginx
print_status "Instalando Nginx..."
apt install nginx -y

# 6. Configurar firewall básico
print_status "Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 7. Verificar que el archivo .env existe
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Copiando desde env.example..."
    cp env.example .env
    print_warning "¡IMPORTANTE! Edita el archivo .env con tus configuraciones:"
    print_warning "nano .env"
fi

print_success "Instalación base completada!"
print_status "Próximos pasos:"
echo "1. Editar archivo .env con tus configuraciones"
echo "2. Ejecutar: pm2 start ecosystem.config.js"
echo "3. Configurar Nginx para tu dominio"
echo "4. Instalar SSL con certbot"

print_status "Para más detalles, consulta DEPLOYMENT.md" 