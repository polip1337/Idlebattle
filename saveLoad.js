
import { hero, battleStatistics, currentArea, loadGameData as initializeAndLoadGame } from './initialize.js';
import { questSystem } from './questSystem.js';
import { getMapStateForSave, setMapStateFromLoad, mapsData as mapDataRef, currentMapId as currentMapIdRef, pointsOfInterest as poiRef } from './map.js';
// deepCopy might not be needed here if all serializable data is primitive or handled by component methods
// import { deepCopy } from './Render.js'; 

const MAX_SLOTS = 10;
const SAVE_KEY_PREFIX = 'rpgBattleSave_slot_';
let currentMode = 'save'; // 'save' or 'load'
// let activeSlotForDelete = null; // Not currently used based on commented out code

const saveLoadModal = document.getElementById('save-load-modal');
const saveLoadTitle = document.getElementById('save-load-title');
const slotsContainer = document.getElementById('save-load-slots-container');
const closeButton = document.getElementById('save-load-close-button');
// const deleteButton = document.getElementById('save-load-delete-button');

function getGameState() {
    // CRITICAL: Add checks here to ensure hero and currentArea are valid before trying to access their properties.
    if (!hero) {
        console.error("getGameState: Hero object is not initialized. Cannot save hero data.");
        alert("Error: Cannot save game because hero data is missing. Please try again after the game has fully loaded.");
        return null; // Prevent saving incomplete state
    }
    if (!hero.getSerializableData) {
        console.error("getGameState: hero.getSerializableData is not a function. Hero object might be corrupted.", hero);
        alert("Error: Cannot save game due to an issue with the hero object. Please report this bug.");
        return null;
    }

    if (!currentArea) {
        console.error("getGameState: currentArea object is not initialized. Cannot save area data.");
        // This might be less critical than hero, but still problematic.
        // Depending on game design, you might allow saving without currentArea if player is in a hub, etc.
        // For now, let's assume it's required.
        alert("Error: Cannot save game because current area information is missing.");
        return null;
    }
    if (typeof currentArea.jsonPath !== 'string' || currentArea.jsonPath.trim() === "") {
         console.error("getGameState: currentArea.jsonPath is invalid. Cannot save area path.", currentArea);
         alert("Error: Cannot save game because the current area's path is invalid.");
         return null;
    }


    const heroData = hero.getSerializableData();
    if (!heroData || !heroData.classId) { // Add a check for a key field in heroData
        console.error("getGameState: hero.getSerializableData() returned invalid or incomplete data.", heroData);
        alert("Error: Failed to gather complete hero data for saving.");
        return null;
    }

    const mapState = getMapStateForSave ? getMapStateForSave() : null; // Handle if getMapStateForSave isn't defined

    const gameState = {
        timestamp: new Date().toISOString(),
        heroData: heroData, // This must be populated correctly
        currentAreaIdentifier: {
            jsonPath: currentArea.jsonPath, // This must be a valid string path
            stageNumber: currentArea.stageNumber || 1 // Ensure stageNumber is present
        },
        battleStatisticsData: battleStatistics ? battleStatistics.getSerializableData() : null,
        questSystemData: questSystem ? questSystem.getSerializableData() : null,
        mapStateData: mapState,
        gameVersion: '0.1.0' // Example version
    };

    // Optional: Log the game state being saved for debugging
    // console.log("Game state to be saved:", JSON.stringify(gameState, null, 2));

    return gameState;
}

