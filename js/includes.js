// js/includes.js
document.addEventListener('DOMContentLoaded', async () => {
  const containers = document.querySelectorAll('[data-include]');
  for (const el of containers) {
    const name = el.getAttribute('data-include'); // "header" o "footer"
    const base = el.getAttribute('data-base') || ''; // "" (home) o "../" (servicios)
    try {
      const res = await fetch(`${base}partials/${name}.html`);
      const html = await res.text();
      // Reemplaza {{BASE}} por el prefijo correcto
      el.innerHTML = html.replaceAll('{{BASE}}', base);

      // Inicializar header (menú móvil)
      if (name === 'header') {
        const btn = el.querySelector('#menu-toggle');
        const menu = el.querySelector('#menu');
        if (btn && menu) {
          btn.setAttribute('aria-expanded', 'false');
          btn.addEventListener('click', () => {
            const isHidden = menu.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', String(!isHidden));
          });
          // Cerrar al hacer click fuera
          document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
              menu.classList.add('hidden');
              btn.setAttribute('aria-expanded', 'false');
            }
          });
          // Cerrar con ESC
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              menu.classList.add('hidden');
              btn.setAttribute('aria-expanded', 'false');
            }
          });
          // Cerrar al navegar
          menu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
              menu.classList.add('hidden');
              btn.setAttribute('aria-expanded', 'false');
            });
          });
        }
      }

      // Año dinámico (footer)
      const y = el.querySelector('#current-year');
      if (y) y.textContent = new Date().getFullYear();

    } catch (err) {
      console.error(`No se pudo cargar partial ${name}:`, err);
    }
  }
});
