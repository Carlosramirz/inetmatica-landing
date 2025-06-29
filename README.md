# Inetmatica - Landing Page Profesional

Una landing page moderna y atractiva para el perfil de Instagram de Inetmatica, especializada en desarrollo web profesional.

## 🚀 Características

- **Sistema Multiidioma**: Español e Inglés con cambio dinámico 🌍
- **Diseño Responsive**: Perfecto en todos los dispositivos (móvil, tablet, desktop)
- **Backend Node.js**: Sistema de emails con Nodemailer y validación
- **Logo Real de Inetmatica**: Integrado en header y footer
- **Menú Hamburger Funcional**: Navegación móvil completamente operativa
- **Animaciones Modernas**: Efectos suaves y atractivos
- **Formulario de Contacto**: Funcional con backend y validación
- **SEO Optimizado**: Estructura semántica y meta tags
- **Performance**: Carga rápida y optimizada
- **Accesibilidad**: Navegación por teclado y lectores de pantalla

## 📁 Estructura del Proyecto

```
Pruebas/
├── server.js              # Servidor Node.js con Express
├── package.json           # Dependencias del proyecto
├── .env                   # Variables de entorno (no incluido en Git)
├── ecosystem.config.js    # Configuración PM2
├── install.sh             # Script de instalación VPS
├── DEPLOYMENT.md          # Guía de despliegue
├── HOSTINGER-GUIDE.md     # Guía específica Hostinger
├── public/                # Frontend
│   ├── index.html         # Página principal
│   ├── styles.css         # Estilos CSS
│   ├── script.js          # Funcionalidad JavaScript
│   ├── translations.js    # Sistema de traducciones
│   └── inetmaticapng.png  # Logo de Inetmatica
└── README.md              # Documentación
```

## 🎨 Secciones Incluidas

1. **Header/Navegación**: Menú fijo con logo y navegación suave
2. **Hero Section**: Sección principal con llamada a la acción
3. **Servicios**: Landing pages, E-commerce, Sitios web
4. **Características**: Por qué elegir Inetmatica
5. **Portafolio**: Muestra de proyectos realizados
6. **Contacto**: Formulario y información de contacto
7. **Footer**: Logo, enlaces y redes sociales

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Grid y Flexbox
- **JavaScript ES6+**: Interactividad y sistema de traducciones
- **Font Awesome**: Iconos profesionales
- **Google Fonts**: Tipografía Inter

### Backend
- **Node.js**: Servidor backend
- **Express**: Framework web
- **Nodemailer**: Sistema de emails
- **Express-validator**: Validación de datos
- **Express-rate-limit**: Rate limiting
- **Helmet**: Middleware de seguridad

## 🌍 Sistema de Idiomas

La página incluye un sistema completo de traducción:

### Características
- **Cambio dinámico**: Botón en el header para alternar idiomas
- **Persistencia**: Recuerda el idioma seleccionado en localStorage
- **Traducción completa**: Todo el contenido se traduce automáticamente
- **Formulario inteligente**: Placeholders y opciones se actualizan

### Idiomas Disponibles
- **Español (ES)** 🇪🇸 - Idioma por defecto
- **Inglés (EN)** 🇺🇸 - Traducción completa

### Cómo Funciona
1. **Archivo de traducciones**: `public/translations.js` contiene todas las traducciones
2. **Atributos HTML**: Elementos marcados con `data-translate` y `data-translate-html`
3. **JavaScript dinámico**: Sistema que aplica traducciones en tiempo real
4. **Persistencia**: LocalStorage guarda la preferencia del usuario

## 📱 Características Responsive

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: 480px, 768px, 1200px
- **Menú Hamburger**: Navegación móvil completamente funcional
- **Touch Support**: Gestos táctiles para móviles
- **Overflow Control**: Previene scroll cuando el menú está abierto

## 🎯 Funcionalidades JavaScript

- **Navegación Suave**: Scroll automático a secciones
- **Menú Móvil Inteligente**: 
  - Animación del ícono hamburger
  - Cierre al hacer clic en enlaces
  - Cierre al hacer clic fuera del menú
  - Cierre automático al redimensionar ventana
- **Formulario Inteligente**: Validación en tiempo real
- **Notificaciones**: Sistema de alertas elegante
- **Animaciones**: Efectos de entrada y hover
- **Progress Bar**: Indicador de progreso de scroll

## 🎨 Paleta de Colores

- **Primario**: Azul tecnológico (#1e40af, #3b82f6)
- **Secundario**: Naranja vibrante (#f59e0b)
- **Acento**: Verde éxito (#10b981)
- **Neutros**: Grises modernos (#1f2937, #6b7280)

## 🚀 Cómo Usar

1. **Descarga los archivos** en tu servidor web
2. **Abre `index.html`** en tu navegador
3. **Personaliza el contenido** según tus necesidades
4. **Sube a tu hosting** para hacerlo público

## 📝 Personalización

### Cambiar Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary-color: #1e40af;
    --secondary-color: #f59e0b;
    --gradient-primary: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
}
```

### Modificar Contenido
- **Texto**: Edita directamente en `index.html`
- **Logo**: Reemplaza `inetmaticapng.png` con tu logo
- **Enlaces**: Actualiza los enlaces de redes sociales

### Agregar Nuevas Secciones
1. Añade el HTML en `index.html`
2. Crea los estilos en `styles.css`
3. Agrega funcionalidad en `script.js` si es necesario

## 📧 Configuración del Formulario

El formulario actualmente simula el envío. Para conectarlo a un backend:

1. **EmailJS**: Para envío por email
2. **Netlify Forms**: Para hosting en Netlify
3. **Backend propio**: PHP, Node.js, etc.

### Ejemplo con EmailJS:
```javascript
// En script.js, reemplaza la simulación con:
emailjs.send('service_id', 'template_id', {
    name: name,
    email: email,
    service: service,
    message: message
});
```

## 🔧 Optimizaciones Incluidas

- **Lazy Loading**: Para imágenes (preparado)
- **Debouncing**: Para eventos de scroll
- **Intersection Observer**: Para animaciones eficientes
- **Service Worker**: Para PWA (preparado)
- **Mobile Menu**: Optimizado para UX móvil

## 📊 SEO y Meta Tags

La página incluye:
- Meta tags optimizados
- Estructura semántica HTML5
- Open Graph tags
- Schema markup preparado

## 🌐 Hosting Recomendado

- **Netlify**: Despliegue gratuito y fácil
- **Vercel**: Excelente para sitios estáticos
- **GitHub Pages**: Gratuito para proyectos open source
- **Hosting tradicional**: Cualquier servidor web

## 📈 Analytics

Para agregar Google Analytics:

```html
<!-- En el head de index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎨 Personalización Avanzada

### Agregar Más Animaciones
```css
/* En styles.css */
@keyframes slideInFromLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.animate-slide-left {
    animation: slideInFromLeft 0.6s ease;
}
```

### Modificar el Tema
```css
/* Cambiar el tema de colores */
.hero {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## 📞 Soporte

Para soporte técnico o personalizaciones adicionales:
- **Instagram**: [@inetmatica](https://www.instagram.com/inetmatica)
- **Email**: inetmatica@gmail.com

## 📄 Licencia

Este proyecto está diseñado específicamente para Inetmatica. Todos los derechos reservados.

---

**Desarrollado con ❤️ para Inetmatica** 