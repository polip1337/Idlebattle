import { hero, battleStatistics } from './initialize.js'; // Removed currentStage
import { questSystem } from './questSystem.js';
import { getMapStateForSave, setMapStateFromLoad } from './map.js';
import { reputationSystem } from './reputation.js';

let initializeAndLoadGame;

export function setInitializeAndLoadGame(fn) {
    initializeAndLoadGame = fn;
}

const MAX_SLOTS = 9;
const SAVE_KEY_PREFIX = 'rpgBattleSave_slot_';
let currentMode = 'save';

const saveLoadModal = document.getElementById('save-load-modal');
const saveLoadTitle = document.getElementById('save-load-title');
const slotsContainer = document.getElementById('save-load-slots-container');
const closeButton = document.getElementById('save-load-close-button');

// --- AUTOSAVE ---
const AUTOSAVE_SLOT_INDEX = 0;
let autosaveConfig = {
    enabled: true,
    intervalMinutes: 5, // 0 or less to disable interval-based autosave
    saveOnBattleEnd: true
};
let autosaveTimerId = null;

export function configureAutosave(newConfig = {}) {
    autosaveConfig = { ...autosaveConfig, ...newConfig };

    if (autosaveTimerId) {
        clearInterval(autosaveTimerId);
        autosaveTimerId = null;
    }

    if (autosaveConfig.enabled && autosaveConfig.intervalMinutes > 0) {
        autosaveTimerId = setInterval(() => {
            triggerAutosave("timer");
        }, autosaveConfig.intervalMinutes * 60 * 1000);
        console.log(`Autosave timer started: interval ${autosaveConfig.intervalMinutes} minutes. Saving to Slot ${AUTOSAVE_SLOT_INDEX + 1}.`);
    } else {
        console.log("Autosave timer disabled or interval not positive.");
    }
    populateSlots(); // Refresh UI in case "(Autosave)" label needs to update
}

export function triggerAutosave(reason = "manual_trigger") {
    if (!autosaveConfig.enabled) {
        // console.debug("Autosave skipped: system disabled."); // Can be noisy
        return;
    }

    if (reason === "timer" && autosaveConfig.intervalMinutes <= 0) {
        // console.debug("Autosave skipped: timer reason, but interval is 0 or less.");
        return;
    }

    if (reason === "battle_end" && !autosaveConfig.saveOnBattleEnd) {
        // console.debug("Autosave skipped: battle_end reason, but saveOnBattleEnd is false.");
        return;
    }

    console.log(`Autosave triggered. Reason: ${reason}. Saving to Slot ${AUTOSAVE_SLOT_INDEX + 1}.`);
    saveGame(AUTOSAVE_SLOT_INDEX, true); // Pass true for isAutosave flag
}
// --- END AUTOSAVE ---

function getGameState() {
    if (!hero) {
        console.error("getGameState: Hero object is not initialized.");
        // alert("Error: Cannot save game because hero data is missing."); // Avoid alert for autosave
        return null;
    }
    if (!hero.getSerializableData) {
        console.error("getGameState: hero.getSerializableData is not a function.");
        // alert("Error: Cannot save game due to an issue with the hero object."); // Avoid alert for autosave
        return null;
    }

    const heroData = hero.getSerializableData();
    if (!heroData || !heroData.classId) {
        console.error("getGameState: hero.getSerializableData() returned invalid data.", heroData);
        // alert("Error: Failed to gather complete hero data for saving."); // Avoid alert for autosave
        return null;
    }

    const mapState = getMapStateForSave(); // From map.js
    if (!mapState || typeof mapState.currentMapId !== 'string') {
        console.error("getGameState: mapState is invalid or missing currentMapId.", mapState);
        // alert("Error: Cannot save game because map information is missing or invalid."); // Avoid alert for autosave
        return null;
    }

    const gameState = {
        timestamp: new Date().toISOString(),
        heroData: heroData,
        battleStatisticsData: battleStatistics ? battleStatistics.getSerializableData() : null,
        questSystemData: questSystem ? questSystem.getSerializableData() : null,
        mapStateData: mapState,
        reputationData: reputationSystem ? reputationSystem.getSerializableData() : null,
        gameVersion: '0.1.2'
    };
    return gameState;
}

