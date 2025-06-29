const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(morgan('combined'));

// Configuración de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (tu landing page)
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting - máximo 5 emails por IP cada 15 minutos
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 requests por IP
    message: {
        error: 'Demasiados emails enviados. Intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Configuración de Nodemailer
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Validaciones para el formulario de contacto
const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Debe ser un email válido'),
    
    body('service')
        .isIn(['landing', 'ecommerce', 'website'])
        .withMessage('Servicio no válido'),
    
    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('El mensaje debe tener entre 10 y 1000 caracteres')
];

// Ruta principal - servir la landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para enviar emails
app.post('/api/send-email', emailLimiter, contactValidation, async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: errors.array()
            });
        }

        const { name, email, service, message } = req.body;

        // Crear transporter
        const transporter = createTransporter();

        // Verificar conexión
        await transporter.verify();

        // Mapear servicios
        const serviceNames = {
            landing: 'Landing Page',
            ecommerce: 'E-commerce',
            website: 'Sitio Web'
        };

        // Email para ti (notificación)
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `🚀 Nueva Consulta de ${serviceNames[service]} - Inetmatica`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e40af; margin: 0;">Nueva Consulta - Inetmatica</h1>
                        <p style="color: #666; margin: 10px 0;">Has recibido una nueva consulta desde tu landing page</p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #1f2937; margin-top: 0;">Detalles del Cliente:</h2>
                        <p><strong>Nombre:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Servicio:</strong> ${serviceNames[service]}</p>
                        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                    </div>
                    
                    <div style="background: #fff; padding: 20px; border-left: 4px solid #1e40af; margin-bottom: 20px;">
                        <h3 style="color: #1f2937; margin-top: 0;">Mensaje:</h3>
                        <p style="line-height: 1.6; color: #374151;">${message}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="mailto:${email}" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Responder Cliente
                        </a>
                    </div>
                </div>
            `
        };

        // Email de confirmación para el cliente
        const clientMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `✅ Hemos recibido tu consulta - Inetmatica`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e40af; margin: 0;">¡Gracias por contactarnos!</h1>
                        <p style="color: #666; margin: 10px 0;">Tu consulta ha sido recibida exitosamente</p>
                    </div>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #1f2937; margin-top: 0;">Hola ${name},</h2>
                        <p style="line-height: 1.6; color: #374151;">
                            Gracias por tu interés en nuestros servicios de <strong>${serviceNames[service]}</strong>. 
                            Hemos recibido tu consulta y nos pondremos en contacto contigo en un plazo máximo de 24 horas.
                        </p>
                    </div>
                    
                    <div style="background: #fff; padding: 20px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                        <h3 style="color: #1f2937; margin-top: 0;">¿Qué sigue?</h3>
                        <ul style="color: #374151; line-height: 1.6;">
                            <li>Revisaremos tu consulta en detalle</li>
                            <li>Te contactaremos para una consulta gratuita</li>
                            <li>Crearemos una propuesta personalizada</li>
                            <li>¡Comenzaremos a trabajar en tu proyecto!</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666; margin: 10px 0;">
                            Mientras tanto, síguenos en nuestras redes sociales:
                        </p>
                        <a href="https://www.instagram.com/inetmatica" style="background: #1e40af; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin: 0 5px;">
                            Instagram
                        </a>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 14px;">
                            © 2024 Inetmatica - Transformando ideas en experiencias digitales
                        </p>
                    </div>
                </div>
            `
        };

        // Enviar ambos emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(clientMailOptions)
        ]);

        res.json({
            success: true,
            message: 'Email enviado exitosamente'
        });

    } catch (error) {
        console.error('Error enviando email:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Manejo de rutas dinámicas (blobs, etc.)
app.get('/:id', (req, res) => {
    // Si es una ruta que parece un UUID o blob, devolver 404 con mensaje apropiado
    const id = req.params.id;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(404).json({
            success: false,
            message: 'Recurso temporal no encontrado'
        });
    }
    
    // Para otras rutas, redirigir al inicio
    res.redirect('/');
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores globales
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// Configuración de CSP mejorada
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "worker-src 'self' blob:; " +
        "child-src 'self' blob:; " +
        "connect-src 'self';"
    );
    next();
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📧 Email configurado: ${process.env.EMAIL_USER}`);
    console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
}); 