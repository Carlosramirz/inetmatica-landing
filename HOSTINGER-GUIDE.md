# 🎯 Guía Específica para VPS Hostinger - Inetmatica

## 📋 **Checklist Previo**

Antes de empezar, asegúrate de tener:
- [ ] **Acceso SSH al VPS** (IP, usuario, contraseña)
- [ ] **Dominio configurado** apuntando al VPS
- [ ] **Gmail configurado** con contraseña de aplicación

## 🚀 **Pasos de Despliegue**

### **Paso 1: Subir Archivos al VPS**

**Opción A: Usando FileZilla/WinSCP**
1. Conecta por SFTP a tu VPS
2. Sube estos archivos a `/home/usuario/inetmatica/`:
   ```
   server.js
   package.json
   ecosystem.config.js
   install.sh
   env.example
   public/ (carpeta completa)
   ```

**Opción B: Usando Git (recomendado)**
```bash
# En tu VPS
git clone https://github.com/tu-usuario/inetmatica.git
cd inetmatica
```

### **Paso 2: Conectar al VPS**
```bash
ssh root@tu-ip-vps
# o si tienes usuario específico:
ssh usuario@tu-ip-vps
```

### **Paso 3: Ejecutar Instalación Automática**
```bash
# Ir al directorio del proyecto
cd /home/usuario/inetmatica

# Dar permisos al script
chmod +x install.sh

# Ejecutar instalación
sudo ./install.sh
```

### **Paso 4: Configurar Variables de Entorno**
```bash
# Editar archivo .env
nano .env
```

**Configuración para Hostinger:**
```env
# Configuración del Servidor
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://tudominio.com

# Configuración de Email
EMAIL_USER=contacto.inetmatica@gmail.com
EMAIL_PASS=kpeq_pdrb_tyrv_nyrk
ADMIN_EMAIL=inetmatica@gmail.com

# Configuración de Seguridad
JWT_SECRET=inetmatica_super_secret_key_2024_hostinger_vps_production
```

### **Paso 5: Iniciar la Aplicación**
```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Verificar estado
pm2 status

# Configurar auto-inicio
pm2 startup
pm2 save
```

### **Paso 6: Configurar Nginx**
```bash
# Crear configuración
sudo nano /etc/nginx/sites-available/inetmatica
```

**Contenido del archivo:**
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tudominio.com www.tudominio.com;

    # Configuración SSL (se añadirá automáticamente con certbot)
    
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
        
        # Timeouts
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }

    # Optimizaciones para archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/inetmatica /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### **Paso 7: Instalar SSL (HTTPS)**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### **Paso 8: Verificar Todo**
1. **Visita tu dominio**: `https://tudominio.com`
2. **Prueba el formulario** de contacto
3. **Verifica logs**: `pm2 logs inetmatica-backend`

## 🔧 **Comandos Útiles para Hostinger**

```bash
# Ver estado de la aplicación
pm2 status

# Reiniciar aplicación
pm2 restart inetmatica-backend

# Ver logs en tiempo real
pm2 logs inetmatica-backend --lines 50

# Verificar uso de recursos
htop
# o
pm2 monit

# Verificar puertos abiertos
netstat -tulpn | grep :3000

# Verificar estado de Nginx
sudo systemctl status nginx

# Reiniciar servicios si es necesario
sudo systemctl restart nginx
pm2 restart inetmatica-backend
```

## 🐛 **Solución de Problemas Comunes**

### **Error: Puerto 3000 en uso**
```bash
# Verificar qué proceso usa el puerto
sudo lsof -i :3000

# Matar proceso si es necesario
sudo kill -9 PID_DEL_PROCESO
```

### **Error: Nginx no inicia**
```bash
# Verificar configuración
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/error.log
```

### **Error: PM2 no encuentra Node**
```bash
# Verificar PATH
which node
which npm

# Si no están en PATH, crear enlaces
sudo ln -s /usr/bin/node /usr/local/bin/node
sudo ln -s /usr/bin/npm /usr/local/bin/npm
```

### **Error: Emails no llegan**
```bash
# Verificar variables de entorno
pm2 env inetmatica-backend

# Probar conexión SMTP
node -e "console.log('EMAIL_USER:', process.env.EMAIL_USER)"
```

## 📊 **Monitoreo y Mantenimiento**

### **Configurar Logs**
```bash
# Rotar logs de PM2
pm2 install pm2-logrotate

# Configurar rotación
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### **Backup Automático**
```bash
# Crear script de backup
nano /home/usuario/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/usuario/backups/inetmatica_$DATE.tar.gz /home/usuario/inetmatica
find /home/usuario/backups -name "inetmatica_*.tar.gz" -mtime +7 -delete
```

## ✅ **Checklist Final**

- [ ] VPS conectado por SSH
- [ ] Archivos subidos correctamente
- [ ] Node.js y PM2 instalados
- [ ] Variables de entorno configuradas
- [ ] Aplicación corriendo con PM2
- [ ] Nginx configurado y funcionando
- [ ] SSL instalado y funcionando
- [ ] Dominio apuntando correctamente
- [ ] Formulario de contacto probado
- [ ] Emails llegando a destino

**🎉 ¡Tu landing page Inetmatica está lista en Hostinger!** 