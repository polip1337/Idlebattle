// In map.js

import { openTab } from './navigation.js';
import { battleController } from './initialize.js';
import { team1, team2, battleLog, hero } from './initialize.js'; // No more stage/area specific imports from initialize for map UI
import { questSystem } from './questSystem.js';
import { renderHero, updateHealth, updateMana, updateStamina, updateHeroMapStats } from './Render.js';


export let mapsData = null;
export let currentMapId = 'hollowreach';
export let pointsOfInterest = [];
export let currentLocation = null;
let unlockedPredefinedPois = new Set();
let hiddenPois = new Set(); // Track hidden POIs
let shownDialogues = new Set(); // Track shown dialogues
let isProcessingPoiClick = false;
let mapHistory = [];

let mapContainer = null;
let poiListUI = null; // If you keep a list view of POIs
let heroPortraitContainer = null;

// Elements for gold and EXP bars (cached for performance)
let heroMapGoldValueEl = null;
let expBarClass1El = null;
let expBarClass2El = null;
let expBarClass3El = null;

// Add regeneration interval variable
window.regenerationInterval = null; // Expose to window for battle system

// Expose isProcessingPoiClick to window for action handler
window.isProcessingPoiClick = isProcessingPoiClick;

function _updateHeroMapSidebar(heroInstance) {
    if (!heroInstance) return;

    // Cache elements on first run or if they become null
    if (!heroMapGoldValueEl) heroMapGoldValueEl = document.getElementById('hero-map-gold-value');
    if (!expBarClass1El) expBarClass1El = document.getElementById('exp-bar-class1');
    if (!expBarClass2El) expBarClass2El = document.getElementById('exp-bar-class2');
    if (!expBarClass3El) expBarClass3El = document.getElementById('exp-bar-class3');

    // Update Gold
    if (heroMapGoldValueEl) {
        heroMapGoldValueEl.textContent = heroInstance.gold !== undefined ? heroInstance.gold : '0';
    }

    const classProgressions = [];
    if (heroInstance.class) {
        classProgressions.push({
            name: heroInstance.class.name || 'Primary Class',
            level: heroInstance.level || 1,
            exp: heroInstance.experience || 0,
            tnl: heroInstance.experienceToLevel || 100
        });
    }
    if (heroInstance.class2 && typeof heroInstance.class2 === 'object' && heroInstance.class2.name) {
        classProgressions.push({
            name: heroInstance.class2.name,
            level: heroInstance.class2_level || 1,
            exp: heroInstance.class2_experience || 0,
            tnl: heroInstance.class2_xpToNextLevel || 100
        });
    }
    if (heroInstance.class3 && typeof heroInstance.class3 === 'object' && heroInstance.class3.name) {
        classProgressions.push({
            name: heroInstance.class3.name,
            level: heroInstance.class3_level || 1,
            exp: heroInstance.class3_experience || 0,
            tnl: heroInstance.class3_xpToNextLevel || 100
        });
    }


    const expBarElements = [expBarClass1El, expBarClass2El, expBarClass3El];
    expBarElements.forEach((barEl, index) => {
        if (!barEl) return;

        const progression = classProgressions[index];
        if (progression) {
            barEl.style.display = 'block';
            const nameEl = barEl.querySelector('.exp-bar-class-name');
            const progressEl = barEl.querySelector('.exp-bar-progress');
            const valueEl = barEl.querySelector('.exp-bar-value');

            if (nameEl) nameEl.textContent = `${progression.name} (Lvl ${progression.level})`;
            if (valueEl) valueEl.textContent = `${progression.exp}/${progression.tnl}`;
            if (progressEl) {
                const percentage = progression.tnl > 0 ? (progression.exp / progression.tnl) * 100 : 0;
                progressEl.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
            }
        } else {
            barEl.style.display = 'none';
        }
    });
}


