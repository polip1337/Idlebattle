import { openTab } from './navigation.js';

export function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    const poiList = document.getElementById('poi-list');
    const addPoiButton = document.getElementById('add-poi-button');

    // Sample points of interest (can be loaded from a JSON file later)
    let pointsOfInterest = [
        { name: "Goblin Plains", x: 200, y: 150, icon: "Media/map/poi-goblin.png" },
        { name: "Mystic Forest", x: 400, y: 300, icon: "Media/map/poi-forest.png" },
    ];

    // Render existing POIs
    function renderPOIs() {
        poiList.innerHTML = ''; // Clear existing POIs
        pointsOfInterest.forEach((poi, index) => {
            // Create POI element on map
            const poiElement = document.createElement('div');
            poiElement.classList.add('poi');
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

            poiElement.appendChild(poiIcon);
            poiElement.appendChild(poiName);
            mapContainer.appendChild(poiElement);

            // Create POI list item
            const listItem = document.createElement('li');
            listItem.classList.add('poi-list-item');
            listItem.dataset.index = index;
            listItem.textContent = poi.name;
            listItem.addEventListener('click', () => {
                // Scroll to POI on map
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

        const icon = prompt("Enter the icon path (e.g., Media/map/poi-new.png):", "Media/map/poi-default.png");
        const x = Math.floor(Math.random() * (mapContainer.offsetWidth - 100));
        const y = Math.floor(Math.random() * (mapContainer.offsetHeight - 100));

        pointsOfInterest.push({ name, x, y, icon });
        renderPOIs();
    }

    // Initialize map interactions
    addPoiButton.addEventListener('click', addPOI);
    mapContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('poi-icon') || event.target.classList.contains('poi-name')) {
            const poiIndex = event.target.closest('.poi').dataset.index;
            const poi = pointsOfInterest[poiIndex];
            alert(`Selected: ${poi.name}\nCoordinates: (${poi.x}, ${poi.y})`);
            // Future: Trigger stage loading or other game logic
        }
    });

    // Initial render
    renderPOIs();

    // Ensure map tab is accessible
    document.getElementById('mapNavButton').addEventListener('click', () => openTab(event, 'map'));
}