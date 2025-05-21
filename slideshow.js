// slideshow.js
import { openTab } from './navigation.js';
import { loadGameData } from './initialize.js';

let slides = [];
let defaultSlideDuration = 6000;
const fadeOutDuration = 1000; // Duration for the final fade-out in ms (e.g., 1 second)
let slideTimeout;
let audioFadeInterval;
let currentSlideIndex = 0;
let audioElement;
let onSlideshowCompleteCallback;
let isFadingOut = false; // Flag to prevent multiple fade-outs
let currentSlideshowId = null;

function calculateAudioTimestamp(targetSlideIndex) {
    let cumulativeTimeMs = 0;
    for (let i = 0; i < targetSlideIndex; i++) {
        if (slides[i]) {
            cumulativeTimeMs += parseInt(slides[i].dataset.duration, 10) || defaultSlideDuration;
        }
    }
    return cumulativeTimeMs / 1000;
}

function syncAudioToSlide(slideIndex) {
    if (!audioElement) return;

    const targetTime = calculateAudioTimestamp(slideIndex);

    const attemptSync = () => {
        if (audioElement.readyState >= 1) { // HAVE_METADATA or more
            try {
                if (targetTime < audioElement.duration) {
                    audioElement.currentTime = targetTime;
                } else {
                    // If target time is beyond duration, could play from start or do nothing
                    // For now, let's just log it, actual behavior depends on browser
                    console.warn("Target audio time is beyond duration.");
                }
                if (audioElement.paused) {
                    audioElement.play().catch(error => console.warn("Slideshow audio play failed during sync:", error));
                }
            } catch (e) {
                console.error("Error setting audio current time:", e);
            }
        }
    };

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
    if (isFadingOut) return; // Don't show new slides if already fading out

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    if (index >= slides.length) {
        endSlideshow(); // This will now initiate the fade-out
        return;
    }

    currentSlideIndex = index;
    const currentSlideElement = slides[index];
    if (!isFadingOut) { // Only sync if not already in the process of ending
      syncAudioToSlide(index);
    }


    const duration = parseInt(currentSlideElement.dataset.duration, 10) || defaultSlideDuration;
    clearTimeout(slideTimeout);
    slideTimeout = setTimeout(advanceSlide, duration);
}

function advanceSlide() {
    if (isFadingOut) return;
    showSlide(currentSlideIndex + 1);
}

function endSlideshow() {
    if (isFadingOut) return; // Prevent multiple calls
    isFadingOut = true;

    clearTimeout(slideTimeout);
    clearInterval(audioFadeInterval); // Clear any existing audio fade

    const slideshow = document.getElementById(currentSlideshowId);
    slideshow.classList.add('fading-out'); // Trigger visual fade via CSS

    // Fade out audio
    if (audioElement && !audioElement.paused) {
        let currentVolume = audioElement.volume;
        const volumeStep = currentVolume / (fadeOutDuration / 50); // Adjust 50ms interval for smoothness

        audioFadeInterval = setInterval(() => {
            currentVolume -= volumeStep;
            if (currentVolume <= 0) {
                audioElement.volume = 0;
                audioElement.pause();
                clearInterval(audioFadeInterval);
            } else {
                audioElement.volume = currentVolume;
            }
        }, 50);
    }

    // After fadeOutDuration, completely hide and clean up
    setTimeout(() => {
        slideshow.classList.remove('active');
        slideshow.classList.remove('fading-out'); // Clean up class
        slideshow.classList.add('hidden');
        slideshow.removeEventListener('click', handleSkip);

        if (audioElement) {
            audioElement.pause(); // Ensure it's paused
        }

        // Call the completion callback if it exists
        if (typeof onSlideshowCompleteCallback === 'function') {
            onSlideshowCompleteCallback();
        }

        // Reset for next time
        slides = [];
        currentSlideIndex = 0;
        audioElement = null;
        onSlideshowCompleteCallback = null;
        isFadingOut = false; // Reset flag
        currentSlideshowId = null;
    }, fadeOutDuration);
}

function handleSkip() {
    if (isFadingOut) return; // Don't allow skip if already fading out

    clearTimeout(slideTimeout); // Stop current slide's timer
    clearInterval(audioFadeInterval); // Stop any ongoing audio fade (shouldn't be needed here but safe)

    // If it's the last slide, skipping it should trigger the end sequence
    if (currentSlideIndex >= slides.length - 1) {
        // Ensure current active slide is visually removed before global fade
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.remove('active');
        }
        endSlideshow();
    } else {
        advanceSlide(); // Advance to next slide, syncAudioToSlide will handle audio
    }
}

export function startSlideshow(onComplete, slideshowId = 'slideshow') {
    isFadingOut = false; // Ensure flag is reset at start
    clearTimeout(slideTimeout);
    clearInterval(audioFadeInterval);

    currentSlideshowId = slideshowId;
    const slideshow = document.getElementById(slideshowId);
    slides = Array.from(slideshow.querySelectorAll('.slide'));
    audioElement = document.getElementById(`${slideshowId}-audio`);
    onSlideshowCompleteCallback = onComplete;
    currentSlideIndex = 0;

    if (slides.length === 0) {
        if (typeof onSlideshowCompleteCallback === 'function') {
            onSlideshowCompleteCallback(); // Call immediately if no slides
        }
        return;
    }

    slideshow.classList.remove('hidden', 'fading-out'); // Ensure it's not hidden or mid-fade
    slideshow.classList.add('active');
    slideshow.style.opacity = '1'; // Explicitly set opacity to 1 before starting
    slideshow.addEventListener('click', handleSkip);

    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.volume = 1; // Ensure audio starts at full volume
        audioElement.play().catch(error => {
            console.warn("Slideshow audio autoplay failed.", error);
        });
    }

    showSlide(0);
}

// Add a new function to handle early game initialization completion
export function handleEarlyGameInit() {
    if (!isFadingOut && currentSlideshowId) {
        // If slideshow is still running, end it early
        endSlideshow();
    }
}