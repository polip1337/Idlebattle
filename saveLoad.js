import { hero, battleStatistics } from './initialize.js'; // Removed currentStage
import { questSystem } from './questSystem.js';
import { getMapStateForSave, setMapStateFromLoad } from './map.js';

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

function getGameState() {
    if (!hero) {
        console.error("getGameState: Hero object is not initialized.");
        alert("Error: Cannot save game because hero data is missing.");
        return null;
    }
    if (!hero.getSerializableData) {
        console.error("getGameState: hero.getSerializableData is not a function.");
        alert("Error: Cannot save game due to an issue with the hero object.");
        return null;
    }

    const heroData = hero.getSerializableData();
    if (!heroData || !heroData.classId) {
        console.error("getGameState: hero.getSerializableData() returned invalid data.", heroData);
        alert("Error: Failed to gather complete hero data for saving.");
        return null;
    }

    const mapState = getMapStateForSave(); // From map.js
    if (!mapState || typeof mapState.currentMapId !== 'string') {
        console.error("getGameState: mapState is invalid or missing currentMapId.", mapState);
        alert("Error: Cannot save game because map information is missing or invalid.");
        return null;
    }

    // Stage number for map UI is no longer saved here as it's always stage 1 from map.
    // If you need to save progress *within* a multi-stage battle area (e.g. player cleared up to stage X in "Goblin Cave"),
    // that would be a different piece of state, perhaps associated with the hero or area-specific progress.
    // For now, mapState.stageNumber is removed.

    const gameState = {
        timestamp: new Date().toISOString(),
        heroData: heroData,
        battleStatisticsData: battleStatistics ? battleStatistics.getSerializableData() : null,
        questSystemData: questSystem ? questSystem.getSerializableData() : null,
        mapStateData: mapState, // Includes currentMapId, currentLocation, mapHistory, unlockedPois
        gameVersion: '0.1.2'
    };
    return gameState;
}

export function saveGame(slotIndex) {
    try {
        const gameState = getGameState();
        if (!gameState) {
            console.warn("SaveGame aborted because getGameState returned null.");
            return;
        }
        localStorage.setItem(`${SAVE_KEY_PREFIX}${slotIndex}`, JSON.stringify(gameState));
        console.log(`Game saved to slot ${slotIndex + 1}`);
        populateSlots();
    } catch (error) {
        console.error("Error saving game:", error);
        alert(`Failed to save game. Error: ${error.message}`);
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

        // Validate essential mapStateData (stageNumber is no longer essential here for map UI)
        if (!savedGameState.heroData ||
            !savedGameState.mapStateData ||
            !savedGameState.mapStateData.currentMapId) {
            console.error("Saved game state is critically incomplete (missing heroData or essential mapStateData like currentMapId).", savedGameState);
            alert("Failed to load game. Save data is corrupted. Please try another slot or start a new game.");
            return false;
        }
        // If stageNumber was present in old saves, it will be ignored by new load logic for map UI.

        closeSaveLoadModal();

        if (!initializeAndLoadGame) {
            console.error("CRITICAL: initializeAndLoadGame function not set. Cannot load game.");
            alert("Internal error: Game loading system not ready.");
            return false;
        }
        const loadSuccessful = await initializeAndLoadGame(savedGameState);

        if (!loadSuccessful) {
            console.error(`Game initialization failed for slot ${slotIndex + 1}.`);
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
        JSON.parse(slotDataJSON);
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
                    // StageNumber no longer a primary validation field for map UI state
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
        document.body.removeChild(fileInput); // Clean up input element
    };
    document.body.appendChild(fileInput);
    fileInput.click();
}

function populateSlots() {
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';
    for (let i = 0; i < MAX_SLOTS; i++) {
        const slotElement = document.createElement('div');
        slotElement.classList.add('save-slot');
        const slotDataJSON = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`);
        let slotData = null;

        if (slotDataJSON) {
            try {
                slotData = JSON.parse(slotDataJSON);
                const heroName = slotData.heroData?.name || 'N/A';
                const heroLevel = slotData.heroData?.level || 'N/A';
                const heroClass = slotData.heroData?.classType || (slotData.heroData?.classId || 'N/A');
                const poiName = slotData.mapStateData?.currentLocation || 'Unknown POI';
                const mapName = slotData.mapStateData?.currentMapId?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Map';
                // Stage display removed from save slot preview as it's not map UI state anymore
                const locationString = `${poiName} (${mapName})`;

                slotElement.innerHTML = `
                    <div class="save-slot-info">
                        <p><strong>Slot ${i + 1}</strong></p>
                        <p>Hero: ${heroName} (Lvl ${heroLevel})</p>
                        <p>Class: ${heroClass}</p>
                        <p>Location: ${locationString}</p>
                    </div>
                    <p class="save-slot-timestamp">${formatTimestamp(slotData.timestamp)}</p>
                `;
                if (!slotData.heroData || !slotData.mapStateData?.currentMapId) { // Simplified corruption check
                    slotElement.classList.add('corrupted-preview');
                    slotElement.innerHTML += `<p style="color:red; font-size:0.8em; margin-top: 5px;">Warning: May be corrupted</p>`;
                }
            } catch (e) {
                slotElement.classList.add('empty', 'corrupted-preview');
                slotElement.innerHTML = `<p>Slot ${i + 1}</p><p class="save-slot-timestamp" style="color:red;">Corrupted Data</p>`;
            }
        } else {
            slotElement.classList.add('empty');
            slotElement.innerHTML = `<p>Slot ${i + 1}</p><p class="save-slot-timestamp">Empty</p>`;
        }

        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('save-slot-actions');
        // Import, Export, Clear buttons (code remains similar, simplified slightly)
        const importButton = document.createElement('button'); /* ... */
        importButton.textContent = 'Import';
        importButton.onclick = (event) => { event.stopPropagation(); handleImportAction(i, !!slotData); };
        actionsContainer.appendChild(importButton);

        const exportButton = document.createElement('button'); /* ... */
        exportButton.textContent = 'Export';
        exportButton.disabled = !slotData;
        exportButton.onclick = (event) => { event.stopPropagation(); if(slotData) handleExportAction(i); };
        actionsContainer.appendChild(exportButton);

        const clearButton = document.createElement('button'); /* ... */
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
                     // Simplified validation for load attempt
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