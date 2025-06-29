# 🚀 Guía de Despliegue - Inetmatica Backend

## 📋 Pasos para Desplegar en tu VPS Hostinger

### 1. **Preparar el Gmail "Puente"**

Antes de desplegar, necesitas:

1. **Crear un Gmail nuevo** (ej: `contacto.inetmatica@gmail.com`)
2. **Activar la verificación en 2 pasos** en ese Gmail
3. **Generar una contraseña de aplicación**:
   - Ve a: Cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones
   - Selecciona "Correo" y "Otro" 
   - Copia la contraseña generada (16 caracteres)
4. **Configurar reenvío** al Gmail principal

### 2. **Subir Archivos al VPS**

Sube estos archivos a tu VPS:
```
/
├── server.js
├── package.json
├── env.example
└── public/
    ├── index.html
    ├── styles.css
    ├── script.js
    └── inetmaticapng.png
```

### 3. **Conectar al VPS por SSH**

```bash
ssh root@tu-ip-del-vps
# o
ssh usuario@tu-ip-del-vps
```

### 4. **Instalar Node.js (si no está instalado)**

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 5. **Configurar el Proyecto**

```bash
# Ir al directorio del proyecto
cd /path/to/your/project

# Instalar dependencias
npm install

# Crear archivo .env
cp env.example .env
nano .env
```

### 6. **Configurar Variables de Entorno**

Edita el archivo `.env`:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://tudominio.com

# Configuración de Email (Gmail puente)
EMAIL_USER=contacto.inetmatica@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion_16_caracteres
ADMIN_EMAIL=tu_email_personal@gmail.com

# Configuración de Seguridad
JWT_SECRET=genera_una_clave_secreta_muy_larga_y_aleatoria_aqui
```

### 7. **Instalar PM2 (Administrador de Procesos)**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo de configuración PM2
nano ecosystem.config.js
```

Contenido del `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'inetmatica-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 8. **Iniciar la Aplicación**

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Verificar que esté corriendo
pm2 status

# Ver logs
pm2 logs inetmatica-backend

# Configurar PM2 para auto-inicio
pm2 startup
pm2 save
```

### 9. **Configurar Nginx (Proxy Reverso)**

```bash
# Instalar Nginx
apt install nginx -y

# Crear configuración del sitio
nano /etc/nginx/sites-available/inetmatica
```

Contenido del archivo Nginx:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar el sitio
ln -s /etc/nginx/sites-available/inetmatica /etc/nginx/sites-enabled/

# Probar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx
```

### 10. **Configurar SSL con Certbot (HTTPS)**

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
certbot --nginx -d tudominio.com -d www.tudominio.com

# Verificar renovación automática
certbot renew --dry-run
```

### 11. **Configurar Firewall**

```bash
# Configurar UFW
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable

# Verificar estado
ufw status
```

### 12. **Verificar que Todo Funcione**

1. **Visita tu dominio**: `https://tudominio.com`
2. **Prueba el formulario** de contacto
3. **Verifica los logs**: `pm2 logs inetmatica-backend`
4. **Revisa el email** para confirmar que lleguen

## 🔧 **Comandos Útiles**

```bash
# Ver estado de la aplicación
pm2 status

# Reiniciar aplicación
pm2 restart inetmatica-backend

# Ver logs en tiempo real
pm2 logs inetmatica-backend --lines 100

# Actualizar aplicación
git pull  # si usas Git
pm2 restart inetmatica-backend

# Ver uso de recursos
pm2 monit
```

## 🐛 **Solución de Problemas**

### Error de Email:
```bash
# Verificar variables de entorno
pm2 env inetmatica-backend

# Probar conexión SMTP
node -e "console.log(process.env.EMAIL_USER)"
```

### Error de Puerto:
```bash
# Verificar qué está usando el puerto
netstat -tulpn | grep :3000

# Cambiar puerto en .env si es necesario
```

### Error de Permisos:
```bash
# Dar permisos correctos
chown -R $USER:$USER /path/to/project
chmod -R 755 /path/to/project
```

## 📧 **Configuración Completa del Gmail Puente**

1. **Gmail Puente** → Configuración → Reenvío → Agregar tu email personal
2. **Verificar** el email de reenvío
3. **Activar** el reenvío automático
4. **Opcional**: Configurar filtros para organizar emails

## ✅ **Checklist Final**

- [ ] Gmail puente creado y configurado
- [ ] Contraseña de aplicación generada
- [ ] Archivos subidos al VPS
- [ ] Node.js y PM2 instalados
- [ ] Variables de entorno configuradas
- [ ] Aplicación iniciada con PM2
- [ ] Nginx configurado
- [ ] SSL activado
- [ ] Firewall configurado
- [ ] Formulario de contacto probado
- [ ] Emails llegando correctamente

¡Tu landing page de Inetmatica está lista para recibir clientes! 🚀 