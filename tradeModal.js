// tradeModal.js
import { hero, allItemsCache, allCompanionsData } from './initialize.js';
import { createItemTooltipElement, showGeneralTooltip, hideGeneralTooltip } from './Render.js';
import Item from './item.js';
// import { closeDialogue } from './dialogue.js'; // Uncomment if you have this

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
let playerOffer = [];     // Array of { item: Item, uniqueId: string } - Holds individual item instances
let npcOffer = [];        // Array of { item: Item, uniqueId: string } - Holds individual item instances
let playerGoldOffered = 0;
let npcGoldOffered = 0;

let itemInstanceCounter = 0;
function generateUniqueId(item) {
    return `${item.id}_${itemInstanceCounter++}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

export function openTradeModal(npcData) {
    if (!hero || !npcData) {
        console.error("Cannot open trade modal: hero or NPC data missing.");
        return;
    }

    const dialogueModalElement = document.getElementById('dialogue-modal');
    if (dialogueModalElement) {
            dialogueModalElement.classList.add('hidden');
        }


    currentNpc = npcData;
    itemInstanceCounter = 0;

    tradeModalNpcName.textContent = `Trade with ${currentNpc.name}`;
    npcInventoryTitle.textContent = `${currentNpc.name}'s Inventory`;

    populateModalInventoriesFromSource();

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

function populateModalInventoriesFromSource() {
    playerInventory = hero.inventory.map(item => ({ item: new Item(item), uniqueId: generateUniqueId(item) }));

    npcInventory = [];
    if (currentNpc.tradeInventory) {
        currentNpc.tradeInventory.forEach(entry => {
            const itemData = allItemsCache[entry.id];
            if (itemData) {
                for (let i = 0; i < (entry.quantity || 1); i++) {
                    const newItemInstance = new Item(itemData);
                    npcInventory.push({ item: newItemInstance, uniqueId: generateUniqueId(newItemInstance) });
                }
            } else {
                console.warn(`Item ID ${entry.id} not found in allItemsCache for NPC ${currentNpc.name}`);
            }
        });
    }
    playerInventory.sort((a,b) => a.item.name.localeCompare(b.item.name));
    npcInventory.sort((a,b) => a.item.name.localeCompare(b.item.name));
}


function closeTradeModal() {
    tradeModal.classList.add('hidden');
    tradeModal.classList.remove('active');
    const dialogueModalElement = document.getElementById('dialogue-modal').classList.remove('hidden');
    currentNpc = null;
    playerInventory = [];
    npcInventory = [];
    playerOffer = [];
    npcOffer = [];
}

function renderAll() {
    renderInventory(playerItemsGrid, playerInventory, true);
    renderInventory(npcItemsGrid, npcInventory, false);
    renderOffer(playerOfferItemsGrid, playerOffer, true); // playerOffer still holds individual unique items
    renderOffer(npcOfferItemsGrid, npcOffer, false);   // npcOffer still holds individual unique items
    updateGoldDisplays();
    calculateBalance();
}

function renderInventory(gridElement, sourceInventory, isPlayerSide) {
    gridElement.innerHTML = '';
    const itemStacks = new Map();
    sourceInventory.forEach(inventoryEntry => {
        const itemId = inventoryEntry.item.id;
        if (!itemStacks.has(itemId)) {
            itemStacks.set(itemId, {
                item: inventoryEntry.item,
                quantity: 0,
                uniqueIds: []
            });
        }
        const stack = itemStacks.get(itemId);
        stack.quantity++;
        stack.uniqueIds.push(inventoryEntry.uniqueId);
    });

    const sortedStacks = Array.from(itemStacks.values()).sort((a,b) => a.item.name.localeCompare(b.item.name));

    sortedStacks.forEach(stack => {
        const item = stack.item;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trade-item';
        itemDiv.innerHTML = `
            <img src="${item.icon}" alt="${item.name}">
            <span class="trade-item-name">${item.name}</span>
            <span class="trade-item-value">${item.value}g</span>
            ${stack.quantity > 1 ? `<span class="trade-item-quantity">x${stack.quantity}</span>` : ''}
        `;
        const tooltip = createItemTooltipElement(item);
        tooltip.style.visibility = 'hidden';
        itemDiv.appendChild(tooltip);

        itemDiv.addEventListener('mouseenter', (e) => showGeneralTooltip(e, tooltip));
        itemDiv.addEventListener('mouseleave', () => hideGeneralTooltip(tooltip));

        itemDiv.addEventListener('click', (event) => {
            const quantityToMove = event.shiftKey ? stack.quantity : 1;
            moveItemsFromInventoryToOffer(item.id, quantityToMove, isPlayerSide);
        });
        gridElement.appendChild(itemDiv);
    });
}

function moveItemsFromInventoryToOffer(itemId, quantity, isPlayerSource) {
    const sourceInv = isPlayerSource ? playerInventory : npcInventory;
    const targetOffer = isPlayerSource ? playerOffer : npcOffer;

    const itemsMoved = [];
    for (let i = 0; i < quantity; i++) {
        const itemIndex = sourceInv.findIndex(entry => entry.item.id === itemId);
        if (itemIndex > -1) {
            const [itemEntry] = sourceInv.splice(itemIndex, 1);
            itemsMoved.push(itemEntry);
        } else {
            break;
        }
    }

    if (itemsMoved.length > 0) {
        targetOffer.push(...itemsMoved);
        // targetOffer is an array of individual items, no need to sort by name here as renderOffer will stack
        renderAll();
    }
}

function renderOffer(gridElement, offeredItemsList, isPlayerOfferSide) {
    gridElement.innerHTML = '';

    // Group items in the offer list for stacking display
    const itemStacks = new Map();
    offeredItemsList.forEach(inventoryEntry => { // inventoryEntry is {item, uniqueId}
        const itemId = inventoryEntry.item.id;
        if (!itemStacks.has(itemId)) {
            itemStacks.set(itemId, {
                item: inventoryEntry.item, // Representative item for the stack
                quantity: 0,
                // We don't need to store all uniqueIds here for display purposes,
                // but the original offeredItemsList still holds them.
            });
        }
        const stack = itemStacks.get(itemId);
        stack.quantity++;
    });

    // Sort stacks by item name for consistent display in offer area
    const sortedStacks = Array.from(itemStacks.values()).sort((a,b) => a.item.name.localeCompare(b.item.name));

    sortedStacks.forEach(stack => {
        const item = stack.item; // This is the representative item (e.g., first one encountered)
        const itemDiv = document.createElement('div');
        itemDiv.className = 'trade-item'; // Can reuse style
        itemDiv.style.fontSize = '0.9em'; // Slightly smaller in offer
        itemDiv.innerHTML = `
            <img src="${item.icon}" alt="${item.name}" style="width:30px; height:30px;">
            <span class="trade-item-name">${item.name} (${item.value}g)</span>
            ${stack.quantity > 1 ? `<span class="trade-item-quantity" style="font-size:0.9em;">x${stack.quantity}</span>` : ''}
        `; // Added quantity display for offer items
        const tooltip = createItemTooltipElement(item); // Tooltip for the representative item
        tooltip.style.visibility = 'hidden';
        itemDiv.appendChild(tooltip);

        itemDiv.addEventListener('mouseenter', (e) => showGeneralTooltip(e, tooltip));
        itemDiv.addEventListener('mouseleave', () => hideGeneralTooltip(tooltip));

        // Clicking an offered item stack moves ONE item back. Shift+click moves ALL of that type.
        itemDiv.addEventListener('click', (event) => {
            const quantityToMove = event.shiftKey ? stack.quantity : 1;
            moveItemsFromOfferToInventory(item.id, quantityToMove, isPlayerOfferSide);
        });
        gridElement.appendChild(itemDiv);
    });
}

function moveItemsFromOfferToInventory(itemId, quantity, isPlayerOfferSource) {
    const sourceOffer = isPlayerOfferSource ? playerOffer : npcOffer;
    const targetInventory = isPlayerOfferSource ? playerInventory : npcInventory;

    const itemsMovedBack = [];
    for (let i = 0; i < quantity; i++) {
        // Find the first item in the offer list that matches the itemId
        const itemIndexInOffer = sourceOffer.findIndex(entry => entry.item.id === itemId);
        if (itemIndexInOffer > -1) {
            const [itemEntry] = sourceOffer.splice(itemIndexInOffer, 1); // Remove it from offer
            itemsMovedBack.push(itemEntry);
        } else {
            break; // No more items of this type in the offer
        }
    }

    if (itemsMovedBack.length > 0) {
        targetInventory.push(...itemsMovedBack); // Add them back to the respective inventory
        targetInventory.sort((a,b) => a.item.name.localeCompare(b.item.name)); // Re-sort inventory
        renderAll();
    }
}


function updateGoldDisplays() {
    playerGoldDisplay.textContent = `Gold: ${hero.gold}`;
    npcGoldDisplay.textContent = `Gold: ${currentNpc.gold || 0}`;
}

playerGoldOfferInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 0;
    if (val < 0) val = 0;
    if (val > hero.gold) val = hero.gold;
    e.target.value = val;
    playerGoldOffered = val;
    calculateBalance();
});

npcGoldOfferInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 0;
    if (val < 0) val = 0;
    if (val > (currentNpc.gold || 0)) val = (currentNpc.gold || 0);
    e.target.value = val;
    npcGoldOffered = val;
    calculateBalance();
});


function calculateBalance() {
    if (!currentNpc) return;

    const playerOfferValue = playerOffer.reduce((sum, entry) => sum + entry.item.value, 0) + playerGoldOffered;
    const npcOfferValue = npcOffer.reduce((sum, entry) => sum + entry.item.value, 0) + npcGoldOffered;

    const diff = npcOfferValue - playerOfferValue;

    balanceIndicator.classList.remove('player-favored', 'npc-favored');
    let balanceText = "Balanced";

    if (diff > 0) {
        balanceIndicator.classList.add('player-favored');
        const baseValueForPercentage = playerOfferValue > 0 ? playerOfferValue : (npcOfferValue / 2 || 1);
        const percentage = Math.min(50, (diff / baseValueForPercentage) * 50);
        balanceIndicator.style.width = `${50 + percentage}%`;
        balanceText = `NPC offers ${diff}g more`;
    } else if (diff < 0) {
        balanceIndicator.classList.add('npc-favored');
        const baseValueForPercentage = npcOfferValue > 0 ? npcOfferValue : (playerOfferValue / 2 || 1);
        const percentage = Math.min(50, (Math.abs(diff) / baseValueForPercentage) * 50);
        balanceIndicator.style.width = `${50 + percentage}%`;
        balanceText = `You offer ${Math.abs(diff)}g more`;
    } else {
        balanceIndicator.style.width = '100%';
        balanceIndicator.style.backgroundColor = '#c89b3c';
    }
    balanceValueText.textContent = balanceText;

    const npcAcceptsTrade = diff <= (currentNpc.barterThreshold || 5);

    if (playerGoldOffered > hero.gold || npcGoldOffered > (currentNpc.gold || 0)) {
        acceptButton.classList.add('disabled');
        acceptButton.disabled = true;
        balanceValueText.textContent = "Not enough gold!";
    } else if (!npcAcceptsTrade && !(playerOfferValue === 0 && npcOfferValue === 0)) {
        acceptButton.classList.add('disabled');
        acceptButton.disabled = true;
    } else {
        acceptButton.classList.remove('disabled');
        acceptButton.disabled = false;
    }
}

