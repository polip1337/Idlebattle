import { openTab } from './navigation.js';
import { startBattle, repeatStage } from './Battle.js';
import { team1, team2, battleLog } from './initialize.js';

export function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    const poiList = document.getElementById('poi-list');


    // Map state
    let currentMapId = 'hollowreach_Valley';
    let mapHistory = [];
    let currentLocation = null; // Tracks player's current POI
    let mapsData = null;
    let isProcessingClick = false; // Debounce flag

    // Load map data
    async function loadMapData() {
        try {
            const response = await fetch('Data/maps.json');
            mapsData = await response.json();
            loadMap(currentMapId);
        } catch (error) {
            console.error('Error loading map data:', error);
        }
    }

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
            type: poi.type || 'combat' // Default to combat if type not specified
        }));

        // Set initial player location if none exists
        if (!currentLocation && pointsOfInterest.length > 0) {
            currentLocation = pointsOfInterest[0].name;
        }

        renderPOIs();
    }

    // Sample points of interest (overwritten by loadMap)
    let pointsOfInterest = [];

    // Render POIs
    function renderPOIs() {
        poiList.innerHTML = ''; // Clear existing POIs
        mapContainer.querySelectorAll('.poi').forEach(el => el.remove()); // Clear map POIs

        pointsOfInterest.forEach((poi, index) => {
            // Create POI element on map
            const poiElement = document.createElement('div');
            poiElement.classList.add('poi', poi.type);
            poiElement.style.left = `${poi.x}px`;
            poiElement.style.top = `${poi.y}px`;
            poiElement.dataset.index = index;

            const poiIcon = document.createElement('img');
            poiIcon.src = poi.icon;
            poiIcon.alt = poi.name;
            poiIcon.classList.add('poi-icon');

            const poiName = document.createElement('span');
            poiName.classList.add('poi-name');
            poiName.textContent = poi.name;

            // Highlight current location
            if (poi.name === currentLocation) {
                poiElement.classList.add('current-location');
            }

            poiElement.appendChild(poiIcon);
            poiElement.appendChild(poiName);
            mapContainer.appendChild(poiElement);

            // Add click listener to .poi element
            poiElement.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                if (isProcessingClick) return; // Debounce
                isProcessingClick = true;
                setTimeout(() => { isProcessingClick = false; }, 300); // Reset after 300ms

                const poiIndex = poiElement.dataset.index;
                const poi = pointsOfInterest[poiIndex];
                if (poi.type === 'travel') {
                    handleTravel(poi);
                } else if (poi.type === 'combat') {
                    handleCombat(poi);
                } else if (poi.type === 'dialogue') {
                   battleLog.log(`Interacting with ${poi.npcId} at ${poi.name}`);
                   startDialogue(poi.npcId,poi.dialogueId)
                }
            });

            // Create POI list item
            const listItem = document.createElement('li');
            listItem.classList.add('poi-list-item', poi.type);
            listItem.dataset.index = index;
            listItem.textContent = poi.name;



            listItem.addEventListener('click', () => {
                poiElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                poiElement.classList.add('highlight');
                setTimeout(() => poiElement.classList.remove('highlight'), 2000);
            });
            poiList.appendChild(listItem);
        });


    }

    // Add new POI
    function addPOI() {
        const name = prompt("Enter the name of the new point of interest:");
        if (!name) return;

        const type = prompt("Enter the type (travel or combat):", "combat");
        if (!['travel', 'combat'].includes(type)) {
            alert("Invalid type. Use 'travel' or 'combat'.");
            return;
        }

        const icon = prompt("Enter the icon path (e.g., Media/map/poi-default.png):", "Media/map/poi-default.png");
        const x = Math.floor(Math.random() * (mapContainer.offsetWidth - 100));
        const y = Math.floor(Math.random() * (mapContainer.offsetHeight - 100));

        pointsOfInterest.push({ name, x, y, icon, type });
        renderPOIs();
    }

    // Remove POI
    function removePOI(index) {
        if (pointsOfInterest[index].name === currentLocation) {
            currentLocation = pointsOfInterest[0]?.name || null; // Move to first POI or clear
        }
        pointsOfInterest.splice(index, 1);
        renderPOIs();
    }

    // Handle travel POI
    function handleTravel(poi) {
        if (poi.mapId) {
            mapHistory.push(currentMapId);
            currentLocation = null; // Reset location for new map
            loadMap(poi.mapId);
            battleLog.log(`Traveled to ${poi.name}`);
        } else {
            alert(`No map defined for ${poi.name}`);
        }
    }

    // Handle combat POI
    function handleCombat(poi) {
        const confirmBattle = confirm(`Start battle at ${poi.name}?`);
        if (confirmBattle) {
            currentLocation = poi.name; // Update player location
            renderPOIs(); // Re-render to show new location
            battleLog.log(`Initiating battle at ${poi.name}`);
            openTab({ currentTarget: document.getElementById('battlefieldNavButton') }, 'battlefield');
        }
    }



    // Initial load
    loadMapData();
}