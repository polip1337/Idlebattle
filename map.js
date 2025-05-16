import { openTab } from './navigation.js';
import { startBattle } from './Battle.js'; // Battle.js manages its own Area loading
import { team1, team2, battleLog, hero } from './initialize.js'; // No more stage/area specific imports from initialize for map UI
import { questSystem } from './questSystem.js';
import { updateHeroMapStats, renderHero, updateHealth, updateMana, updateStamina } from './Render.js';

export let mapsData = null;
export let currentMapId = 'hollowreach_Valley';
export let pointsOfInterest = [];
export let currentLocation = null;
let unlockedPredefinedPois = new Set();
let isProcessingPoiClick = false;
let mapHistory = [];

let mapContainer = null;
let poiListUI = null; // If you keep a list view of POIs
let heroPortraitContainer = null;


function renderHeroPortrait() {
    if (!hero || !heroPortraitContainer) return;
    heroPortraitContainer.innerHTML = '';
    const heroElement = renderHero(hero);
    heroPortraitContainer.appendChild(heroElement);
    if (typeof hero.initializeDOMElements === 'function') hero.initializeDOMElements();
    updateHealth(hero); updateMana(hero); updateStamina(hero);
}

function handleTravel(poi) {
    if (poi.mapId) {
        mapHistory.push(currentMapId);
        const fromPoiName = poi.name;
        loadMap(poi.mapId, true, fromPoiName); // loadMap will refresh elements
        battleLog.log(`Traveled via ${fromPoiName} to map: ${poi.mapId}. New location: ${currentLocation || 'Default'}`);
        questSystem.updateQuestProgress('travel', { poiName: poi.name, mapId: poi.mapId });
    } else {
        alert(`No map defined for ${poi.name}`);
    }
}

async function handleCombat(poi) {
    // Always start at stage 1 when initiating from map
        await window.showCustomConfirm(`Start battle at ${poi.name} (Stage 1)?`);

        currentLocation = poi.name; // Set current location on map
        renderPOIs(); // Update POI highlighting

        battleLog.log(`Initiating battle at ${poi.name}, Stage 1`);
        const battleDialogueOptions = {};
        if (poi.dialogueNpcId) {
            battleDialogueOptions.npcId = poi.dialogueNpcId;
            if (poi.combatStartDialogueId) battleDialogueOptions.startDialogueId = poi.combatStartDialogueId;
            if (poi.combatEndWinDialogueId) battleDialogueOptions.endWinDialogueId = poi.combatEndWinDialogueId;
            if (poi.combatEndLossDialogueId) battleDialogueOptions.endLossDialogueId = poi.combatEndLossDialogueId;
        }
        // Battle.js#startBattle handles Area loading for poi.name and the given stage number (1)
        openTab(null, 'battlefield'); // Switch to battlefield tab
        await startBattle(poi, battleDialogueOptions, 1); // Always stage 1 from map

}

async function handleTalk(poi) {
    if (poi.npcId) {
        currentLocation = poi.name;
        renderPOIs();
        battleLog.log(`Speaking at ${poi.name} (NPC: ${poi.npcId})`);
        questSystem.updateQuestProgress('talk', { poiName: poi.name, npcId: poi.npcId });
        await window.startDialogue(poi.npcId, poi.dialogueId);
    } else {
        alert(`No NPC defined for ${poi.name}`);
    }
}

