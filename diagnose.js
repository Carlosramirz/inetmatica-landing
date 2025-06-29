#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico avanzado del servidor - Inetmatica Landing Page');
console.log('=' .repeat(70));

// Verificar Node.js version
console.log('\n📋 Información del sistema:');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Current directory: ${process.cwd()}`);

// Verificar estructura de archivos
const filesToCheck = [
    'public/index.html',
    'public/styles.css',
    'public/script.js',
    'public/translations.js',
    'public/inetmaticapng.png',
    'server.js',
    'package.json',
    '.env'
];

console.log('\n📁 Verificando estructura de archivos:');
let missingFiles = [];
filesToCheck.forEach(file => {
    try {
        const fullPath = path.join(__dirname, file);
        const stats = fs.statSync(fullPath);
        const size = (stats.size / 1024).toFixed(2);
        const permissions = '0' + (stats.mode & parseInt('777', 8)).toString(8);
        console.log(`✅ ${file} - ${size}KB - Permisos: ${permissions}`);
    } catch (error) {
        console.log(`❌ ${file} - NO ENCONTRADO`);
        missingFiles.push(file);
    }
});

// Verificar variables de entorno
console.log('\n🔧 Verificando variables de entorno:');
if (fs.existsSync('.env')) {
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        const requiredVars = [
            'PORT',
            'NODE_ENV',
            'EMAIL_HOST',
            'EMAIL_PORT',
            'EMAIL_USER',
            'EMAIL_PASS',
            'EMAIL_TO'
        ];
        
        const envVars = {};
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        
        requiredVars.forEach(varName => {
            if (envVars[varName]) {
                if (varName.includes('PASS')) {
                    console.log(`✅ ${varName}=***hidden***`);
                } else {
                    console.log(`✅ ${varName}=${envVars[varName]}`);
                }
            } else {
                console.log(`❌ ${varName} - NO CONFIGURADO`);
            }
        });
        
    } catch (error) {
        console.log(`❌ Error leyendo .env: ${error.message}`);
    }
} else {
    console.log('❌ Archivo .env no encontrado');
}

// Verificar dependencias
console.log('\n📦 Verificando dependencias:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const requiredDeps = [
        'express',
        'nodemailer',
        'cors',
        'helmet',
        'express-rate-limit',
        'express-validator',
        'morgan',
        'dotenv'
    ];
    
    requiredDeps.forEach(dep => {
        if (dependencies[dep]) {
            console.log(`✅ ${dep}@${dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep} - NO INSTALADO`);
        }
    });
    
    // Verificar si node_modules existe
    if (fs.existsSync('node_modules')) {
        const nodeModulesStats = fs.statSync('node_modules');
        console.log(`✅ node_modules - ${nodeModulesStats.isDirectory() ? 'Directorio' : 'Archivo'}`);
    } else {
        console.log('❌ node_modules - NO ENCONTRADO');
    }
    
} catch (error) {
    console.log(`❌ Error leyendo package.json: ${error.message}`);
}

// Verificar puerto
console.log('\n🌐 Verificando configuración de red:');
const { exec } = require('child_process');

// Verificar si el puerto está en uso
const port = process.env.PORT || 3000;
exec(`netstat -tlnp | grep :${port}`, (error, stdout, stderr) => {
    if (stdout) {
        console.log(`⚠️  Puerto ${port} está en uso:`);
        console.log(stdout);
    } else {
        console.log(`✅ Puerto ${port} está disponible`);
    }
});

// Verificar procesos PM2
exec('pm2 list', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ PM2 no está instalado o no funciona');
    } else {
        console.log('\n📋 Procesos PM2:');
        console.log(stdout);
    }
});

// Verificar logs de PM2
exec('pm2 logs --lines 10', (error, stdout, stderr) => {
    if (!error && stdout) {
        console.log('\n📋 Últimos logs de PM2:');
        console.log(stdout);
    }
});

// Probar conexión a la base de datos de email (si aplica)
console.log('\n📧 Verificando configuración de email:');
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const nodemailer = require('nodemailer');
    
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        transporter.verify((error, success) => {
            if (error) {
                console.log(`❌ Error de conexión de email: ${error.message}`);
            } else {
                console.log('✅ Configuración de email válida');
            }
        });
        
    } catch (error) {
        console.log(`❌ Error configurando email: ${error.message}`);
    }
} else {
    console.log('⚠️  Variables de email no configuradas completamente');
}

// Verificar sintaxis del servidor
console.log('\n🔍 Verificando sintaxis del servidor:');
try {
    require('./server.js');
    console.log('❌ Error: El servidor se ejecutó en lugar de solo verificar sintaxis');
} catch (error) {
    if (error.code === 'EADDRINUSE') {
        console.log('✅ Sintaxis del servidor correcta (puerto en uso es normal)');
    } else {
        console.log(`❌ Error de sintaxis en server.js: ${error.message}`);
    }
}

// Resumen de problemas
console.log('\n📋 RESUMEN:');
if (missingFiles.length > 0) {
    console.log(`❌ Archivos faltantes: ${missingFiles.join(', ')}`);
}

// Recomendaciones
console.log('\n💡 RECOMENDACIONES:');
console.log('1. Si faltan archivos, ejecuta: git pull origin main');
console.log('2. Si faltan dependencias, ejecuta: npm install');
console.log('3. Si falta .env, copia de env.example: cp env.example .env');
console.log('4. Si PM2 falla, reinicia: pm2 delete all && pm2 start server.js --name inetmatica-landing');
console.log('5. Para ver logs en tiempo real: pm2 logs --lines 50');

console.log('\n🔧 Para solucionar problemas comunes:');
console.log('chmod 755 public/');
console.log('chmod 644 public/*');
console.log('chmod 644 server.js package.json');

console.log('\n✅ Diagnóstico completado'); 