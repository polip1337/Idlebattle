import { hero, battleStatistics, currentArea, loadGameData as initializeAndLoadGame } from './initialize.js';
import { questSystem } from './questSystem.js';
import { getMapStateForSave, setMapStateFromLoad, mapsData as mapDataRef, currentMapId as currentMapIdRef, pointsOfInterest as poiRef } from './map.js';
// deepCopy might not be needed here if all serializable data is primitive or handled by component methods
// import { deepCopy } from './Render.js'; 

const MAX_SLOTS = 9;
const SAVE_KEY_PREFIX = 'rpgBattleSave_slot_';
let currentMode = 'save'; // 'save' or 'load'
// let activeSlotForDelete = null; // Not currently used

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

    const mapState = getMapStateForSave ? getMapStateForSave() : null;

    const gameState = {
        timestamp: new Date().toISOString(),
        heroData: heroData,
        currentAreaIdentifier: {
            jsonPath: currentArea.jsonPath,
            stageNumber: currentArea.stageNumber || 1
        },
        battleStatisticsData: battleStatistics ? battleStatistics.getSerializableData() : null,
        questSystemData: questSystem ? questSystem.getSerializableData() : null,
        mapStateData: mapState,
        gameVersion: '0.1.0' // Example version
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

function formatTimestamp(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
}

function handleClearAction(slotIndex) {
    if (confirm(`Are you sure you want to clear save data in Slot ${slotIndex + 1}? This action cannot be undone.`)) {
        localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotIndex}`);
        console.log(`Save data cleared for slot ${slotIndex + 1}`);
        populateSlots(); // Refresh the UI
    }
}

function handleExportAction(slotIndex) {
    const slotDataJSON = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotIndex}`);
    if (!slotDataJSON) {
        alert(`Slot ${slotIndex + 1} is empty. Nothing to export.`);
        return;
    }

    try {
        // Validate JSON before exporting (basic check)
        JSON.parse(slotDataJSON); 

        const blob = new Blob([slotDataJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Include date in filename for better organization
        const now = new Date();
        const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        a.download = `rpg_save_slot_${slotIndex + 1}_${dateString}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log(`Data from slot ${slotIndex + 1} exported.`);
    } catch (e) {
        console.error(`Error exporting slot ${slotIndex + 1}: Invalid JSON data in localStorage.`, e);
        alert(`Could not export slot ${slotIndex + 1}. The data in this slot appears to be corrupted.`);
    }
}

function handleImportAction(slotIndex, slotHasData) {
    if (slotHasData) {
        if (!confirm(`Slot ${slotIndex + 1} already contains data. Are you sure you want to overwrite it by importing a new file?`)) {
            return;
        }
    } else {
        if (!confirm(`Import file into empty Slot ${slotIndex + 1}?`)) {
            return;
        }
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const fileContent = e.target.result;
                    const importedData = JSON.parse(fileContent);

                    // CRUCIAL VALIDATION - similar to loadGame initial checks
                    if (!importedData.timestamp || // Ensure a timestamp exists
                        !importedData.heroData || 
                        !importedData.heroData.name || // Basic hero data integrity
                        typeof importedData.heroData.level !== 'number' ||
                        !importedData.currentAreaIdentifier ||
                        !importedData.currentAreaIdentifier.jsonPath) {
                        alert('Import failed: The selected file is not a valid game save or is corrupted (missing essential data like timestamp, hero info, or area path).');
                        console.error("Import validation failed. Critical data missing. Data:", importedData);
                        return;
                    }
                    // Optionally, more specific checks on heroData properties, mapStateData etc. can be added here.

                    localStorage.setItem(`${SAVE_KEY_PREFIX}${slotIndex}`, JSON.stringify(importedData));
                    console.log(`Game data imported into slot ${slotIndex + 1}`);
                    alert(`File imported successfully into Slot ${slotIndex + 1}.`);
                    populateSlots(); // Refresh UI
                } catch (error) {
                    console.error("Error processing imported file:", error);
                    alert(`Failed to import file. It might not be a valid JSON or game save. Error: ${error.message}`);
                } finally {
                     // Ensure file input is removed even if an error occurs during processing
                    if (fileInput.parentNode) {
                        document.body.removeChild(fileInput);
                    }
                }
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                alert("Failed to read the selected file.");
                 if (fileInput.parentNode) {
                    document.body.removeChild(fileInput);
                }
            };
            reader.readAsText(file);
        } else {
            // No file selected or dialog cancelled
            if (fileInput.parentNode) {
                document.body.removeChild(fileInput);
            }
        }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    // fileInput is removed by its own event handlers
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

        if (slotDataJSON) {
            try {
                const slotData = JSON.parse(slotDataJSON);
                const heroName = slotData.heroData?.name || 'N/A';
                const heroLevel = slotData.heroData?.level || 'N/A';
                const heroClass = slotData.heroData?.classType || (slotData.heroData?.classId || 'N/A');
                const mapName = slotData.mapStateData?.currentMapId?.split('/').pop().replace(/\.json$/i, '') || 
                                (slotData.currentAreaIdentifier?.jsonPath?.split('/').pop().replace(/\.(JSON|json)$/i, '') || 'Unknown Area');

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
                    slotElement.classList.add('corrupted-preview'); 
                    const originalHTML = slotElement.innerHTML;
                    slotElement.innerHTML = originalHTML + `<p style="color:red; font-size:0.8em; margin-top: 5px;">Warning: May be corrupted</p>`;
                }

            } catch (e) {
                slotElement.classList.add('empty'); // Treat as empty if corrupted during parse
                slotElement.classList.add('corrupted-preview'); // Also mark as corrupted
                slotElement.innerHTML = `<p>Slot ${i + 1}</p><p class="save-slot-timestamp" style="color:red;">Corrupted Data</p>`;
            }
        } else {
            slotElement.classList.add('empty');
            slotElement.innerHTML = `<p>Slot ${i + 1}</p><p class="save-slot-timestamp">Empty</p>`;
        }

        // Add Import/Export/Clear buttons
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('save-slot-actions');

        const importButton = document.createElement('button');
        importButton.textContent = 'Import';
        importButton.classList.add('import-button');
        importButton.title = `Import save data into Slot ${i + 1}`;
        importButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            handleImportAction(i, !!slotDataJSON); 
        });

        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export';
        exportButton.classList.add('export-button');
        exportButton.title = `Export save data from Slot ${i + 1}`;
        if (!slotDataJSON) {
            exportButton.disabled = true;
        }
        exportButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (slotDataJSON) {
                handleExportAction(i);
            } else {
                // Button should be disabled, but as a fallback:
                alert("Slot is empty, nothing to export.");
            }
        });

        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.classList.add('clear-button');
        clearButton.title = `Clear save data in Slot ${i + 1}`;
        if (!slotDataJSON) {
            clearButton.disabled = true;
        }
        clearButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (slotDataJSON) {
                handleClearAction(i);
            } else {
                 // Button should be disabled, but as a fallback:
                alert("Slot is empty, nothing to clear.");
            }
        });

        actionsContainer.appendChild(importButton);
        actionsContainer.appendChild(exportButton);
        actionsContainer.appendChild(clearButton);
        slotElement.appendChild(actionsContainer);


        slotElement.addEventListener('click', async () => { 
            if (currentMode === 'save') {
                // Check if slot is marked corrupted, but allow overwriting if user confirms
                let proceedSave = true;
                if (slotElement.classList.contains('corrupted-preview') && slotDataJSON) {
                     proceedSave = confirm('This slot contains data that might be corrupted. Overwrite anyway?');
                } else if (slotDataJSON) {
                     proceedSave = confirm('Overwrite existing save in this slot?');
                }
                if (proceedSave) {
                    saveGame(i);
                }

            } else if (currentMode === 'load') {
                if (slotDataJSON) {
                    try {
                        const tempSlotData = JSON.parse(slotDataJSON);
                        if (!tempSlotData.heroData || !tempSlotData.currentAreaIdentifier?.jsonPath) {
                             alert("This save slot appears to be corrupted (missing essential data). Cannot load.");
                             return;
                        }
                         await loadGame(i);
                    } catch (e) {
                        alert("This save slot contains corrupted data and cannot be loaded.");
                        return;
                    }
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