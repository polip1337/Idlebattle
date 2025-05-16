// tradeModal.js
import { hero, allItemsCache, allCompanionsData } from './initialize.js'; // Assuming NPC data might come via allCompanionsData or a similar structure
import { createItemTooltipElement, showGeneralTooltip, hideGeneralTooltip } from './Render.js';
import Item from './item.js';

const tradeModal = document.getElementById('trade-modal');
const tradeModalNpcName = document.getElementById('trade-modal-npc-name');

const playerGoldDisplay = document.getElementById('trade-player-gold');
const playerItemsGrid = document.getElementById('trade-player-items');
const playerOfferItemsGrid = document.getElementById('trade-player-offer-items');
const playerGoldOfferInput = document.getElementById('trade-player-gold-offer');

const npcGoldDisplay = document.getElementById('trade-npc-gold');
const npcItemsGrid = document.getElementById('trade-npc-items');
const npcOfferItemsGrid = document.getElementById('trade-npc-offer-items');
const npcGoldOfferInput = document.getElementById('trade-npc-gold-offer');
const npcInventoryTitle = document.getElementById('trade-npc-inventory-title');

const balanceIndicator = document.getElementById('trade-balance-indicator');
const balanceValueText = document.getElementById('trade-balance-value');

const cancelButton = document.getElementById('trade-cancel-button');
const acceptButton = document.getElementById('trade-accept-button');

let currentNpc = null;
let playerInventory = []; // Array of { item: Item, uniqueId: string }
let npcInventory = [];    // Array of { item: Item, uniqueId: string }
let playerOffer = [];     // Array of { item: Item, uniqueId: string }
let npcOffer = [];        // Array of { item: Item, uniqueId: string }
let playerGoldOffered = 0;
let npcGoldOffered = 0;

// To make items distinct even if they have same item.id
let itemInstanceCounter = 0;
function generateUniqueId(item) {
    return `${item.id}_${itemInstanceCounter++}`;
}

export function openTradeModal(npcData) {
    if (!hero || !npcData) {
        console.error("Cannot open trade modal: hero or NPC data missing.");
        return;
    }
    currentNpc = npcData; // This is the raw NPC data object from npcs.json
    itemInstanceCounter = 0; // Reset for new trade session

    tradeModalNpcName.textContent = `Trade with ${currentNpc.name}`;
    npcInventoryTitle.textContent = `${currentNpc.name}'s Inventory`;

    // Deep copy inventories and assign unique IDs
    playerInventory = hero.inventory.map(item => ({ item: new Item(item), uniqueId: generateUniqueId(item) })); // Create new Item instances for trade
    
    npcInventory = [];
    if (currentNpc.tradeInventory) {
        currentNpc.tradeInventory.forEach(entry => {
            const itemData = allItemsCache[entry.id];
            if (itemData) {
                for (let i = 0; i < (entry.quantity || 1); i++) {
                    const newItemInstance = new Item(itemData); // Create new Item instance
                    npcInventory.push({ item: newItemInstance, uniqueId: generateUniqueId(newItemInstance) });
                }
            } else {
                console.warn(`Item ID ${entry.id} not found in allItemsCache for NPC ${currentNpc.name}`);
            }
        });
    }
    
    playerOffer = [];
    npcOffer = [];
    playerGoldOffered = 0;
    npcGoldOffered = 0;
    playerGoldOfferInput.value = 0;
    npcGoldOfferInput.value = 0;

    renderAll();
    tradeModal.classList.remove('hidden');
    tradeModal.classList.add('active');
}

function closeTradeModal() {
    tradeModal.classList.add('hidden');
    tradeModal.classList.remove('active');
    currentNpc = null;
}

function renderAll() {
    renderInventory(playerItemsGrid, playerInventory, true);
    renderInventory(npcItemsGrid, npcInventory, false);
    renderOffer(playerOfferItemsGrid, playerOffer, true);
    renderOffer(npcOfferItemsGrid, npcOffer, false);
    updateGoldDisplays();
    calculateBalance();
}

function renderInventory(gridElement, items, isPlayerSide) {
    gridElement.innerHTML = '';
    items.forEach(inventoryEntry => {
        const item = inventoryEntry.item;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trade-item';
        itemDiv.innerHTML = `
            <img src="${item.icon}" alt="${item.name}">
            <span class="trade-item-name">${item.name}</span>
            <span class="trade-item-value">${item.value}g</span>
        `;
        const tooltip = createItemTooltipElement(item);
        tooltip.style.visibility = 'hidden'; // Ensure initially hidden by JS
        itemDiv.appendChild(tooltip);

        itemDiv.addEventListener('mouseenter', (e) => showGeneralTooltip(e, tooltip));
        itemDiv.addEventListener('mouseleave', () => hideGeneralTooltip(tooltip));
        
        itemDiv.addEventListener('click', () => moveItem(inventoryEntry, isPlayerSide ? 'playerInventoryToOffer' : 'npcInventoryToOffer'));
        gridElement.appendChild(itemDiv);
    });
}