function renderHeroPortrait() {
    if (!hero || !heroPortraitContainer) return;
    heroPortraitContainer.innerHTML = '';
    const heroElement = renderHero(hero);
    heroPortraitContainer.appendChild(heroElement);

    if (typeof hero.initializeDOMElements === 'function') hero.initializeDOMElements();
    updateHealth(hero);
    updateMana(hero);
    updateStamina(hero);
}

function handleTravel(poi) {
    if (poi.mapId) {
        mapHistory.push(currentMapId);
        const fromPoiName = poi.name;
        loadMap(poi.mapId, true, fromPoiName);
        battleLog.log(`Traveled via ${fromPoiName} to map: ${poi.mapId}. New location: ${currentLocation || 'Default'}`);
        questSystem.updateQuestProgress('travel', { poiName: poi.name, mapId: poi.mapId });
    } else {
        alert(`No map defined for ${poi.name}`);
    }
}

async function handleCombat(poi) {
    // window.showCustomConfirm now resolves to true or false
    const confirmed = await window.showCustomConfirm(`Start battle at ${poi.name} (Stage 1)?`);

    if (!confirmed) {
        isProcessingPoiClick = false; // MODIFIED: Explicitly reset flag if battle is not started/cancelled
        return;
    }

    // If confirmed:
    currentLocation = poi.name;
    renderPOIs();

    battleLog.log(`Initiating battle at ${poi.name}, Stage 1`);
    const battleDialogueOptions = {};
    if (poi.dialogueNpcId) {
        battleDialogueOptions.npcId = poi.dialogueNpcId;
        if (poi.combatStartDialogueId) {
            const dialogueKey = `${poi.id}_start`;
            if (!poi.showDialogueOnce || !shownDialogues.has(dialogueKey)) {
                battleDialogueOptions.startDialogueId = poi.combatStartDialogueId;
                shownDialogues.add(dialogueKey);
            }
        }
        // Add stage-specific dialogue IDs
        if (poi.stageDialogues) {
            Object.entries(poi.stageDialogues).forEach(([stage, dialogueId]) => {
                const dialogueKey = `${poi.id}_stage${stage}`;
                if (!poi.showDialogueOnce || !shownDialogues.has(dialogueKey)) {
                    battleDialogueOptions[`stage${stage}DialogueId`] = dialogueId;
                    shownDialogues.add(dialogueKey);
                }
            });
        }
        if (poi.combatEndWinDialogueId) {
            const dialogueKey = `${poi.id}_win`;
            if (!poi.showDialogueOnce || !shownDialogues.has(dialogueKey)) {
                battleDialogueOptions.endWinDialogueId = poi.combatEndWinDialogueId;
                shownDialogues.add(dialogueKey);
            }
        }
        if (poi.combatEndLossDialogueId) {
            const dialogueKey = `${poi.id}_loss`;
            if (!poi.showDialogueOnce || !shownDialogues.has(dialogueKey)) {
                battleDialogueOptions.endLossDialogueId = poi.combatEndLossDialogueId;
                shownDialogues.add(dialogueKey);
            }
        }
        if (poi.fleeDialogueId) {
            const dialogueKey = `${poi.id}_flee`;
            if (!poi.showDialogueOnce || !shownDialogues.has(dialogueKey)) {
                battleDialogueOptions.fleeDialogueId = poi.fleeDialogueId;
                shownDialogues.add(dialogueKey);
            }
        }
    }

    openTab(null, 'battlefield');
    try {
        await battleController.startBattle(poi, battleDialogueOptions, 1);
    } catch (battleError) {
        console.error(`Error during battle setup or execution for ${poi.name}:`, battleError);
        // Log or show user-friendly message if necessary
    } finally {
        // MODIFIED: Ensure flag is reset after battle attempt (success or failure) for the confirmed path
        isProcessingPoiClick = false;
    }
}

