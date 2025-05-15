import { openTab } from './navigation.js';
import { startBattle, repeatStage } from './Battle.js'; // repeatStage might not be used here directly
import { team1, team2, battleLog, hero } from './initialize.js';
import { questSystem } from './questSystem.js';
import { updateHeroMapStats, renderHero, updateHealth, updateMana, updateStamina } from './Render.js';

export let mapsData = null;
export let currentMapId = 'hollowreach_Valley';
export let pointsOfInterest = [];
let unlockedPredefinedPois = new Set(); // MODIFIED: To track unlocked POIs from maps.json

export function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    const poiList = document.getElementById('poi-list');
    const heroPortraitContainer = document.getElementById('hero-portrait-container');

    let mapHistory = [];
    let currentLocation = null;
    let isProcessingClick = false;

    function renderHeroPortrait() {
        if (!hero || !heroPortraitContainer) return;
        heroPortraitContainer.innerHTML = '';
        const heroElement = renderHero(hero);
        heroPortraitContainer.appendChild(heroElement);
        hero.initializeDOMElements();
        updateHealth(hero);
        updateMana(hero);
        updateStamina(hero);
    }

    async function loadMapDataAndRender() {
        try {
            const response = await fetch('Data/maps.json');
            mapsData = await response.json();
            // Ensure unlockedPredefinedPois is initialized before first loadMap if loading from save
            // This is handled by setMapStateFromLoad, for new game it's an empty set
            loadMap(currentMapId);
            renderHeroPortrait();
        } catch (error) {
            console.error('Error loading map data:', error);
        }
    }

    window.addEventListener('resize', () => {
        if (mapsData && currentMapId) {
            renderPOIs();
            if (hero) {
                renderHeroPortrait();
                updateHeroMapStats(hero);
            }
        }
    });

    function loadMap(mapIdToLoad) {
        if (!mapsData) {
            console.error("Maps data not loaded yet.");
            return;
        }
        const map = mapsData[mapIdToLoad];
        if (!map) {
            console.error(`Map ${mapIdToLoad} not found`);
            return;
        }
        currentMapId = mapIdToLoad;
        mapContainer.style.backgroundImage = `url(${map.background})`;

        // MODIFIED: Incorporate locked status
        pointsOfInterest = map.pois.map(poi => ({
            ...poi,
            type: poi.type || 'combat', // default type
            cost: poi.cost || 0,       // default cost
            isEffectivelyLocked: poi.initiallyLocked && !unlockedPredefinedPois.has(poi.id)
        }));

        const currentPoiExistsOnNewMap = pointsOfInterest.some(poi => !poi.isEffectivelyLocked && poi.name === currentLocation);
        if (!currentLocation || !currentPoiExistsOnNewMap) {
            const startingPoi = pointsOfInterest.find(poi => !poi.isEffectivelyLocked && poi.isStartingLocation) ||
                                pointsOfInterest.find(poi => !poi.isEffectivelyLocked); // first available unlocked POI
            currentLocation = startingPoi ? startingPoi.name : null;
        }

        renderPOIs();
        renderHeroPortrait();
        if (hero) updateHeroMapStats(hero);
    }

    function renderPOIs() {
        poiList.innerHTML = '';
        mapContainer.querySelectorAll('.poi').forEach(el => el.remove());

        const mapWidth = mapContainer.offsetWidth;
        const mapHeight = mapContainer.offsetHeight;

        pointsOfInterest.forEach((poi, index) => {
            // MODIFIED: Do not render or interact with effectively locked POIs
            if (poi.isEffectivelyLocked) {
                return;
            }

            const poiElement = document.createElement('div');
            poiElement.classList.add('poi', poi.type);

            const posX = (poi.x / 100) * mapWidth;
            const posY = (poi.y / 100) * mapHeight;

            poiElement.style.left = `${posX}px`;
            poiElement.style.top = `${posY}px`;
            poiElement.dataset.index = index; // Store original index in pointsOfInterest for click handler

            const poiIcon = document.createElement('img');
            poiIcon.src = poi.icon;
            poiIcon.alt = poi.name;
            poiIcon.classList.add('poi-icon');

            const poiName = document.createElement('span');
            poiName.classList.add('poi-name');
            poiName.textContent = poi.name;

            if (poi.name === currentLocation) {
                poiElement.classList.add('current-location');
            }

            poiElement.appendChild(poiIcon);
            poiElement.appendChild(poiName);
            mapContainer.appendChild(poiElement);

            poiElement.addEventListener('click', async (event) => { // MODIFIED to be async for handleCombat
                event.stopPropagation();
                event.preventDefault();
                if (isProcessingClick) return;
                isProcessingClick = true;
                setTimeout(() => { isProcessingClick = false; }, 300);

                // Find the POI from the master list using the original index
                // This ensures we're getting the correct POI even if some are filtered out by locking
                const clickedPoi = pointsOfInterest[poiElement.dataset.index];
                if (!clickedPoi || clickedPoi.isEffectivelyLocked) return; // Double check if somehow a locked POI was clicked

                if (clickedPoi.type === 'travel') {
                    handleTravel(clickedPoi);
                } else if (clickedPoi.type === 'combat') {
                    await handleCombat(clickedPoi); // MODIFIED: await combat handling
                } else if (clickedPoi.type === 'dialogue') {
                    await handleTalk(clickedPoi); // MODIFIED: make handleTalk async if startDialogue is awaited
                } else if (clickedPoi.type === 'tavern') {
                    handleTavern(clickedPoi);
                }
            });

            const listItem = document.createElement('li');
            listItem.classList.add('poi-list-item', poi.type);
            listItem.dataset.index = index;
            listItem.textContent = poi.name;
            if (poi.type === 'tavern' && poi.cost) {
                listItem.textContent += ` (Cost: ${poi.cost}g)`;
            }

            listItem.addEventListener('click', () => {
                poiElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                poiElement.classList.add('highlight');
                setTimeout(() => poiElement.classList.remove('highlight'), 2000);
            });
            poiList.appendChild(listItem);
        });
    }

    // This function is no longer for adding new POI data, but for unlocking existing ones.
    function unlockMapPOI(targetMapId, poiIdToUnlock) {
        if (!mapsData || !mapsData[targetMapId]) {
            console.error(`Map ${targetMapId} not found in mapsData for unlocking POI.`);
            return;
        }
        const poiDefinition = mapsData[targetMapId].pois.find(p => p.id === poiIdToUnlock);

        if (!poiDefinition) {
            console.error(`POI definition with ID ${poiIdToUnlock} not found on map ${targetMapId}.`);
            return;
        }

        if (!poiDefinition.initiallyLocked) {
            console.warn(`POI ${poiIdToUnlock} on map ${targetMapId} is not an initially locked POI. Nothing to change.`);
            // If it wasn't initially locked, it should already be visible.
            // If it was dynamically added previously (old system), this function isn't for that.
            return;
        }

        if (unlockedPredefinedPois.has(poiIdToUnlock)) {
            console.warn(`POI ${poiIdToUnlock} is already unlocked.`);
            return;
        }

        unlockedPredefinedPois.add(poiIdToUnlock);
        console.log(`POI ${poiIdToUnlock} on map ${targetMapId} has been unlocked.`);

        if (currentMapId === targetMapId) {
            // Re-calculate effective lock state for all POIs on the current map
            pointsOfInterest = pointsOfInterest.map(poi => ({
                ...poi,
                isEffectivelyLocked: poi.initiallyLocked && !unlockedPredefinedPois.has(poi.id)
            }));
            renderPOIs(); // Re-render the map with the newly unlocked POI visible
            console.log(`Current map ${currentMapId} refreshed. POI: ${poiIdToUnlock} should now be visible if it was locked.`);
        }
    }
    window.unlockMapPOI = unlockMapPOI;


    function handleTravel(poi) {
        if (poi.mapId) {
            mapHistory.push(currentMapId);
            const fromPoiName = poi.name; // Store current POI name before changing map
            loadMap(poi.mapId); // This will update pointsOfInterest and currentLocation for the new map

            // Try to set currentLocation more intelligently if the new map has an entry point from the old one
            const entryPoiForNewMap = pointsOfInterest.find(p =>
                !p.isEffectivelyLocked && (
                   (p.leadsFrom === mapHistory[mapHistory.length-1] && p.originalEntryPoiName === fromPoiName) ||
                   p.name === fromPoiName // If a POI with the same name exists on the new map
                )
            ) || pointsOfInterest.find(p => !p.isEffectivelyLocked && p.isStartingLocation) ||
                 pointsOfInterest.find(p => !p.isEffectivelyLocked); // First available unlocked POI

            currentLocation = entryPoiForNewMap ? entryPoiForNewMap.name : null;

            battleLog.log(`Traveled via ${fromPoiName} to map: ${poi.mapId}. New location: ${currentLocation || 'Default'}`);
            questSystem.updateQuestProgress('travel', { poiName: poi.name, mapId: poi.mapId });
            renderPOIs(); // Re-render POIs which also updates currentLocation highlight
            renderHeroPortrait();
        } else {
            alert(`No map defined for ${poi.name}`);
        }
    }

    async function handleCombat(poi) { // MODIFIED: async
        const confirmBattle = confirm(`Start battle at ${poi.name}?`);
        if (confirmBattle) {
            currentLocation = poi.name;
            renderPOIs();
            renderHeroPortrait();
            battleLog.log(`Initiating battle at ${poi.name}`);

            const battleDialogueOptions = {};
            if (poi.dialogueNpcId) {
                battleDialogueOptions.npcId = poi.dialogueNpcId;
                if (poi.combatStartDialogueId) battleDialogueOptions.startDialogueId = poi.combatStartDialogueId;
                if (poi.combatEndWinDialogueId) battleDialogueOptions.endWinDialogueId = poi.combatEndWinDialogueId;
                if (poi.combatEndLossDialogueId) battleDialogueOptions.endLossDialogueId = poi.combatEndLossDialogueId;
            }

            await startBattle(team1, team2, poi.name, battleDialogueOptions); // MODIFIED: await and pass dialogue options
            openTab({ currentTarget: document.getElementById('battlefieldNavButton') }, 'battlefield');
        }
    }

    async function handleTalk(poi) { // MODIFIED: async
        if (poi.npcId) {
            currentLocation = poi.name;
            renderPOIs();
            renderHeroPortrait();
            battleLog.log(`Speaking at ${poi.name} (NPC: ${poi.npcId})`);
            questSystem.updateQuestProgress('talk', { poiName: poi.name, npcId: poi.npcId });
            await window.startDialogue(poi.npcId, poi.dialogueId); // MODIFIED: await dialogue
        } else {
            alert(`No NPC defined for ${poi.name}`);
        }
    }

    function handleTavern(poi) {
        currentLocation = poi.name;
        renderPOIs();
        renderHeroPortrait();
        battleLog.log(`Visiting tavern: ${poi.name}`);

        const cost = poi.cost || 0;
        const confirmRest = confirm(`Rest at ${poi.name} for ${cost} gold? This will fully restore HP, Mana, and Stamina.`);

        if (confirmRest) {
            if (hero.spendGold(cost)) {
                hero.currentHealth = hero.maxHealth;
                hero.currentMana = hero.stats.mana;
                hero.currentStamina = hero.stats.stamina;
                battleLog.log(`Rested at ${poi.name}. HP, Mana, and Stamina fully restored.`);
                updateHeroMapStats(hero);
                renderHeroPortrait();
            } else {
                battleLog.log(`Not enough gold to rest at ${poi.name}. Required: ${cost}g, Have: ${hero.gold}g`);
                alert(`Not enough gold. You need ${cost} gold to rest here.`);
            }
        }
    }

    loadMapDataAndRender();

    window.getMapStateForSave = () => {
        return {
            currentMapId: currentMapId,
            currentLocation: currentLocation,
            mapHistory: [...mapHistory],
            unlockedPredefinedPois: Array.from(unlockedPredefinedPois) // MODIFIED: Save unlocked POI IDs
        };
    };

    window.setMapStateFromLoad = (state) => {
        if (!mapsData) {
            setTimeout(() => window.setMapStateFromLoad(state), 500); // MODIFIED: use window.setMapStateFromLoad
            return;
        }
        currentMapId = state.currentMapId || 'hollowreach_Valley';
        currentLocation = state.currentLocation || null;
        mapHistory = [...(state.mapHistory || [])];
        // MODIFIED: Load unlocked POI IDs
        unlockedPredefinedPois = new Set(state.unlockedPredefinedPois || []);

        loadMap(currentMapId);
        if (state.currentLocation && pointsOfInterest.some(poi => !poi.isEffectivelyLocked && poi.name === state.currentLocation)) {
            currentLocation = state.currentLocation;
        } else if (!currentLocation && pointsOfInterest.length > 0) { // If currentLocation is null after loadMap, set a default
             const firstUnlockedPoi = pointsOfInterest.find(poi => !poi.isEffectivelyLocked);
             if(firstUnlockedPoi) currentLocation = firstUnlockedPoi.name;
        }
        renderPOIs();
        if (hero) updateHeroMapStats(hero);
    };
}
export const getMapStateForSave = () => window.getMapStateForSave();
export const setMapStateFromLoad = (state) => window.setMapStateFromLoad(state);