function renderOffer(gridElement, items, isPlayerSide) {
    gridElement.innerHTML = '';
     items.forEach(inventoryEntry => {
        const item = inventoryEntry.item;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trade-item'; // Can reuse style
        itemDiv.style.fontSize = '0.9em'; // Slightly smaller in offer
        itemDiv.innerHTML = `
            <img src="${item.icon}" alt="${item.name}" style="width:30px; height:30px;">
            <span class="trade-item-name">${item.name} (${item.value}g)</span>
        `;
        const tooltip = createItemTooltipElement(item);
        tooltip.style.visibility = 'hidden';
        itemDiv.appendChild(tooltip);

        itemDiv.addEventListener('mouseenter', (e) => showGeneralTooltip(e, tooltip));
        itemDiv.addEventListener('mouseleave', () => hideGeneralTooltip(tooltip));

        itemDiv.addEventListener('click', () => moveItem(inventoryEntry, isPlayerSide ? 'playerOfferToInventory' : 'npcOfferToInventory'));
        gridElement.appendChild(itemDiv);
    });
}

function moveItem(inventoryEntry, direction) {
    switch (direction) {
        case 'playerInventoryToOffer':
            playerInventory = playerInventory.filter(e => e.uniqueId !== inventoryEntry.uniqueId);
            playerOffer.push(inventoryEntry);
            break;
        case 'npcInventoryToOffer':
            npcInventory = npcInventory.filter(e => e.uniqueId !== inventoryEntry.uniqueId);
            npcOffer.push(inventoryEntry);
            break;
        case 'playerOfferToInventory':
            playerOffer = playerOffer.filter(e => e.uniqueId !== inventoryEntry.uniqueId);
            playerInventory.push(inventoryEntry);
            break;
        case 'npcOfferToInventory':
            npcOffer = npcOffer.filter(e => e.uniqueId !== inventoryEntry.uniqueId);
            npcInventory.push(inventoryEntry);
            break;
    }
    renderAll();
}

function updateGoldDisplays() {
    playerGoldDisplay.textContent = `Gold: ${hero.gold}`;
    npcGoldDisplay.textContent = `Gold: ${currentNpc.gold || 0}`;
}

playerGoldOfferInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 0;
    if (val < 0) val = 0;
    if (val > hero.gold) val = hero.gold;
    e.target.value = val; // Correct input if invalid
    playerGoldOffered = val;
    calculateBalance();
});

npcGoldOfferInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 0;
    if (val < 0) val = 0;
    if (val > (currentNpc.gold || 0)) val = (currentNpc.gold || 0);
    e.target.value = val; // Correct input if invalid
    npcGoldOffered = val;
    calculateBalance();
});


function calculateBalance() {
    const playerOfferValue = playerOffer.reduce((sum, entry) => sum + entry.item.value, 0) + playerGoldOffered;
    const npcOfferValue = npcOffer.reduce((sum, entry) => sum + entry.item.value, 0) + npcGoldOffered;

    const diff = npcOfferValue - playerOfferValue; // Positive if NPC offers more value, negative if player offers more

    balanceIndicator.classList.remove('player-favored', 'npc-favored');
    let balanceText = "Balanced";

    if (diff > 0) { // NPC is "paying more" or player gets more value
        balanceIndicator.classList.add('player-favored');
        const percentage = Math.min(100, (diff / (playerOfferValue || 1)) * 50); // Cap at 50% shift towards player
        balanceIndicator.style.width = `${50 + percentage}%`;
        balanceText = `NPC offers ${diff}g more`;
    } else if (diff < 0) { // Player is "paying more" or NPC gets more value
        balanceIndicator.classList.add('npc-favored');
        const percentage = Math.min(100, (Math.abs(diff) / (npcOfferValue || 1)) * 50); // Cap at 50% shift towards NPC
        balanceIndicator.style.width = `${50 + percentage}%`;
        balanceText = `You offer ${Math.abs(diff)}g more`;
    } else {
        balanceIndicator.style.width = '100%'; // Full bar for balanced
        balanceIndicator.style.backgroundColor = '#c89b3c'; // Neutral gold
    }
    balanceValueText.textContent = balanceText;

    // NPC AI: Might only accept if diff <= 0 (trade favors them or is balanced)
    // Or within a certain threshold. For now, let's say NPC accepts if diff <= 0 (or slightly positive for them)
    const npcAcceptsTrade = diff <= (currentNpc.barterThreshold || 5); // Example: NPC accepts if they gain up to 5g value or more.
    
    if (playerGoldOffered > hero.gold || npcGoldOffered > (currentNpc.gold || 0)) {
        acceptButton.classList.add('disabled');
        acceptButton.disabled = true;
        balanceValueText.textContent = "Not enough gold!";
    } else if (!npcAcceptsTrade && !(playerOfferValue === 0 && npcOfferValue === 0)) { // Don't disable if nothing is offered (e.g. just browsing)
        acceptButton.classList.add('disabled');
        acceptButton.disabled = true;
        // balanceValueText.textContent += " (NPC unhappy)";
    }
     else {
        acceptButton.classList.remove('disabled');
        acceptButton.disabled = false;
    }
}

