// Aparición en scroll con IntersectionObserver
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Lightbox básico
const lightboxLinks = document.querySelectorAll('.lightbox');
const lightboxDiv = document.createElement('div');
lightboxDiv.id = 'lightbox';
document.body.appendChild(lightboxDiv);

lightboxLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    lightboxDiv.classList.add('active');
    const img = document.createElement('img');
    img.src = link.getAttribute('href');
    img.alt = link.querySelector('img')?.alt || 'Imagen ampliada';
    while (lightboxDiv.firstChild) lightboxDiv.removeChild(lightboxDiv.firstChild);
    lightboxDiv.appendChild(img);
  });
});

lightboxDiv.addEventListener('click', () => lightboxDiv.classList.remove('active'));

// Formulario (simulado). Si deseas envío real, te conecto a Formspree o EmailJS.
const form = document.getElementById('form-contacto');
const statusEl = document.getElementById('form-status');
form?.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  statusEl.textContent = `Gracias, ${nombre || '—'}. Hemos recibido su mensaje.`;
  form.reset();
});



