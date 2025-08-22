// paragon-chile/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Slider Hero (Home) ---
  const slides = document.querySelectorAll('#hero-slider .hero-slide');
  let currentSlide = 0;
  const slideInterval = 5000; // 5s

  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
        slide.classList.remove('hidden');
        const v = slide.querySelector('video');
        if (v && i === 0) v.play();
        if (v && i !== 0) v.pause();
      } else {
        slide.classList.remove('active');
        slide.classList.add('hidden');
      }
    });
  }
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  showSlide(currentSlide);
  setInterval(nextSlide, slideInterval);

  // --- Footer: año actual ---
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

  // --- Menú móvil accesible ---
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');

  if (btn && menu) {
    const openMenu = () => {
      menu.classList.remove('hidden', 'opacity-0', 'translate-y-2');
      btn.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', () => {
      if (menu.classList.contains('hidden')) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      const withinMenu = menu.contains(e.target);
      const withinBtn = btn.contains(e.target);
      if (!withinMenu && !withinBtn) closeMenu();
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Cerrar al navegar (click en un enlace del menú)
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => closeMenu());
    });
  }
});