export function saveGame(slotIndex, isAutosave = false) {
    try {
        const gameState = getGameState();
        if (!gameState) {
            const msg = `${isAutosave ? 'Autosave' : 'SaveGame'} aborted because getGameState returned null.`;
            console.warn(msg);
            // Alert only for manual save if game state is null, not for autosave unless it's a critical error handled below
            if (!isAutosave) alert(msg);
            return;
        }
        localStorage.setItem(`${SAVE_KEY_PREFIX}${slotIndex}`, JSON.stringify(gameState));

        if (isAutosave) {
            console.log(`Successfully autosaved to Slot ${slotIndex + 1}.`);
        } else {
            console.log(`Game saved to Slot ${slotIndex + 1}`);
            // If manually saving to the autosave slot, and timer is active, reset the timer.
            if (slotIndex === AUTOSAVE_SLOT_INDEX && autosaveConfig.enabled && autosaveConfig.intervalMinutes > 0) {
                if (autosaveTimerId) clearInterval(autosaveTimerId);
                autosaveTimerId = setInterval(() => {
                    triggerAutosave("timer");
                }, autosaveConfig.intervalMinutes * 60 * 1000);
                console.log("Autosave timer reset due to manual save on autosave slot.");
            }
        }
        populateSlots();
    } catch (error) {
        console.error(`Error ${isAutosave ? 'autosaving' : 'saving'} game to slot ${slotIndex + 1}:`, error);
        // Alert for manual saves, or for autosaves if it's a hero data issue or quota exceeded
        if (!isAutosave ||
            (error.message && error.message.toLowerCase().includes("hero")) ||
            error.name === "QuotaExceededError") {
             alert(`Failed to ${isAutosave ? 'autosave' : 'save'} game. Error: ${error.message}`);
        }
    }
}

export async function loadGame(slotIndex) {
    try {
        const savedStateJSON = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotIndex}`);
        if (!savedStateJSON) {
            alert("No data in this slot.");
            return false;
        }
        const savedGameState = JSON.parse(savedStateJSON);

        if (!savedGameState.heroData ||
            !savedGameState.mapStateData ||
            !savedGameState.mapStateData.currentMapId) {
            console.error("Saved game state is critically incomplete (missing heroData or essential mapStateData like currentMapId).", savedGameState);
            alert("Failed to load game. Save data is corrupted. Please try another slot or start a new game.");
            return false;
        }

        closeSaveLoadModal();

        if (!initializeAndLoadGame) {
            console.error("CRITICAL: initializeAndLoadGame function not set. Cannot load game.");
            alert("Internal error: Game loading system not ready.");
            return false;
        }

        // Load reputation data if available
        if (savedGameState.reputationData && reputationSystem) {
            reputationSystem.loadFromData(savedGameState.reputationData);
        }

        const loadSuccessful = await initializeAndLoadGame(savedGameState);

        if (!loadSuccessful) {
            console.error(`Game initialization failed for slot ${slotIndex + 1}.`);
            // initializeAndLoadGame should handle its own alerts for critical load failures
            return false;
        }
        console.log(`Game loaded from slot ${slotIndex + 1}`);
        return true;
    } catch (error) {
        console.error("Error loading game in saveLoad.js:", error);
        alert(`Failed to load game. Data might be corrupted. Error: ${error.message}`);
        return false;
    }
}

function formatTimestamp(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
}

function handleClearAction(slotIndex) {
    if (confirm(`Are you sure you want to clear save data in Slot ${slotIndex + 1}?`)) {
        localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotIndex}`);
        console.log(`Save data cleared for slot ${slotIndex + 1}`);
        populateSlots();
    }
}

function handleExportAction(slotIndex) {
    const slotDataJSON = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotIndex}`);
    if (!slotDataJSON) {
        alert(`Slot ${slotIndex + 1} is empty.`);
        return;
    }
    try {
        JSON.parse(slotDataJSON); // Validate JSON before creating blob
        const blob = new Blob([slotDataJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        a.download = `rpg_save_slot_${slotIndex + 1}_${dateString}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error(`Error exporting slot ${slotIndex + 1}:`, e);
        alert(`Could not export slot ${slotIndex + 1}. Data may be corrupted.`);
    }
}

function handleImportAction(slotIndex, slotHasData) {
    if (slotHasData && !confirm(`Slot ${slotIndex + 1} contains data. Overwrite?`)) return;
    if (!slotHasData && !confirm(`Import file into empty Slot ${slotIndex + 1}?`)) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (!importedData.timestamp || !importedData.heroData || !importedData.heroData.name ||
                        typeof importedData.heroData.level !== 'number' ||
                        !importedData.mapStateData || !importedData.mapStateData.currentMapId) {
                        alert('Import failed: Invalid game save file (missing essential data).');
                        return;
                    }
                    localStorage.setItem(`${SAVE_KEY_PREFIX}${slotIndex}`, JSON.stringify(importedData));
                    alert(`File imported successfully into Slot ${slotIndex + 1}.`);
                    populateSlots();
                } catch (error) {
                    alert(`Failed to import file. Error: ${error.message}`);
                }
            };
            reader.readAsText(file);
        }
        if (document.body.contains(fileInput)) { // Check if still in body before removing
           document.body.removeChild(fileInput);
        }
    };
    document.body.appendChild(fileInput);
    fileInput.click();
    // No need to remove fileInput here if it auto-removes onchange or we want to keep it for retry,
    // but typically good to clean up. Removed it inside onchange after processing.
}