async function handleTalk(poi) {
    if (poi.npcId) {
        currentLocation = poi.name;
        renderPOIs();
        battleLog.log(`Speaking at ${poi.name} (NPC: ${poi.npcId})`);
        questSystem.updateQuestProgress('talk', { poiName: poi.name, npcId: poi.npcId });
        try {
            await window.startDialogue(poi.npcId, poi.dialogueId);
        } finally {
            isProcessingPoiClick = false; // Reset the flag after dialogue completes or fails
        }
    } else {
        alert(`No NPC defined for ${poi.name}`);
        isProcessingPoiClick = false; // Reset the flag if there's no NPC
    }
}

function handleTavern(poi) {
    currentLocation = poi.name;
    renderPOIs();
    battleLog.log(`Visiting tavern: ${poi.name}`);
    const cost = poi.cost || 0;
    // Consider using showCustomConfirm for consistency if desired, but native confirm is fine here.
    if (confirm(`Rest at ${poi.name} for ${cost} gold?`)) {
        if (hero.spendGold(cost)) {
            hero.currentHealth = hero.maxHealth;
            hero.currentMana = hero.stats.mana;
            hero.currentStamina = hero.stats.stamina;
            battleLog.log(`Rested at ${poi.name}. HP, Mana, and Stamina restored.`);
            if (document.getElementById('map').classList.contains('active')) {
                 renderHeroPortrait();
                 _updateHeroMapSidebar(hero);
            }
        } else {
            alert(`Not enough gold. You need ${cost} gold.`);
        }
    }
}

function renderPOIs() {
    if (!mapContainer) return;
    if (poiListUI) poiListUI.innerHTML = '';
    mapContainer.querySelectorAll('.poi').forEach(el => el.remove());

    const mapWidth = mapContainer.offsetWidth;
    const mapHeight = mapContainer.offsetHeight;

    pointsOfInterest.forEach((poi) => {
        // Skip if POI is hidden or locked
        if (hiddenPois.has(poi.id)) return; // First check if POI is hidden
        if (poi.isEffectivelyLocked) return; // Then check if POI is locked

        const poiElement = document.createElement('div');
        poiElement.classList.add('poi', poi.type);
        if (poi.name === currentLocation) poiElement.classList.add('current-location');

        poiElement.style.left = `${(poi.x / 100) * mapWidth}px`;
        poiElement.style.top = `${(poi.y / 100) * mapHeight}px`;
        poiElement.dataset.poiName = poi.name;
        poiElement.dataset.poiId = poi.id;

        const poiIcon = document.createElement('img');
        poiIcon.src = poi.icon; poiIcon.alt = poi.name;
        poiIcon.classList.add('poi-icon');

        const poiNameSpan = document.createElement('span');
        poiNameSpan.classList.add('poi-name'); poiNameSpan.textContent = poi.name;

        poiElement.appendChild(poiIcon); poiElement.appendChild(poiNameSpan);
        mapContainer.appendChild(poiElement);

        poiElement.addEventListener('click', async (event) => {
            event.stopPropagation(); event.preventDefault();
            isProcessingPoiClick = window.isProcessingPoiClick;
            if (isProcessingPoiClick) {
                const currentPoi = pointsOfInterest.find(p => p.name === currentLocation);
                console.warn(`POI click ignored, already processing ${currentPoi ? currentPoi.name : 'unknown POI'}.`);
                return;
            }
            isProcessingPoiClick = true; // Set flag at the beginning of processing

            const clickedPoiName = poiElement.dataset.poiName;
            const clickedPoiData = pointsOfInterest.find(p => p.name === clickedPoiName && !p.isEffectivelyLocked);

            if (!clickedPoiData) {
                isProcessingPoiClick = false; // Reset if POI data not found
                return;
            }

            try {
                if (clickedPoiData.type === 'travel') {
                    handleTravel(clickedPoiData);
                } else if (clickedPoiData.type === 'combat') {
                    await handleCombat(clickedPoiData); // handleCombat now resets isProcessingPoiClick internally
                } else if (clickedPoiData.type === 'dialogue') {
                    await handleTalk(clickedPoiData);
                } else if (clickedPoiData.type === 'tavern') {
                    handleTavern(clickedPoiData);
                }
                // For synchronous handlers (travel, tavern) or async handlers that don't manage
                // isProcessingPoiClick themselves, the finally block below will reset it.
                // handleCombat manages it internally for its async nature.
            } catch (error) {
                console.error("Error handling POI click for:", clickedPoiData.name, error);
                // The finally block will ensure isProcessingPoiClick is reset.
            } finally {
                // MODIFIED: Universal reset for the flag.
                // If handleCombat (or other future async handlers) already reset it, this is fine.
                // This ensures that after any POI action (sync or async, success or failure),
                // the flag is cleared, allowing further interactions.
                isProcessingPoiClick = false;
            }
        });

        if (poiListUI) {
            const listItem = document.createElement('li');
            listItem.classList.add('poi-list-item');
            listItem.textContent = `${poi.name} (${poi.type})`;
            listItem.dataset.poiName = poi.name;
            listItem.addEventListener('click', (event) => {
                const mapPoiElement = mapContainer.querySelector(`.poi[data-poi-name="${event.target.dataset.poiName}"]`);
                if (mapPoiElement) mapPoiElement.click();
            });
            poiListUI.appendChild(listItem);
        }
        updateHeroMapStats(hero);
    });
}

