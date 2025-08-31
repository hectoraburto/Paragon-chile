// js/includes.js
(function () {
  function ready(fn){ document.readyState!=='loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  async function loadPartial(where, name, base) {
    const url = `${base}partials/${name}.html`;
    const res = await fetch(url + "?v=" + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${url}`);
    let html = await res.text();
    html = html.replaceAll("{{BASE}}", base);
    where.outerHTML = html; // reemplaza el nodo <header>/<footer> o el contenedor
  }

  ready(async () => {
    // Soporta <header data-include="header" data-base=""> y <footer ...>
    // y también contenedores genéricos con [data-include]
    const targets = document.querySelectorAll('[data-include]');
    for (const t of targets) {
      const name = t.getAttribute('data-include'); // "header" | "footer"
      const base = t.getAttribute('data-base') || '';
      try { await loadPartial(t, name, base); } catch (e) { console.error(e); }
    }

    // Inicializa comportamientos del header ya inyectado
    const header = document.querySelector('header');
    if (header) {
      const btn = header.querySelector('#menu-toggle');
      const menu = header.querySelector('#menu');

      const closeMenu = () => { if (menu){ menu.classList.add('hidden'); btn?.setAttribute('aria-expanded','false'); } };
      const openMenu  = () => { if (menu){ menu.classList.remove('hidden'); btn?.setAttribute('aria-expanded','true'); } };

      if (btn && menu) {
        btn.addEventListener('click', () => {
          menu.classList.contains('hidden') ? openMenu() : closeMenu();
        });
        document.addEventListener('click', (e) => {
          if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
        });
        document.addEventListener('keydown', (e) => { if (e.key==='Escape') closeMenu(); });
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
      }
    }

    // Año dinámico en footer
    const yearSpans = document.querySelectorAll('#current-year');
    yearSpans.forEach(s => s.textContent = new Date().getFullYear());
  });
})();
