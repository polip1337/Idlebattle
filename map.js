import { openTab } from './navigation.js';
import { startBattle, repeatStage } from './Battle.js';
import { team1, team2, battleLog, hero } from './initialize.js';
import { questSystem } from './questSystem.js';
import { updateHeroMapStats, renderHero, updateHealth, updateMana, updateStamina } from './Render.js';

export function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    const poiList = document.getElementById('poi-list');
    const heroPortraitContainer = document.getElementById('hero-portrait-container');

    // Map state
    let currentMapId = 'hollowreach_Valley';
    let mapHistory = [];
    let currentLocation = null;
    let mapsData = null;
    let isProcessingClick = false;

    // Render hero portrait
    function renderHeroPortrait() {
        if (!hero || !heroPortraitContainer) return;
        heroPortraitContainer.innerHTML = ''; // Clear existing content
        const heroElement = renderHero(hero); // Use renderHero from Render.js
        heroPortraitContainer.appendChild(heroElement);
        hero.initializeDOMElements(); // Ensure DOM elements are set
        updateHealth(hero); // Update health bar
        updateMana(hero); // Update mana bar
        updateStamina(hero); // Update stamina bar
    }

    // Load map data
    async function loadMapData() {
        try {
            const response = await fetch('Data/maps.json');
            mapsData = await response.json();
            loadMap(currentMapId);
            renderHeroPortrait(); // Render portrait after map data is loaded
        } catch (error) {
            console.error('Error loading map data:', error);
        }
    }

    window.addEventListener('resize', () => {
        if (mapsData && currentMapId) {
            renderPOIs(); // Re-render to update pixel positions
            if (hero) {
                renderHeroPortrait(); // Re-render portrait to ensure proper scaling
                updateHeroMapStats(hero);
            }
        }
    });

    // Load a specific map
    function loadMap(mapId) {
        const map = mapsData[mapId];
        if (!map) {
            console.error(`Map ${mapId} not found`);
            return;
        }
        currentMapId = mapId;
        mapContainer.style.backgroundImage = `url(${map.background})`;
        pointsOfInterest = map.pois.map(poi => ({
            ...poi,
            type: poi.type || 'combat',
            cost: poi.cost || 0
        }));

        const currentPoiExistsOnNewMap = pointsOfInterest.some(poi => poi.name === currentLocation);
        if (!currentLocation || !currentPoiExistsOnNewMap) {
            const startingPoi = pointsOfInterest.find(poi => poi.isStartingLocation) || (pointsOfInterest.length > 0 ? pointsOfInterest[0] : null);
            currentLocation = startingPoi ? startingPoi.name : null;
        }

        renderPOIs();
        renderHeroPortrait(); // Re-render portrait when map changes
        if (hero) updateHeroMapStats(hero);
    }

    let pointsOfInterest = [];

    function renderPOIs() {
        poiList.innerHTML = '';
        mapContainer.querySelectorAll('.poi').forEach(el => el.remove());

        const mapWidth = mapContainer.offsetWidth;
        const mapHeight = mapContainer.offsetHeight;

        pointsOfInterest.forEach((poi, index) => {
            const poiElement = document.createElement('div');
            poiElement.classList.add('poi', poi.type);

            const posX = (poi.x / 100) * mapWidth;
            const posY = (poi.y / 100) * mapHeight;

            poiElement.style.left = `${posX}px`;
            poiElement.style.top = `${posY}px`;
            poiElement.dataset.index = index;

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

            poiElement.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                if (isProcessingClick) return;
                isProcessingClick = true;
                setTimeout(() => { isProcessingClick = false; }, 300);

                const clickedPoi = pointsOfInterest[poiElement.dataset.index];
                if (clickedPoi.type === 'travel') {
                    handleTravel(clickedPoi);
                } else if (clickedPoi.type === 'combat') {
                    handleCombat(clickedPoi);
                } else if (clickedPoi.type === 'dialogue') {
                    handleTalk(clickedPoi);
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

    function addPOI() {
        const name = prompt("Enter the name of the new point of interest:");
        if (!name) return;

        const type = prompt("Enter the type (travel, combat, talk, or tavern):", "combat");
        if (!['travel', 'combat', 'talk', 'tavern'].includes(type)) {
            alert("Invalid type. Use 'travel', 'combat', 'talk', or 'tavern'.");
            return;
        }

        const icon = prompt("Enter the icon path (e.g., Media/map/poi-default.png):", "Media/map/poi-default.png");

        const x = Math.random() * 100;
        const y = Math.random() * 100;

        const poi = { name, x, y, icon, type };
        if (type === 'talk') {
            const npcId = prompt("Enter the NPC ID for this talk POI:");
            const dialogueId = prompt("Enter the dialogue ID for this talk POI (optional, will pick default if empty):");
            if (npcId) {
                poi.npcId = npcId;
                if (dialogueId) poi.dialogueId = dialogueId;
            } else {
                alert("NPC ID is required for talk POIs.");
                return;
            }
        } else if (type === 'travel') {
            const mapId = prompt("Enter the map ID for this travel POI:");
            if (mapId) {
                poi.mapId = mapId;
            } else {
                alert("Map ID is required for travel POIs.");
                return;
            }
        } else if (type === 'tavern') {
            const cost = parseInt(prompt("Enter the gold cost for resting at this tavern:", "10"));
            if (!isNaN(cost) && cost >= 0) {
                poi.cost = cost;
            } else {
                alert("Invalid cost for tavern.");
                return;
            }
        }

        pointsOfInterest.push(poi);
        renderPOIs();
    }

    function removePOI(index) {
        if (pointsOfInterest[index].name === currentLocation) {
            currentLocation = pointsOfInterest[0]?.name || null;
        }
        pointsOfInterest.splice(index, 1);
        renderPOIs();
    }

    function handleTravel(poi) {
        if (poi.mapId) {
            mapHistory.push(currentMapId);
            const fromPoiName = poi.name;
            loadMap(poi.mapId);
            const entryPoiForNewMap = pointsOfInterest.find(p => p.leadsFrom === currentMapId && p.originalEntryPoiName === fromPoiName) ||
                                      pointsOfInterest.find(p => p.isStartingLocation) ||
                                      (pointsOfInterest.length > 0 ? pointsOfInterest[0].name : null);
            currentLocation = entryPoiForNewMap ? (typeof entryPoiForNewMap === 'string' ? entryPoiForNewMap : entryPoiForNewMap.name) : null;

            battleLog.log(`Traveled to ${poi.name} (new map: ${poi.mapId})`);
            questSystem.updateQuestProgress('travel', { poiName: poi.name, mapId: poi.mapId });
            renderPOIs();
            renderHeroPortrait(); // Re-render portrait for new map
        } else {
            alert(`No map defined for ${poi.name}`);
        }
    }

    function handleCombat(poi) {
        const confirmBattle = confirm(`Start battle at ${poi.name}?`);
        if (confirmBattle) {
            currentLocation = poi.name;
            renderPOIs();
            renderHeroPortrait(); // Update portrait after location change
            battleLog.log(`Initiating battle at ${poi.name}`);
            startBattle(team1, team2, poi.name);
            openTab({ currentTarget: document.getElementById('battlefieldNavButton') }, 'battlefield');
        }
    }

    function handleTalk(poi) {
        if (poi.npcId) {
            currentLocation = poi.name;
            renderPOIs();
            renderHeroPortrait(); // Update portrait after location change
            battleLog.log(`Speaking at ${poi.name} (NPC: ${poi.npcId})`);
            questSystem.updateQuestProgress('talk', { poiName: poi.name, npcId: poi.npcId });
            window.startDialogue(poi.npcId, poi.dialogueId);
        } else {
            alert(`No NPC defined for ${poi.name}`);
        }
    }

    function handleTavern(poi) {
        currentLocation = poi.name;
        renderPOIs();
        renderHeroPortrait(); // Update portrait after location change
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
                renderHeroPortrait(); // Update portrait to reflect new stats
            } else {
                battleLog.log(`Not enough gold to rest at ${poi.name}. Required: ${cost}g, Have: ${hero.gold}g`);
                alert(`Not enough gold. You need ${cost} gold to rest here.`);
            }
        }
    }

    loadMapData();
}