// customDialog.js

let customConfirmDialogEl, customConfirmMessageEl, customConfirmYesBtn, customConfirmNoBtn;
let currentConfirmResolve, currentConfirmReject;
let dialogInitialized = false; // To prevent multiple initializations or fetches
let isInitializing = false; // To prevent race conditions during async initialization

async function initializeCustomConfirmDialog() {
    if (dialogInitialized) return true;
    if (isInitializing) {
        // Wait for the ongoing initialization to complete
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (dialogInitialized) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (!isInitializing) { // Initialization failed elsewhere
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 50);
        });
    }
    isInitializing = true;

    // Check if HTML is already in the DOM (e.g., included via server-side or manually)
    if (document.getElementById('custom-confirm-dialog')) {
        // Dialog HTML already exists
    } else {
        // Fetch and inject HTML
        try {
            // Adjust path if custom-confirm-dialog.html is not in the same directory as your main HTML file
            const response = await fetch('custom-confirm-dialog.html'); 
            if (!response.ok) {
                throw new Error(`Failed to fetch custom-confirm-dialog.html: ${response.statusText}`);
            }
            const dialogHTML = await response.text();
            document.body.insertAdjacentHTML('beforeend', dialogHTML);
        } catch (error) {
            console.error("Error fetching custom confirm dialog HTML:", error);
            isInitializing = false;
            return false; // Initialization failed
        }
    }

    customConfirmDialogEl = document.getElementById('custom-confirm-dialog');
    customConfirmMessageEl = document.getElementById('custom-confirm-message');
    customConfirmYesBtn = document.getElementById('custom-confirm-yes-btn');
    customConfirmNoBtn = document.getElementById('custom-confirm-no-btn');

    if (!customConfirmDialogEl || !customConfirmMessageEl || !customConfirmYesBtn || !customConfirmNoBtn) {
        console.error("Custom confirm dialog elements not found after attempting to load/find HTML. Ensure IDs in custom-confirm-dialog.html are correct and unique.");
        isInitializing = false;
        return false;
    }

    customConfirmYesBtn.addEventListener('click', () => {
        if (currentConfirmResolve) {
            currentConfirmResolve(true); // Resolve with true for "Confirm"
        }
        hideCustomConfirm();
    });

    customConfirmNoBtn.addEventListener('click', () => {
        hideCustomConfirm();
    });
    
    // Close on Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && customConfirmDialogEl && !customConfirmDialogEl.classList.contains('hidden')) {
            if (currentConfirmReject) {
                currentConfirmReject(new Error("User cancelled via Escape"));
            }
            hideCustomConfirm();
        }
    });

    dialogInitialized = true;
    isInitializing = false;
    return true;
}

async function showCustomConfirm(message) {
    const isReady = await initializeCustomConfirmDialog();
    
    if (!isReady) {
        console.warn("Custom confirm dialog could not be initialized. Falling back to native confirm.");
        // Fallback to native confirm, wrapped in a Promise to maintain consistent async behavior
        return new Promise((resolve, reject) => {
            if (confirm(message)) {
                resolve(true);
            } else {
                reject(new Error("User cancelled (native confirm)"));
            }
        });
    }

    customConfirmMessageEl.textContent = message;
    customConfirmDialogEl.classList.remove('hidden');
    // Focus the "Confirm" button for accessibility and immediate interaction
    customConfirmYesBtn.focus();

    return new Promise((resolve, reject) => {
        currentConfirmResolve = resolve;
        currentConfirmReject = reject;
    });
}

function hideCustomConfirm() {
    if (customConfirmDialogEl) {
        customConfirmDialogEl.classList.add('hidden');
    }
    // Clean up promise resolvers
    currentConfirmResolve = null;
    currentConfirmReject = null;
}

// Expose showCustomConfirm globally. 
// If you are using ES modules across your project, you might prefer to export/import.
window.showCustomConfirm = showCustomConfirm;

// Optional: You can pre-initialize the dialog when the DOM is ready
// document.addEventListener('DOMContentLoaded', initializeCustomConfirmDialog);
// This would fetch/prepare the dialog early. Otherwise, it's done on the first call to showCustomConfirm.