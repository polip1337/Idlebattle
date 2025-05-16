// customDialog.js

let customConfirmDialogEl, customConfirmMessageEl, customConfirmYesBtn, customConfirmNoBtn;
let currentConfirmResolve, currentConfirmReject; // currentConfirmReject is kept for potential future use or different error handling
let dialogInitialized = false; // To prevent multiple initializations or fetches
let isInitializing = false; // To prevent race conditions during async initialization

async function initializeCustomConfirmDialog() {
    if (dialogInitialized) return true;
    if (isInitializing) {
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (dialogInitialized) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (!isInitializing) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 50);
        });
    }
    isInitializing = true;

    if (document.getElementById('custom-confirm-dialog')) {
        // Dialog HTML already exists
    } else {
        try {
            const response = await fetch('custom-confirm-dialog.html');
            if (!response.ok) {
                throw new Error(`Failed to fetch custom-confirm-dialog.html: ${response.statusText}`);
            }
            const dialogHTML = await response.text();
            document.body.insertAdjacentHTML('beforeend', dialogHTML);
        } catch (error) {
            console.error("Error fetching custom confirm dialog HTML:", error);
            isInitializing = false;
            return false;
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
            currentConfirmResolve(true);
        }
        hideCustomConfirm();
    });

    customConfirmNoBtn.addEventListener('click', () => {
        if (currentConfirmResolve) { // MODIFIED: Resolve with false for "No"
            currentConfirmResolve(false);
        }
        hideCustomConfirm();
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && customConfirmDialogEl && !customConfirmDialogEl.classList.contains('hidden')) {
            if (currentConfirmResolve) { // MODIFIED: Resolve with false for "Escape"
                currentConfirmResolve(false);
            }
            //  Original code used currentConfirmReject. Resolving false is more consistent with button behavior.
            // if (currentConfirmReject) {
            //     currentConfirmReject(new Error("User cancelled via Escape"));
            // }
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
        return new Promise((resolve) => { // MODIFIED: Fallback promise
            if (confirm(message)) {
                resolve(true);
            } else {
                resolve(false); // MODIFIED: Resolve with false on native cancel
            }
        });
    }

    customConfirmMessageEl.textContent = message;
    customConfirmDialogEl.classList.remove('hidden');
    customConfirmYesBtn.focus();

    return new Promise((resolve, reject) => {
        currentConfirmResolve = resolve;
        currentConfirmReject = reject; // Keep reject for cases where the promise itself should fail, not user cancellation
    });
}

function hideCustomConfirm() {
    if (customConfirmDialogEl) {
        customConfirmDialogEl.classList.add('hidden');
    }
    currentConfirmResolve = null;
    currentConfirmReject = null;
}

window.showCustomConfirm = showCustomConfirm;