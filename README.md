# Sitio Web Paragon Chile

Este paquete contiene el sitio web estático de **Paragon Chile**, listo para ser desplegado en cualquier servidor web o revisado localmente desde VS Code.

## Contenido
- **index.html** → Home con Hero slider (video + imágenes).
- **/servicios/** → Páginas de servicios, cada una con su propio mini-hero slider y carrusel de logos de clientes.
- **/img/** → Imágenes generales.
- **/img/logos/** → Logos de clientes (ejemplo: BHP, Anglo American, ENAP, Codelco, Acciona, Siemens).
- **/video/** → Video de hero principal.
- **/css/style.css** → Estilos del sitio.
- **/js/main.js** → Lógica de sliders y carruseles.

## Cómo visualizar
1. Abre el proyecto en VS Code.
2. Instala la extensión *Live Server* (recomendada) o abre `index.html` en el navegador.
3. Navega entre las secciones y páginas de servicios.

## Cómo reemplazar contenido
### Video del Hero
- Archivo actual: `/video/slide1.mp4`.
- Reemplazar con un archivo `.mp4` optimizado (10–15s, <10MB). Mantener mismo nombre o actualizar la ruta en `index.html`.

### Imágenes del Hero (slides)
- Archivos actuales: `/img/slide2.jpg`, `/img/slide3.jpg`, `/img/slide4.jpg`.
- Reemplazar con imágenes oficiales de Paragon, formato `.jpg` o `.webp` (1920px de ancho recomendado).

### Mini-Hero de Servicios
- Archivos nombrados como `gestion-contractual-slide1.jpg`, etc.
- Ubicados en `/img/`. Se pueden reemplazar por imágenes específicas de cada servicio.

### Logos de Clientes
- Archivos en `/img/logos/`.
- Reemplazar con versiones oficiales en `.svg` o `.png` optimizadas (altura recomendada: 60px).
- El carrusel está configurado para desplazamiento automático; basta con añadir o quitar `<img>` en cada página de servicio.

## Personalización
- **Colores corporativos** → definidos en `:root` dentro de `css/style.css`. Principal: `--blue: #37497B`.
- **Tipografía** → Nobile (para títulos) + Inter (para textos). Se cargan desde Google Fonts.
- **Animaciones** → Configuradas en `js/main.js` para sliders y carrusel de logos.

## Despliegue
- Puede subirse a cualquier hosting estático (Netlify, Vercel, GitHub Pages, etc.).
- Asegúrese de mantener la estructura de carpetas (`/css`, `/js`, `/img`, `/video`).

---
✦ Autor: Equipo de Desarrollo  
✦ Versión: Final con multimedia de ejemplo y logos reales libres  