function finalizeTrade() {
    if (playerGoldOffered > hero.gold || npcGoldOffered > (currentNpc.gold || 0)) {
        showCustomDialog("Trade Error", "Not enough gold for the offer.", () => {});
        return;
    }

    const playerOfferValue = playerOffer.reduce((sum, entry) => sum + entry.item.value, 0) + playerGoldOffered;
    const npcOfferValue = npcOffer.reduce((sum, entry) => sum + entry.item.value, 0) + npcGoldOffered;
    const diff = npcOfferValue - playerOfferValue;
    const npcAcceptsTrade = diff <= (currentNpc.barterThreshold || 5);

    if (!npcAcceptsTrade && !(playerOfferValue === 0 && npcOfferValue === 0)) {
        showCustomDialog("Trade Unacceptable", `${currentNpc.name} is not happy with this trade.`, () => {});
        return;
    }

    hero.spendGold(playerGoldOffered);
    hero.addGold(npcGoldOffered);

    // The playerOffer and npcOffer arrays contain the actual unique item instances being traded.
    // So, when removing from hero's inventory, we need to ensure we're conceptually removing these.
    // The current hero.removeItemFromInventory might just find by item.id.
    // If hero.inventory stores unique instances, we'd need to match unique IDs.
    // For now, assuming `hero.removeItemFromInventory(item)` works by ID for one instance.
    playerOffer.forEach(entry => {
        const itemDefinitionId = entry.item.id;
        // This simplified removal assumes hero.removeItemFromInventory finds and removes *one* item matching the definition ID.
        // A more robust system would involve hero's inventory having unique instance IDs for each item,
        // and `entry.originalInstanceId` (if we tracked it from playerInventory) would be used for removal.
        const itemInHeroInventory = hero.inventory.find(i => i.id === itemDefinitionId);
        if (itemInHeroInventory) {
             // If your Item class has a unique instance ID, use that:
             // hero.removeItemInstanceFromInventory(entry.item.instanceId);
             // Otherwise, by definition ID:
            hero.removeItemFromInventory(entry.item); // Pass the actual item object, or one that matches by ID
        } else {
            console.warn(`Could not find item ${itemDefinitionId} (unique trade ID: ${entry.uniqueId}) in hero inventory to remove.`);
        }
    });

    npcOffer.forEach(entry => {
        hero.addItemToInventory(new Item(entry.item)); // Add new instances to hero
    });

    currentNpc.gold = (currentNpc.gold || 0) - npcGoldOffered + playerGoldOffered;

    if (!currentNpc.tradeInventory) currentNpc.tradeInventory = [];

    npcOffer.forEach(offeredEntry => {
        const itemDefId = offeredEntry.item.id;
        const npcInvEntry = currentNpc.tradeInventory.find(e => e.id === itemDefId);
        if (npcInvEntry) {
            npcInvEntry.quantity = (npcInvEntry.quantity || 1) - 1;
            if (npcInvEntry.quantity <= 0) {
                currentNpc.tradeInventory = currentNpc.tradeInventory.filter(e => e.id !== itemDefId);
            }
        } else {
             console.warn(`NPC offered item ${itemDefId} (unique: ${offeredEntry.uniqueId}) not found in their source tradeInventory.`);
        }
    });

    playerOffer.forEach(receivedEntry => {
        const itemDefId = receivedEntry.item.id;
        const existingNpcEntry = currentNpc.tradeInventory.find(e => e.id === itemDefId);
        if (existingNpcEntry) {
            existingNpcEntry.quantity = (existingNpcEntry.quantity || 0) + 1;
        } else {
            currentNpc.tradeInventory.push({ id: itemDefId, quantity: 1 });
        }
    });

    itemInstanceCounter = 0;
    populateModalInventoriesFromSource();

    playerOffer = [];
    npcOffer = [];
    playerGoldOffered = 0;
    npcGoldOffered = 0;
    playerGoldOfferInput.value = 0;
    npcGoldOfferInput.value = 0;

    renderAll();

    if (typeof window.renderHeroInventory === "function") window.renderHeroInventory(hero);
    if (typeof window.updateStatsDisplay === "function") window.updateStatsDisplay(hero);

    console.log("Trade successful! Modal remains open.");
}


cancelButton.addEventListener('click', closeTradeModal);
acceptButton.addEventListener('click', () => {
    if (!acceptButton.disabled) {
        finalizeTrade();
    }
});

tradeModal.addEventListener('click', (event) => {
    if (event.target === tradeModal) {
        closeTradeModal();
    }
});

function showCustomDialog(title, message, callback) {
    alert(`${title}\n\n${message}`);
    if(callback) callback();
}