function handleTavern(poi) {
    currentLocation = poi.name;
    renderPOIs();
    battleLog.log(`Visiting tavern: ${poi.name}`);
    const cost = poi.cost || 0;
    if (confirm(`Rest at ${poi.name} for ${cost} gold?`)) {
        if (hero.spendGold(cost)) {
            hero.currentHealth = hero.maxHealth;
            hero.currentMana = hero.stats.mana;
            hero.currentStamina = hero.stats.stamina;
            battleLog.log(`Rested at ${poi.name}. HP, Mana, and Stamina restored.`);
            updateHeroMapStats(hero); renderHeroPortrait();
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
        if (poi.isEffectivelyLocked) return;

        const poiElement = document.createElement('div');
        poiElement.classList.add('poi', poi.type);
        if (poi.name === currentLocation) poiElement.classList.add('current-location');

        poiElement.style.left = `${(poi.x / 100) * mapWidth}px`;
        poiElement.style.top = `${(poi.y / 100) * mapHeight}px`;
        poiElement.dataset.poiName = poi.name;

        const poiIcon = document.createElement('img');
        poiIcon.src = poi.icon; poiIcon.alt = poi.name;
        poiIcon.classList.add('poi-icon');

        const poiNameSpan = document.createElement('span');
        poiNameSpan.classList.add('poi-name'); poiNameSpan.textContent = poi.name;

        poiElement.appendChild(poiIcon); poiElement.appendChild(poiNameSpan);
        mapContainer.appendChild(poiElement);

        poiElement.addEventListener('click', async (event) => {
            event.stopPropagation(); event.preventDefault();
            if (isProcessingPoiClick) return;
            isProcessingPoiClick = true;
            setTimeout(() => { isProcessingPoiClick = false; }, 300);

            const clickedPoiName = poiElement.dataset.poiName;
            const clickedPoiData = pointsOfInterest.find(p => p.name === clickedPoiName && !p.isEffectivelyLocked);
            if (!clickedPoiData) return;

            // currentLocation = clickedPoiData.name; // Set by individual handlers if action is taken
            // renderPOIs(); // Re-render handled by individual handlers after currentLocation update

            if (clickedPoiData.type === 'travel') handleTravel(clickedPoiData);
            else if (clickedPoiData.type === 'combat') await handleCombat(clickedPoiData);
            else if (clickedPoiData.type === 'dialogue') await handleTalk(clickedPoiData);
            else if (clickedPoiData.type === 'tavern') handleTavern(clickedPoiData);
        });
        // Optional list item rendering
    });
}

export function refreshMapElements() {
    if (mapsData && currentMapId) {
        renderPOIs();
        if (hero) {
            renderHeroPortrait();
            updateHeroMapStats(hero);
        }
        // Stage/Area display elements on map tab are removed or no longer updated from here
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

    // Determine currentLocation
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
        // If current location is invalid/locked, pick first available
        const firstAvailable = pointsOfInterest.find(p => !p.isEffectivelyLocked);
        currentLocation = firstAvailable ? firstAvailable.name : null;
    }


    // No call to setupCurrentAreaForMapUI as Area is not pre-loaded for map UI.
    refreshMapElements();
}

export function initializeMap() {
    mapContainer = document.getElementById('map-container');
    poiListUI = document.getElementById('poi-list'); // If used
    heroPortraitContainer = document.getElementById('hero-portrait-container');

    async function loadMapDataAndRenderInitial() {
        try {
            const response = await fetch('Data/maps.json');
            mapsData = await response.json();
            loadMap(currentMapId); // Initial map load
        } catch (error) {
            console.error('Error loading map data:', error);
        }
    }
    
    window.addEventListener('resize', refreshMapElements);

    function unlockMapPOI(targetMapId, poiIdToUnlock) { // This can remain nested if only called via window.unlockMapPOI
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
                renderPOIs(); // Calls module-scoped renderPOIs
            }
        }

    window.unlockMapPOI = unlockMapPOI;

    loadMapDataAndRenderInitial();
}

export const getMapStateForSave = () => ({
    currentMapId: currentMapId,
    currentLocation: currentLocation,
    mapHistory: [...mapHistory],
    unlockedPredefinedPois: Array.from(unlockedPredefinedPois)
    // stageNumber removed
});

export const setMapStateFromLoad = (state) => {
    if (!mapsData) {
        setTimeout(() => setMapStateFromLoad(state), 200); return;
    }
    currentMapId = state.currentMapId || 'hollowreach_Valley';
    currentLocation = state.currentLocation || null; // Will be refined by loadMap
    mapHistory = [...(state.mapHistory || [])];
    unlockedPredefinedPois = new Set(state.unlockedPredefinedPois || []);
    // stageNumber from save is ignored for map UI purposes.
    loadMap(currentMapId);
};