// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Hero Slider ---
  const slides = Array.from(document.querySelectorAll('#hero-slider .hero-slide'));
  if (slides.length) {
    let idx = 0;
    const play = (i) => {
      slides.forEach((s, k) => {
        const v = s.querySelector('video');
        if (k === i) {
          s.classList.add('active'); s.classList.remove('hidden');
          if (v) v.play().catch(()=>{});
        } else {
          s.classList.remove('active'); s.classList.add('hidden');
          if (v) { v.pause(); v.currentTime = 0; }
        }
      });
    };
    play(0);
    setInterval(() => { idx = (idx + 1) % slides.length; play(idx); }, 6000);
  }

  // --- Pausa del carrusel de clientes al pasar el mouse (si deseas JS además del :hover CSS) ---
  const cc = document.querySelector('.client-carousel');
  const container = document.querySelector('.client-carousel-container');
  if (cc && container) {
    container.addEventListener('mouseenter', () => { cc.style.animationPlayState = 'paused'; });
    container.addEventListener('mouseleave', () => { cc.style.animationPlayState = 'running'; });
  }

  // --- Año (backup; también lo hace includes.js) ---
  const y = document.getElementById('current-year');
  if (y) y.textContent = new Date().getFullYear();
});
