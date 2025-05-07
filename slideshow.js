import { openTab } from './navigation.js';
import { loadGameData } from './initialize.js';

export function startSlideshow(onComplete) {
    const slideshow = document.getElementById('slideshow');
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideDuration = 6; // 6 seconds per slide
    const fadeDuration = 1000; // 1 second for fade in/out

    // Show slideshow
    slideshow.classList.remove('hidden');
    slideshow.classList.add('active');

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));

        // Show current slide
        slides[index].classList.add('active');

        // Schedule next slide or completion
        setTimeout(() => {
            if (index < slides.length - 1) {
                showSlide(index + 1);
            } else {
                // End slideshow
                slideshow.classList.remove('active');
                slideshow.classList.add('hidden');
                onComplete();
            }
        }, slideDuration);
    }

    // Start with first slide
    showSlide(0);
}