export function refreshMapElements() {
    if (mapsData && currentMapId) {
        renderPOIs();
        if (hero) {
            renderHeroPortrait();
            _updateHeroMapSidebar(hero);
        }
    }
}

function loadMap(mapIdToLoad, fromTravel = false, previousPoiName = null) {
    if (!mapsData) { console.error("Maps data not loaded."); return; }
    const mapToLoad = mapsData[mapIdToLoad];
    if (!mapToLoad) { console.error(`Map ${mapIdToLoad} not found`); return; }

    currentMapId = mapIdToLoad;
    if(mapContainer) mapContainer.style.backgroundImage = `url(${mapToLoad.background})`;

    pointsOfInterest = mapToLoad.pois.map(poi => ({
        ...poi, type: poi.type || 'combat', cost: poi.cost || 0,
        isEffectivelyLocked: poi.initiallyLocked && !unlockedPredefinedPois.has(poi.id)
    }));

    let newLocationCandidate = null;
    if (fromTravel && previousPoiName) {
        const entryPoi = pointsOfInterest.find(p => !p.isEffectivelyLocked && p.leadsFrom === mapHistory[mapHistory.length-1] && p.originalEntryPoiName === previousPoiName);
        if (entryPoi) newLocationCandidate = entryPoi.name;
    }
    if (!newLocationCandidate && (!currentLocation || !pointsOfInterest.some(poi => !poi.isEffectivelyLocked && poi.name === currentLocation))) {
        const startingPoi = pointsOfInterest.find(poi => !poi.isEffectivelyLocked && poi.isStartingLocation) ||
                            pointsOfInterest.find(poi => !poi.isEffectivelyLocked);
        if(startingPoi) newLocationCandidate = startingPoi.name;
    }
    if (newLocationCandidate) currentLocation = newLocationCandidate;
    else if (pointsOfInterest.length > 0 && !pointsOfInterest.some(p => p.name === currentLocation && !p.isEffectivelyLocked)) {
        const firstAvailable = pointsOfInterest.find(p => !p.isEffectivelyLocked);
        currentLocation = firstAvailable ? firstAvailable.name : null;
    }

    refreshMapElements();
}

