// paragon-chile/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Slider Hero (Home) ---
    const slides = document.querySelectorAll('#hero-slider .hero-slide');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 segundos

    function showSlide(index) {
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
                slide.classList.remove('hidden');
                // Si es el primer slide (video), asegurarse de que el video se reproduzca
                if (i === 0 && slide.querySelector('video')) {
                    slide.querySelector('video').play();
                } else if (slide.querySelector('video')) {
                    // Pausar el video en otros slides
                    slide.querySelector('video').pause();
                }
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

    // Inicializar el slider y el autoplay
    showSlide(currentSlide);
    setInterval(nextSlide, slideInterval);

    // --- Carrusel de Logos de Clientes ---
    // La animación del carrusel se maneja principalmente con CSS (@keyframes)
    // El JavaScript aquí podría ser para un control más avanzado si fuera necesario,
    // pero para un scroll infinito y pausa al hover, CSS es suficiente.

    // Obtener el año actual para el footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
