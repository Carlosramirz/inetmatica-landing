#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico del servidor - Inetmatica Landing Page');
console.log('=' .repeat(60));

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
filesToCheck.forEach(file => {
    try {
        const fullPath = path.join(__dirname, file);
        const stats = fs.statSync(fullPath);
        const size = (stats.size / 1024).toFixed(2);
        const permissions = '0' + (stats.mode & parseInt('777', 8)).toString(8);
        console.log(`✅ ${file} - ${size}KB - Permisos: ${permissions}`);
    } catch (error) {
        console.log(`❌ ${file} - NO ENCONTRADO`);
    }
});

// Verificar contenido de archivos críticos
console.log('\n📄 Verificando contenido de archivos críticos:');

// Verificar index.html
try {
    const indexContent = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
    const hasCSS = indexContent.includes('styles.css');
    const hasJS = indexContent.includes('script.js');
    const hasTranslations = indexContent.includes('translations.js');
    const hasLogo = indexContent.includes('inetmaticapng.png');
    
    console.log(`📄 index.html:`);
    console.log(`   ${hasCSS ? '✅' : '❌'} Referencia a styles.css`);
    console.log(`   ${hasJS ? '✅' : '❌'} Referencia a script.js`);
    console.log(`   ${hasTranslations ? '✅' : '❌'} Referencia a translations.js`);
    console.log(`   ${hasLogo ? '✅' : '❌'} Referencia a inetmaticapng.png`);
} catch (error) {
    console.log(`❌ Error leyendo index.html: ${error.message}`);
}

// Verificar .env
try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const hasEmailUser = envContent.includes('EMAIL_USER');
    const hasEmailPass = envContent.includes('EMAIL_PASS');
    const hasAdminEmail = envContent.includes('ADMIN_EMAIL');
    
    console.log(`🔐 .env:`);
    console.log(`   ${hasEmailUser ? '✅' : '❌'} EMAIL_USER configurado`);
    console.log(`   ${hasEmailPass ? '✅' : '❌'} EMAIL_PASS configurado`);
    console.log(`   ${hasAdminEmail ? '✅' : '❌'} ADMIN_EMAIL configurado`);
} catch (error) {
    console.log(`❌ Error leyendo .env: ${error.message}`);
}

// Verificar permisos de directorio
console.log('\n🔒 Verificando permisos de directorios:');
try {
    const publicStats = fs.statSync(path.join(__dirname, 'public'));
    const publicPerms = '0' + (publicStats.mode & parseInt('777', 8)).toString(8);
    console.log(`✅ public/ - Permisos: ${publicPerms}`);
} catch (error) {
    console.log(`❌ Error verificando directorio public: ${error.message}`);
}

// Verificar variables de entorno
console.log('\n🌐 Variables de entorno:');
console.log(`   PORT: ${process.env.PORT || 'No definido (usará 3000)'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'No definido (usará development)'}`);

// Verificar dependencias
console.log('\n📦 Verificando dependencias:');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    console.log(`✅ Dependencias definidas: ${dependencies.length}`);
    dependencies.forEach(dep => {
        try {
            require.resolve(dep);
            console.log(`   ✅ ${dep}`);
        } catch (error) {
            console.log(`   ❌ ${dep} - NO INSTALADO`);
        }
    });
} catch (error) {
    console.log(`❌ Error leyendo package.json: ${error.message}`);
}

// Comandos recomendados
console.log('\n🛠️  Comandos recomendados si hay problemas:');
console.log('   chmod 755 public/');
console.log('   chmod 644 public/*');
console.log('   npm install');
console.log('   npm start');

console.log('\n✅ Diagnóstico completado'); 