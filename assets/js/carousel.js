/**
 * =============================================
 * CAROUSEL MANAGER
 * Handles automatic slide carousel functionality
 * =============================================
 */

let carouselState = {
    currentSlide: 0,
    totalSlides: 0,
    isTransitioning: false
};

/**
 * Initialize carousel
 * Sets up slides, dots, and auto-advance functionality
 */
function initializeCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    const slides = carouselTrack.querySelectorAll('.carousel-slide:not(.carousel-clone)');
    carouselState.totalSlides = slides.length;
    
    if (carouselState.totalSlides <= 1) return;
    
    // Clone first and last slides for infinite effect
    const firstSlide = slides[0].cloneNode(true);
    const lastSlide = slides[carouselState.totalSlides - 1].cloneNode(true);
    
    firstSlide.classList.add('carousel-clone');
    lastSlide.classList.add('carousel-clone');
    
    carouselTrack.appendChild(firstSlide);
    carouselTrack.insertBefore(lastSlide, slides[0]);
    
    // Start at position 1 (the real first slide, after the cloned last slide)
    carouselState.currentSlide = 1;
    updateCarouselPosition(true);
    
    // Create dots for original slides only
    const carouselDots = document.getElementById('carouselDots');
    if (carouselDots) {
        carouselDots.innerHTML = '';
        for (let i = 0; i < carouselState.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.onclick = () => goToSlide(i);
            carouselDots.appendChild(dot);
        }
    }
    
    // Auto-slide every 5 seconds
    setInterval(autoSlide, 5000);
}

/**
 * Update carousel position
 * @param {boolean} instant - Whether to apply transition instantly
 */
function updateCarouselPosition(instant = false) {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    const slideWidth = carouselTrack.querySelector('.carousel-slide').offsetWidth + 32; // 32 is the gap
    const offset = -carouselState.currentSlide * slideWidth;
    
    if (instant) {
        carouselTrack.style.transition = 'none';
    } else {
        carouselTrack.style.transition = 'transform 0.5s ease-in-out';
    }
    
    carouselTrack.style.transform = `translateX(${offset}px)`;
    
    // Update dots based on actual slide position (accounting for clone)
    const actualSlide = ((carouselState.currentSlide - 1) % carouselState.totalSlides + carouselState.totalSlides) % carouselState.totalSlides;
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === actualSlide);
    });
}

/**
 * Move to next slide
 */
function nextSlide() {
    if (carouselState.isTransitioning) return;
    carouselState.isTransitioning = true;
    
    carouselState.currentSlide++;
    updateCarouselPosition(false);
    
    // Check if we need to loop back
    setTimeout(() => {
        if (carouselState.currentSlide > carouselState.totalSlides) {
            carouselState.currentSlide = 1;
            updateCarouselPosition(true);
        }
        carouselState.isTransitioning = false;
    }, 500);
}

/**
 * Move to previous slide
 */
function prevSlide() {
    if (carouselState.isTransitioning) return;
    carouselState.isTransitioning = true;
    
    carouselState.currentSlide--;
    updateCarouselPosition(false);
    
    // Check if we need to loop forward
    setTimeout(() => {
        if (carouselState.currentSlide < 1) {
            carouselState.currentSlide = carouselState.totalSlides;
            updateCarouselPosition(true);
        }
        carouselState.isTransitioning = false;
    }, 500);
}

/**
 * Go to specific slide by index
 * @param {number} index - Slide index (0-based)
 */
function goToSlide(index) {
    if (carouselState.isTransitioning) return;
    carouselState.currentSlide = index + 1; // +1 because of cloned last slide at position 0
    updateCarouselPosition(false);
}

/**
 * Auto-slide to next slide
 */
function autoSlide() {
    nextSlide();
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCarousel);
} else {
    initializeCarousel();
}
