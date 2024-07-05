// Add this to your JavaScript file

const mapSize = 30; // Define a larger map size
const visibleSize = 10; // Size of the visible map section


// Initial position of the player in the middle of the larger map
let playerPosition = {x: Math.floor(mapSize / 2), y: Math.floor(mapSize / 2)};

// Function to render the visible map section
function renderVisibleMap() {
    const mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = ''; // Clear the existing map

    const startX = Math.max(0, playerPosition.x - Math.floor(visibleSize / 2));
    const startY = Math.max(0, playerPosition.y - Math.floor(visibleSize / 2));

    for (let i = 0; i < visibleSize; i++) {
        for (let j = 0; j < visibleSize; j++) {
            const tileX = startX + i;
            const tileY = startY + j;

            if (tileX < mapSize && tileY < mapSize) {
                const tileType = fullMap[tileX][tileY];
                const tile = document.createElement('div');
                tile.className = `map-tile ${tileType}`;
                tile.id = `tile-${tileX}-${tileY}`;

                // Mark the player's position
                if (tileX === playerPosition.x && tileY === playerPosition.y) {
                    tile.classList.add('player');
                }

                mapContainer.appendChild(tile);
            }
        }
    }
}

// Function to move the player
function movePlayer(direction) {
    // Calculate new position
    let newPosition = {...playerPosition};

    switch (direction) {
        case 'up':
            newPosition.x = Math.max(0, playerPosition.x - 1);
            break;
        case 'down':
            newPosition.x = Math.min(mapSize - 1, playerPosition.x + 1);
            break;
        case 'left':
            newPosition.y = Math.max(0, playerPosition.y - 1);
            break;
        case 'right':
            newPosition.y = Math.min(mapSize - 1, playerPosition.y + 1);
            break;
    }

    // Update the map if the position has changed
    if (newPosition.x !== playerPosition.x || newPosition.y !== playerPosition.y) {
        playerPosition = newPosition;
        renderVisibleMap();
    }
}

// Function to load the map from JSON file
function loadMap() {
    fetch('Data/map.json')
        .then(response => response.json())
        .then(data => {
            fullMap = data.map;
            renderVisibleMap();
        })
        .catch(error => console.error('Error loading map:', error));
}

// Event listeners for movement buttons
document.getElementById('move-up').addEventListener('click', () => movePlayer('up'));
document.getElementById('move-down').addEventListener('click', () => movePlayer('down'));
document.getElementById('move-left').addEventListener('click', () => movePlayer('left'));
document.getElementById('move-right').addEventListener('click', () => movePlayer('right'));

// Load the map on page load
loadMap();
