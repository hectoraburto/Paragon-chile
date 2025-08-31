// js/includes.js
(function () {
  function ready(fn){ document.readyState!=='loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  async function loadPartial(where, name, base) {
    const url = `${base}partials/${name}.html`;
    const res = await fetch(url + "?v=" + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${url}`);
    let html = await res.text();
    html = html.replaceAll("{{BASE}}", base);
    where.outerHTML = html;
  }

  function markActiveLinks() {
    const path = location.pathname.replace(/\/index\.html$/,'/').toLowerCase();
    const hash = location.hash || "";
    document.querySelectorAll('a.nav-link').forEach(a => {
      let active = false;
      const re = a.getAttribute('data-match');
      if (re) {
        try { active = new RegExp(re, 'i').test(path); } catch(e) {}
      } else {
        const u = new URL(a.href, location.origin);
        active = (u.pathname.toLowerCase() === path) || (hash && a.hash === hash);
      }
      if (active) {
        a.classList.add('nav-link--active');
        a.setAttribute('aria-current','page');
      }
    });
  }

  function wireMenuBehavior() {
    const header = document.querySelector('header');
    if (!header) return;
    const btn = header.querySelector('#menu-toggle');
    const menu = header.querySelector('#menu');
    if (!btn || !menu) return;

    const closeMenu = () => { menu.classList.add('hidden'); btn.setAttribute('aria-expanded','false'); };
    const openMenu  = () => { menu.classList.remove('hidden'); btn.setAttribute('aria-expanded','true'); };

    btn.addEventListener('click', () => {
      menu.classList.contains('hidden') ? openMenu() : closeMenu();
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  ready(async () => {
    const targets = document.querySelectorAll('[data-include]');
    for (const t of targets) {
      const name = t.getAttribute('data-include');
      const base = t.getAttribute('data-base') || '';
      try { await loadPartial(t, name, base); } catch (e) { console.error(e); }
    }

    // Behaviors que requieren header/footer ya inyectados
    wireMenuBehavior();
    markActiveLinks();

    // Año dinámico (por si lo usas en footer)
    document.querySelectorAll('#current-year').forEach(s => s.textContent = new Date().getFullYear());
  });
})();
