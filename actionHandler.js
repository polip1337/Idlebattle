import { hero, allItemsCache } from './initialize.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';
import { setCurrentMap } from './map.js';
import { openTradeModal } from './tradeModal.js';
import { startSlideshow } from './slideshow.js';
import Item from './item.js';

export function handleActions(actions) {
    if (!actions) return;
    
    const actionArray = Array.isArray(actions) ? actions : [actions];
    actionArray.forEach(action => {
        switch (action.type) {
            case 'startQuest':
                questSystem.startQuest(action.questId);
                break;
            case 'addItem':
                const itemData = allItemsCache ? allItemsCache[action.itemId] : null;
                if (itemData && hero && typeof hero.addItemToInventory === 'function') {
                    for (let i = 0; i < (action.quantity || 1); i++) {
                        hero.addItemToInventory(new Item(itemData));
                    }
                } else {
                    console.warn(`Could not add item ${action.itemId}: item data not found or hero.addItemToInventory missing.`);
                }
                break;
            case 'equip':
                const equipItem = allItemsCache ? allItemsCache[action.itemId] : null;
                if (equipItem && hero) {
                    // First add the item to inventory if it's not already there
                    if (!hero.hasItem(equipItem.id)) {
                        hero.addItemToInventory(new Item(equipItem));
                    }
                    // Find the actual item instance in inventory
                    const itemInstance = hero.inventory.find(item => item.id === equipItem.id);
                    if (itemInstance) {
                        // Try to equip the actual item instance
                        const equipResult = hero.equipItem(itemInstance, equipItem.slot);
                        if (!equipResult) {
                            console.warn(`Failed to equip item ${action.itemId}: ${equipResult.reason}`);
                        }
                    } else {
                        console.warn(`Could not find item ${action.itemId} in inventory after adding it.`);
                    }
                } else {
                    console.warn(`Could not equip item ${action.itemId}: item data not found or hero missing.`);
                }
                break;
            case 'completeQuest':
                questSystem.completeQuest(action.questId);
                break;
            case 'unlockPOI':
                if (window.unlockMapPOI) {
                    window.unlockMapPOI(action.mapId, action.poiId);
                } else {
                    console.error('unlockMapPOI function is not available.');
                }
                break;
            case 'hidePOI':
                if (window.hideMapPOI) {
                    window.hideMapPOI(action.mapId, action.poiId);
                } else {
                    console.error('hideMapPOI function is not available.');
                }
                break;
            case 'travelToMap':
                openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
                setCurrentMap(action.mapId);
                break;
            case 'openDialogue':
                if (window.startDialogue) {
                    window.startDialogue(action.npcId, action.dialogueId);
                } else {
                    console.error('startDialogue function is not available.');
                }
                break;
            case 'startSlideshow':
                if (startSlideshow) {
                    startSlideshow(() => {
                        if (action.resumeDialogue) {
                            startDialogue(action.npcId, action.dialogueId);
                        }
                    }, action.slideshowId || 'slideshow');
                } else {
                    console.error('startSlideshow function is not available.');
                }
                break;
            case 'addCompanion':
                try {
                    hero.recruitCompanion(action.companionId);
                } catch(error) {
                    console.error('Error adding companion:', error);
                }
                break;
            case 'removeCompanion':
                if (window.removeCompanionFromParty) {
                    window.removeCompanionFromParty(action.companionId);
                } else {
                    console.error('removeCompanionFromParty function is not available.');
                }
                break;
            case 'removeItem':
                if (hero && typeof hero.removeItemFromInventory === 'function') {
                    const removeItem = allItemsCache ? allItemsCache[action.itemId] : null;
                    if (removeItem) {
                        const quantity = action.quantity || 1;
                        const result = hero.removeItemFromInventory(removeItem.id, quantity);
                        if (!result) {
                            console.warn(`Failed to remove item ${action.itemId}: Item not found or insufficient quantity.`);
                        }
                    } else {
                        console.warn(`Could not remove item ${action.itemId}: item data not found.`);
                    }
                } else {
                    console.warn('Could not remove item: hero.removeItemFromInventory function is not available.');
                }
                break;
            case 'startBattle':
                if (window.startBattle) {
                    window.startBattle(action.enemyId, action.areaId);
                } else {
                    console.error('startBattle function is not available.');
                }
                break;
            default:
                console.log('Unknown action type:', action.type);
        }
    });
} 