function populateSlots() {
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';
    for (let i = 0; i < MAX_SLOTS; i++) {
        const slotElement = document.createElement('div');
        slotElement.classList.add('save-slot');
        const slotDataJSON = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`);
        let slotData = null;

        let slotTitleText = `Slot ${i + 1}`;
        if (i === AUTOSAVE_SLOT_INDEX && autosaveConfig.enabled) {
            slotTitleText += " <span class='autosave-indicator'>(Autosave)</span>";
        }

        if (slotDataJSON) {
            try {
                slotData = JSON.parse(slotDataJSON);
                const heroName = slotData.heroData?.name || 'N/A';
                const heroLevel = slotData.heroData?.level || 'N/A';
                const heroClass = slotData.heroData?.classType || (slotData.heroData?.classId || 'N/A');
                const poiName = slotData.mapStateData?.currentLocation || 'Unknown POI';
                const mapName = slotData.mapStateData?.currentMapId?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Map';
                const locationString = `${poiName} (${mapName})`;

                slotElement.innerHTML = `
                    <div class="save-slot-info">
                        <p><strong>${slotTitleText}</strong></p>
                        <p>Hero: ${heroName} (Lvl ${heroLevel})</p>
                        <p>Class: ${heroClass}</p>
                        <p>Location: ${locationString}</p>
                    </div>
                    <p class="save-slot-timestamp">${formatTimestamp(slotData.timestamp)}</p>
                `;
                if (!slotData.heroData || !slotData.mapStateData?.currentMapId) {
                    slotElement.classList.add('corrupted-preview');
                    slotElement.innerHTML += `<p style="color:red; font-size:0.8em; margin-top: 5px;">Warning: May be corrupted</p>`;
                }
            } catch (e) {
                slotElement.classList.add('empty', 'corrupted-preview');
                slotElement.innerHTML = `<p><strong>${slotTitleText}</strong></p><p class="save-slot-timestamp" style="color:red;">Corrupted Data</p>`;
            }
        } else {
            slotElement.classList.add('empty');
            slotElement.innerHTML = `<p><strong>${slotTitleText}</strong></p><p class="save-slot-timestamp">Empty</p>`;
        }

        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('save-slot-actions');

        const importButton = document.createElement('button');
        importButton.textContent = 'Import';
        importButton.onclick = (event) => { event.stopPropagation(); handleImportAction(i, !!slotData); };
        actionsContainer.appendChild(importButton);

        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export';
        exportButton.disabled = !slotData;
        exportButton.onclick = (event) => { event.stopPropagation(); if(slotData) handleExportAction(i); };
        actionsContainer.appendChild(exportButton);

        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.disabled = !slotData;
        clearButton.onclick = (event) => { event.stopPropagation(); if(slotData) handleClearAction(i); };
        actionsContainer.appendChild(clearButton);

        slotElement.appendChild(actionsContainer);

        slotElement.addEventListener('click', async () => {
            if (currentMode === 'save') {
                if (slotData && !confirm('Overwrite existing save?')) return;
                saveGame(i);
            } else if (currentMode === 'load') {
                if (slotData) {
                    if (!slotData.heroData || !slotData.mapStateData || !slotData.mapStateData.currentMapId) {
                         alert("This save slot appears corrupted. Cannot load."); return;
                    }
                    await loadGame(i);
                } else {
                    alert("This slot is empty.");
                }
            }
        });
        slotsContainer.appendChild(slotElement);
    }
}

export function openSaveModal() {
    if (!saveLoadModal || !saveLoadTitle) return;
    currentMode = 'save';
    saveLoadTitle.textContent = 'Save Game';
    populateSlots();
    saveLoadModal.classList.remove('hidden');
    saveLoadModal.classList.add('active');
}

export function openLoadModal() {
    if (!saveLoadModal || !saveLoadTitle) return;
    currentMode = 'load';
    saveLoadTitle.textContent = 'Load Game';
    populateSlots();
    saveLoadModal.classList.remove('hidden');
    saveLoadModal.classList.add('active');
}

function closeSaveLoadModal() {
    if (!saveLoadModal) return;
    saveLoadModal.classList.add('hidden');
    saveLoadModal.classList.remove('active');
}

if (closeButton) closeButton.addEventListener('click', closeSaveLoadModal);
if (saveLoadModal) {
    saveLoadModal.addEventListener('click', (event) => {
        if (event.target === saveLoadModal) closeSaveLoadModal();
    });
}