export function initializeMap() {
    mapContainer = document.getElementById('map-container');
    poiListUI = document.getElementById('poi-list');
    heroPortraitContainer = document.getElementById('hero-portrait-container');

    heroMapGoldValueEl = document.getElementById('hero-map-gold-value');
    expBarClass1El = document.getElementById('exp-bar-class1');
    expBarClass2El = document.getElementById('exp-bar-class2');
    expBarClass3El = document.getElementById('exp-bar-class3');

    // Start regeneration interval (every 2 seconds)
    if (window.regenerationInterval) {
        clearInterval(window.regenerationInterval);
    }
    window.regenerationInterval = setInterval(handleOutOfCombatRegeneration, 2000);

    async function loadMapDataAndRenderInitial() {
        try {
            const response = await fetch('Data/maps.json');
            mapsData = await response.json();
            loadMap(currentMapId);
        } catch (error) {
            console.error('Error loading map data:', error);
        }
    }

    window.addEventListener('resize', refreshMapElements);

    function unlockMapPOI(targetMapId, poiIdToUnlock) {
            if (!mapsData || !mapsData[targetMapId]) {
                console.error(`Map ${targetMapId} not found for unlocking POI ${poiIdToUnlock}.`);
                return;
            }
            const poiDefinitionOnMap = mapsData[targetMapId].pois.find(p => p.id === poiIdToUnlock);

            if (!poiDefinitionOnMap) {
                console.error(`POI definition with ID ${poiIdToUnlock} not found on map ${targetMapId}.`);
                return;
            }
            if (!poiDefinitionOnMap.initiallyLocked) {
                console.warn(`POI ${poiIdToUnlock} on map ${targetMapId} is not an initially locked POI.`);
                return;
            }
            if (unlockedPredefinedPois.has(poiIdToUnlock)) {
                console.warn(`POI ${poiIdToUnlock} is already unlocked.`);
                return;
            }

            unlockedPredefinedPois.add(poiIdToUnlock);
            console.log(`POI ${poiIdToUnlock} on map ${targetMapId} unlocked.`);

            if (currentMapId === targetMapId) {
                pointsOfInterest = pointsOfInterest.map(poi => ({
                    ...poi,
                    isEffectivelyLocked: poi.initiallyLocked && !unlockedPredefinedPois.has(poi.id)
                }));
                renderPOIs();
            }
        }

    window.unlockMapPOI = unlockMapPOI;

    loadMapDataAndRenderInitial();
}

export const getMapStateForSave = () => ({
    currentMapId: currentMapId,
    currentLocation: currentLocation,
    mapHistory: [...mapHistory],
    unlockedPredefinedPois: Array.from(unlockedPredefinedPois),
    hiddenPois: Array.from(hiddenPois),
    shownDialogues: Array.from(shownDialogues) // Add shown dialogues to save state
});

export const setMapStateFromLoad = (state) => {
    if (!mapsData) {
        setTimeout(() => setMapStateFromLoad(state), 200); return;
    }
    currentMapId = state.currentMapId || 'hollowreach_Valley';
    currentLocation = state.currentLocation || null;
    mapHistory = [...(state.mapHistory || [])];
    unlockedPredefinedPois = new Set(state.unlockedPredefinedPois || []);
    hiddenPois = new Set(state.hiddenPois || []);
    shownDialogues = new Set(state.shownDialogues || []); // Restore shown dialogues
    loadMap(currentMapId);
};

export function setCurrentMap(mapId) {
    if (!mapsData || !mapsData[mapId]) {
        console.error(`Map ${mapId} not found`);
        return;
    }

    mapHistory.push(currentMapId);
    loadMap(mapId, true);
    battleLog.log(`Traveled to map: ${mapId}. New location: ${currentLocation || 'Default'}`);
    questSystem.updateQuestProgress('travel', { poiName: null, mapId: mapId });

}

// Expose setCurrentMap to window for dialogue system
window.setCurrentMap = setCurrentMap;