function finalizeTrade() {
    // Double check conditions before finalizing
    if (playerGoldOffered > hero.gold || npcGoldOffered > (currentNpc.gold || 0)) {
        alert("Not enough gold for the offer.");
        return;
    }

    const playerOfferValue = playerOffer.reduce((sum, entry) => sum + entry.item.value, 0) + playerGoldOffered;
    const npcOfferValue = npcOffer.reduce((sum, entry) => sum + entry.item.value, 0) + npcGoldOffered;
    const diff = npcOfferValue - playerOfferValue;
    const npcAcceptsTrade = diff <= (currentNpc.barterThreshold || 5);

    if (!npcAcceptsTrade && !(playerOfferValue === 0 && npcOfferValue === 0)) {
        alert(`${currentNpc.name} is not happy with this trade.`);
        return;
    }

    // Update hero's gold and inventory
    hero.spendGold(playerGoldOffered);
    hero.addGold(npcGoldOffered);
    playerOffer.forEach(entry => hero.removeItemFromInventory(hero.inventory.find(i => i.id === entry.item.id))); // Remove by original ID, assumes 1:1
    npcOffer.forEach(entry => hero.addItemToInventory(entry.item)); // Add the new Item instance

    // Update NPC's gold and inventory (currentNpc is the data object, not a class instance)
    currentNpc.gold = (currentNpc.gold || 0) - npcGoldOffered + playerGoldOffered;
    
    // For NPC inventory, we need to update the source `currentNpc.tradeInventory`
    // This is tricky if tradeInventory is just IDs.
    // For now, let's assume changes to NPC inventory are NOT persistent beyond this trade screen
    // or would be handled by a more complex NPC inventory management system.
    // A simple update for the current session:
    const npcOriginalTradeInventoryIds = (currentNpc.tradeInventory || []).map(e => e.id);
    
    // Remove items NPC offered
    npcOffer.forEach(offeredEntry => {
        const indexInOriginal = npcOriginalTradeInventoryIds.indexOf(offeredEntry.item.id);
        if (indexInOriginal > -1) {
           const originalEntry = currentNpc.tradeInventory.find(invEntry => invEntry.id === offeredEntry.item.id);
           if (originalEntry) {
               if (originalEntry.quantity > 1) originalEntry.quantity--;
               else currentNpc.tradeInventory = currentNpc.tradeInventory.filter(invEntry => invEntry.id !== offeredEntry.item.id || originalEntry.quantity > 0);
           }
        }
    });
    // Add items Player offered
    playerOffer.forEach(receivedEntry => {
        const existingNpcEntry = (currentNpc.tradeInventory || []).find(e => e.id === receivedEntry.item.id);
        if (existingNpcEntry) {
            existingNpcEntry.quantity = (existingNpcEntry.quantity || 1) + 1;
        } else {
            if(!currentNpc.tradeInventory) currentNpc.tradeInventory = [];
            currentNpc.tradeInventory.push({ id: receivedEntry.item.id, quantity: 1 });
        }
    });


    // Refresh hero's inventory display on main hero sheet if open
    if (typeof window.renderHeroInventory === "function") window.renderHeroInventory(hero);
    if (typeof window.updateStatsDisplay === "function") window.updateStatsDisplay(hero); // For gold

    console.log("Trade successful!");
    closeTradeModal();
}


cancelButton.addEventListener('click', closeTradeModal);
acceptButton.addEventListener('click', () => {
    if (!acceptButton.disabled) {
        finalizeTrade();
    }
});

// Close modal if backdrop is clicked
tradeModal.addEventListener('click', (event) => {
    if (event.target === tradeModal) {
        closeTradeModal();
    }
});

// Export openTradeModal so it can be called from dialogue.js
// window.openTradeModal = openTradeModal; // If not using modules for dialogue.js
// Since dialogue.js is a module, it can import it.