export function saveGame(slotIndex) {
    try {
        const gameState = getGameState();
        if (!gameState) { // getGameState now returns null on critical failure
            // Alert/message already shown by getGameState
            console.warn("SaveGame aborted because getGameState returned null.");
            return; // Abort save
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

        // THIS IS THE CHECK THAT'S FAILING (line 67 in your original file for this check)
        if (!savedGameState.heroData ||
            !savedGameState.currentAreaIdentifier ||
            !savedGameState.currentAreaIdentifier.jsonPath) {
            console.error("Saved game state is critically incomplete (missing heroData or currentAreaIdentifier.jsonPath).", savedGameState);
            alert("Failed to load game. Save data is corrupted (missing essential info). Please try another slot or start a new game.");
            return false;
        }

        closeSaveLoadModal();
        
        const loadSuccessful = await initializeAndLoadGame(savedGameState);

        if (!loadSuccessful) {
            console.error(`Game initialization failed for slot ${slotIndex + 1}.`);
            // Alert might have been shown by initializeAndLoadGame.
            // Consider reopening home screen or a safe state if possible.
            return false;
        }

        console.log(`Game loaded from slot ${slotIndex + 1}`);
        
        if (typeof setMapStateFromLoad === 'function' && savedGameState.mapStateData) {
            setMapStateFromLoad(savedGameState.mapStateData);
        } else if (typeof setMapStateFromLoad !== 'function' && savedGameState.mapStateData) {
            console.warn("setMapStateFromLoad function not found, but mapStateData exists in save. Map state cannot be restored.");
        }

        return true;
    } catch (error) {
        console.error("Error loading game in saveLoad.js:", error);
        alert(`Failed to load game. Data might be corrupted. Error: ${error.message}`);
        return false;
    }
}

function deleteSave(slotIndex) { // Keep for potential future use
    if (confirm(`Are you sure you want to delete save in Slot ${slotIndex + 1}?`)) {
        localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotIndex}`);
        // activeSlotForDelete = null;
        // deleteButton.classList.add('hidden');
        populateSlots();
    }
}


function formatTimestamp(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
}

function populateSlots() {
    if (!slotsContainer) {
        console.error("Save/Load slots container not found in the DOM.");
        return;
    }
    slotsContainer.innerHTML = '';
    for (let i = 0; i < MAX_SLOTS; i++) {
        const slotElement = document.createElement('div');
        slotElement.classList.add('save-slot');
        const slotDataJSON = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`);

        // let slotDisplayInfo = `<p>Slot ${i + 1}</p>`; // Not used
        if (slotDataJSON) {
            try {
                const slotData = JSON.parse(slotDataJSON);
                // Basic validation of loaded slotData before trying to display details
                const heroName = slotData.heroData?.name || 'N/A';
                const heroLevel = slotData.heroData?.level || 'N/A';
                const heroClass = slotData.heroData?.classType || (slotData.heroData?.classId || 'N/A'); // Prefer classType (name) for display
                const mapName = slotData.mapStateData?.currentMapId?.split('/').pop().replace('.json', '') || 
                                (slotData.currentAreaIdentifier?.jsonPath?.split('/').pop().replace('.JSON', '').replace('.json', '') || 'Unknown Area');


                slotElement.innerHTML = `
                    <div class="save-slot-info">
                        <p><strong>Slot ${i + 1}</strong></p>
                        <p>Hero: ${heroName} (Lvl ${heroLevel})</p>
                        <p>Class: ${heroClass}</p>
                        <p>Location: ${mapName}</p>
                    </div>
                    <p class="save-slot-timestamp">${formatTimestamp(slotData.timestamp)}</p>
                `;
                 if (!slotData.heroData || !slotData.currentAreaIdentifier?.jsonPath) {
                    slotElement.classList.add('corrupted-preview'); // Add a class if essential data for loading is missing
                    const originalHTML = slotElement.innerHTML;
                    slotElement.innerHTML = originalHTML + `<p style="color:red; font-size:0.8em;">Warning: May be corrupted</p>`;
                }

            } catch (e) {
                slotElement.classList.add('empty'); // Or 'corrupted'
                slotElement.innerHTML = `<p>Slot ${i + 1}</p><p class="save-slot-timestamp" style="color:red;">Corrupted Data</p>`;
            }
        } else {
            slotElement.classList.add('empty');
            slotElement.innerHTML = `<p>Slot ${i + 1}</p><p class="save-slot-timestamp">Empty</p>`;
        }

        slotElement.addEventListener('click', async () => { // Make async for loadGame
            if (currentMode === 'save') {
                if (!slotDataJSON || confirm('Overwrite existing save in this slot?')) {
                    saveGame(i);
                }
            } else if (currentMode === 'load') {
                if (slotDataJSON) {
                    // Add a check here too before attempting to load, similar to the one in loadGame
                    try {
                        const tempSlotData = JSON.parse(slotDataJSON);
                        if (!tempSlotData.heroData || !tempSlotData.currentAreaIdentifier?.jsonPath) {
                             alert("This save slot appears to be corrupted (missing essential data). Cannot load.");
                             return;
                        }
                    } catch (e) {
                        alert("This save slot contains corrupted data and cannot be loaded.");
                        return;
                    }
                    await loadGame(i); // loadGame is async
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

if (closeButton) {
    closeButton.addEventListener('click', closeSaveLoadModal);
}

if (saveLoadModal) {
    saveLoadModal.addEventListener('click', (event) => {
        if (event.target === saveLoadModal) {
            closeSaveLoadModal();
        }
    });
}