// Add function to hide a POI
export function hideMapPOI(targetMapId, poiIdToHide) {
    if (!mapsData || !mapsData[targetMapId]) {
        console.error(`Map ${targetMapId} not found for hiding POI ${poiIdToHide}.`);
        return;
    }
    const poiDefinitionOnMap = mapsData[targetMapId].pois.find(p => p.id === poiIdToHide);

    if (!poiDefinitionOnMap) {
        console.error(`POI definition with ID ${poiIdToHide} not found on map ${targetMapId}.`);
        return;
    }

    hiddenPois.add(poiIdToHide);
    console.log(`POI ${poiIdToHide} on map ${targetMapId} hidden.`);

    if (currentMapId === targetMapId) {
        renderPOIs();
    }
}

// Add function to show a hidden POI
export function showMapPOI(targetMapId, poiIdToShow) {
    if (!mapsData || !mapsData[targetMapId]) {
        console.error(`Map ${targetMapId} not found for showing POI ${poiIdToShow}.`);
        return;
    }
    const poiDefinitionOnMap = mapsData[targetMapId].pois.find(p => p.id === poiIdToShow);

    if (!poiDefinitionOnMap) {
        console.error(`POI definition with ID ${poiIdToShow} not found on map ${targetMapId}.`);
        return;
    }

    if (!hiddenPois.has(poiIdToShow)) {
        console.warn(`POI ${poiIdToShow} is not hidden.`);
        return;
    }

    hiddenPois.delete(poiIdToShow);
    console.log(`POI ${poiIdToShow} on map ${targetMapId} shown.`);

    if (currentMapId === targetMapId) {
        renderPOIs();
    }
}

// Expose hide/show functions to window for dialogue system
window.hideMapPOI = hideMapPOI;
window.showMapPOI = showMapPOI;

// Add function to reset shown dialogues for a POI
export function resetPOIDialogues(poiId) {
    const dialogueTypes = ['start', 'win', 'loss', 'flee'];
    dialogueTypes.forEach(type => {
        shownDialogues.delete(`${poiId}_${type}`);
    });
    console.log(`Reset shown dialogues for POI ${poiId}`);
}

// Expose resetPOIDialogues to window for dialogue system
window.resetPOIDialogues = resetPOIDialogues;

export function handleOutOfCombatRegeneration() {
    if (!hero) return;
    // Regenerate companions if they exist
    if (hero.getActivePartyMembers() && hero.getActivePartyMembers().length > 0) {
        hero.getActivePartyMembers().forEach(companion => {
            if (companion.currentHealth > 0) {
                // Health regeneration (1% of max health per tick)
                const healthRegenAmount = parseFloat((0.01 * companion.maxHealth).toFixed(2));
                if (companion.currentHealth < companion.maxHealth) {
                    companion.currentHealth = Math.min(companion.maxHealth, companion.currentHealth + healthRegenAmount);
                    companion.currentHealth = parseFloat(companion.currentHealth.toFixed(2));
                    updateHealth(companion);
                }

                // Mana regeneration (based on manaRegen stat)
                const manaRegenAmount = companion.stats.manaRegen || 1;
                if (companion.currentMana < companion.stats.mana) {
                    companion.currentMana = Math.min(companion.stats.mana, companion.currentMana + manaRegenAmount);
                    updateMana(companion);
                }

                // Stamina regeneration (10% of vitality per tick)
                const staminaRegenAmount = Math.floor(0.1 * companion.stats.vitality) || 1;
                if (companion.currentStamina < companion.stats.stamina) {
                    companion.currentStamina = Math.min(companion.stats.stamina, companion.currentStamina + staminaRegenAmount);
                    updateStamina(companion);
                }
            }
        });
    }

    // Always update the hero portrait and sidebar
    renderHeroPortrait();
    _updateHeroMapSidebar(hero);
    updateHeroMapStats(hero);
}

// Add cleanup function
export function cleanupMap() {
    if (window.regenerationInterval) {
        clearInterval(window.regenerationInterval);
        window.regenerationInterval = null;
    }
}