#!/usr/bin/env node

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE EMAIL - INETMATICA');
console.log('================================================\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ ERROR: Archivo .env no encontrado');
    console.log('📋 SOLUCIÓN: Copia el archivo env.example a .env');
    console.log('   cp env.example .env');
    process.exit(1);
}

// Cargar variables de entorno
require('dotenv').config();

console.log('✅ Archivo .env encontrado');
console.log('📧 Verificando configuración de email...\n');

// Verificar variables de entorno requeridas
const requiredVars = ['EMAIL_USER', 'EMAIL_PASS', 'ADMIN_EMAIL'];
const missingVars = [];

requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.log('❌ ERROR: Variables de entorno faltantes:');
    missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('\n📋 SOLUCIÓN: Configura estas variables en tu archivo .env');
    process.exit(1);
}

console.log('✅ Variables de entorno configuradas');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`📧 ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? '***configurada***' : 'NO CONFIGURADA'}\n`);

// Crear transporter
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

console.log('🔧 Configuración del transporter creada');
console.log('🧪 Probando conexión con Gmail...\n');

// Función para probar la conexión
async function testEmailConnection() {
    try {
        console.log('⏳ Verificando autenticación con Gmail...');
        await transporter.verify();
        console.log('✅ Conexión exitosa con Gmail');
        return true;
    } catch (error) {
        console.log('❌ ERROR de conexión con Gmail:');
        console.log(`   ${error.message}`);
        
        if (error.code === 'EAUTH') {
            console.log('\n🔧 POSIBLES SOLUCIONES:');
            console.log('   1. Verifica que la contraseña de aplicación sea correcta');
            console.log('   2. Asegúrate de que la autenticación de 2 factores esté activada');
            console.log('   3. Genera una nueva contraseña de aplicación en Gmail');
            console.log('   4. URL: https://myaccount.google.com/apppasswords');
        } else if (error.code === 'ENOTFOUND') {
            console.log('\n🔧 POSIBLES SOLUCIONES:');
            console.log('   1. Verifica tu conexión a internet');
            console.log('   2. Revisa la configuración de firewall del servidor');
        }
        
        return false;
    }
}

// Función para enviar email de prueba
async function sendTestEmail() {
    try {
        console.log('\n📧 Enviando email de prueba...');
        
        const testMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: '🧪 Test Email - Sistema Inetmatica',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1e40af;">✅ Email de Prueba Exitoso</h1>
                    <p>Este es un email de prueba del sistema de contacto de Inetmatica.</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                    <p><strong>Servidor:</strong> ${process.env.NODE_ENV || 'development'}</p>
                    <p>Si recibiste este email, el sistema está funcionando correctamente.</p>
                </div>
            `
        };

        await transporter.sendMail(testMailOptions);
        console.log('✅ Email de prueba enviado exitosamente');
        console.log(`📧 Revisa la bandeja de entrada de: ${process.env.ADMIN_EMAIL}`);
        return true;
    } catch (error) {
        console.log('❌ ERROR enviando email de prueba:');
        console.log(`   ${error.message}`);
        return false;
    }
}

// Función principal
async function runDiagnosis() {
    try {
        const connectionOk = await testEmailConnection();
        
        if (connectionOk) {
            console.log('\n🎯 Conexión exitosa. Probando envío de email...');
            const emailOk = await sendTestEmail();
            
            if (emailOk) {
                console.log('\n🎉 DIAGNÓSTICO COMPLETADO: Sistema de email funcionando correctamente');
                console.log('💡 Si el formulario sigue fallando, revisa:');
                console.log('   1. Los logs del servidor (pm2 logs)');
                console.log('   2. La configuración del firewall');
                console.log('   3. Las validaciones del formulario en el frontend');
            } else {
                console.log('\n❌ DIAGNÓSTICO: Problemas con el envío de emails');
            }
        } else {
            console.log('\n❌ DIAGNÓSTICO: Problemas de conexión con Gmail');
        }
        
    } catch (error) {
        console.log('\n💥 ERROR INESPERADO:');
        console.log(error);
    }
}

// Ejecutar diagnóstico
runDiagnosis().then(() => {
    console.log('\n🏁 Diagnóstico finalizado');
    process.exit(0);
}).catch(error => {
    console.log('\n💥 ERROR FATAL:', error);
    process.exit(1);
}); 