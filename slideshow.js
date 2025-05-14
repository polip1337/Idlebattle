// slideshow.js
import { openTab } from './navigation.js';
import { loadGameData } from './initialize.js';

let slides = []; // Keep slides accessible in the module scope for calculations
let defaultSlideDuration = 6000; // Default duration if not specified
let slideTimeout;
let currentSlideIndex = 0;
let audioElement;
let onSlideshowCompleteCallback; // To store the onComplete callback

function calculateAudioTimestamp(targetSlideIndex) {
    let cumulativeTimeMs = 0;
    for (let i = 0; i < targetSlideIndex; i++) {
        if (slides[i]) { // Check if slide exists
            cumulativeTimeMs += parseInt(slides[i].dataset.duration, 10) || defaultSlideDuration;
        }
    }
    return cumulativeTimeMs / 1000; // Convert to seconds
}

function syncAudioToSlide(slideIndex) {
    if (!audioElement) return;

    const targetTime = calculateAudioTimestamp(slideIndex);

    const attemptSync = () => {
        if (audioElement.readyState >= 1) { // HAVE_METADATA or more, so duration is known
            // Ensure targetTime is within audio duration if not looping
            // For simplicity, we'll let it try to seek. If it goes beyond, it usually stops or goes to end.
            audioElement.currentTime = targetTime;
            if (audioElement.paused) {
                audioElement.play().catch(error => console.warn("Slideshow audio play failed during sync:", error));
            }
        } else {
            // If audio is not ready, try again shortly or wait for 'canplay'
            // This is a simplified retry, a more robust solution would use 'canplay' event
            // console.warn("Audio not ready for sync, will try on canplay.");
        }
    };

    // If audio is still loading, wait for 'canplay' to set currentTime
    if (audioElement.readyState < 1) {
        const canPlayListener = () => {
            attemptSync();
            audioElement.removeEventListener('canplay', canPlayListener);
        };
        audioElement.addEventListener('canplay', canPlayListener);
    } else {
        attemptSync();
    }
}

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    if (index >= slides.length) {
        endSlideshow();
        return;
    }

    currentSlideIndex = index;
    const currentSlideElement = slides[index];
    syncAudioToSlide(index); // Sync audio to the start of this slide

    const duration = parseInt(currentSlideElement.dataset.duration, 10) || defaultSlideDuration;
    clearTimeout(slideTimeout); // Clear previous timeout
    slideTimeout = setTimeout(advanceSlide, duration);
}

function advanceSlide() {
    showSlide(currentSlideIndex + 1);
}

function endSlideshow() {
    clearTimeout(slideTimeout);
    const slideshow = document.getElementById('slideshow');
    slideshow.classList.remove('active');
    slideshow.classList.add('hidden');
    slideshow.removeEventListener('click', handleSkip);

    if (audioElement) {
        audioElement.pause();
        // audioElement.currentTime = 0; // Optional: reset audio to beginning
    }

    if (typeof onSlideshowCompleteCallback === 'function') {
        onSlideshowCompleteCallback();
    }
    // Reset for next time
    slides = [];
    currentSlideIndex = 0;
    audioElement = null;
    onSlideshowCompleteCallback = null;
}

function handleSkip() {
    // When skipping, we advance to the next slide, and showSlide will handle audio sync
    advanceSlide();
}

export function startSlideshow(onComplete) {
    const slideshow = document.getElementById('slideshow');
    slides = Array.from(slideshow.querySelectorAll('.slide'));
    audioElement = document.getElementById('slideshow-audio');
    onSlideshowCompleteCallback = onComplete;
    currentSlideIndex = 0; // Reset index

    if (slides.length === 0) {
        endSlideshow();
        return;
    }

    slideshow.classList.remove('hidden');
    slideshow.classList.add('active');
    slideshow.addEventListener('click', handleSkip);

    if (audioElement) {
        audioElement.currentTime = 0; // Start audio from the beginning
        audioElement.play().catch(error => {
            console.warn("Slideshow audio autoplay failed. User interaction might be required or audio source issue.", error);
            // Fallback or UI notification could be added here
        });
    }

    showSlide(0); // Start with the first slide
}