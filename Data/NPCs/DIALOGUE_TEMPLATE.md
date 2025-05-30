# Dialogue System Documentation

This document explains the structure and capabilities of the dialogue system. Use this as a reference when creating new NPC dialogues.

## Basic Structure

```javascript
export default {
    nodes: [
        {
            id: "start",                    // Required: Unique identifier for this node
            text: "Dialogue text here",     // Required: The text shown to the player
            options: [                      // Optional: Array of player response options
                {
                    text: "Option text",    // Required: Text shown on the button
                    nextId: "nextNode",     // Optional: ID of the next node to show
                    conditions: [],         // Optional: Array of conditions that must be met
                    hideWhenUnavailable: true, // Optional: Hide option if conditions not met
                    action: {}              // Optional: Action to trigger when selected
                }
            ]
        }
    ]
};
```

## Text Formatting

Dialogue text supports hypertext links using the format:
`[Display Text|topicId|Tooltip Description]`

Example:
```javascript
text: "The [fog|fog|Unnatural mist] hides our past, traveler."
```

## Available Actions

Actions can be single objects or arrays of actions. All actions are handled by `actionHandler.js`.

### Quest Actions
```javascript
// Start a new quest
action: { type: "startQuest", questId: "questId" }

// Complete a quest
action: { type: "completeQuest", questId: "questId" }
```

### Item Actions
```javascript
// Add item to inventory
action: { type: "addItem", itemId: "itemId", quantity: 1 }

// Remove item from inventory
action: { type: "removeItem", itemId: "itemId", quantity: 1 }

// Equip an item
action: { type: "equip", itemId: "itemId" }
```

### Gold Actions
```javascript
// Add gold
action: { type: "addGold", amount: 100 }

// Remove gold
action: { type: "removeGold", amount: 50 }
```

### Map Actions
```javascript
// Unlock a point of interest
action: { type: "unlockPOI", mapId: "mapId", poiId: "poiId" }

// Hide a point of interest
action: { type: "hidePOI", mapId: "mapId", poiId: "poiId" }

// Travel to a different map
action: { type: "travelToMap", mapId: "mapId" }
```

### Dialogue Actions
```javascript
// Open a different dialogue
action: { type: "openDialogue", npcId: "npcId", dialogueId: "dialogueId" }

// Start a slideshow
action: { 
    type: "startSlideshow", 
    slideshowId: "slideshowId",
    resumeDialogue: true,  // Optional: Resume dialogue after slideshow
    npcId: "npcId",        // Required if resumeDialogue is true
    dialogueId: "dialogueId" // Required if resumeDialogue is true
}
```

### Companion Actions
```javascript
// Add a companion to party
action: { type: "addCompanion", companionId: "companionId" }

// Remove a companion from party
action: { type: "removeCompanion", companionId: "companionId" }
```

### Game State Actions
```javascript
// Set NPC knowledge
action: { 
    type: "setGameState",
    stateType: "npcKnowledge",
    npcId: "npcId",
    key: "knowledgeKey",
    value: "value"
}

// Set quest state
action: {
    type: "setGameState",
    stateType: "questState",
    questId: "questId",
    value: "value"
}

// Set location state
action: {
    type: "setGameState",
    stateType: "locationState",
    locationId: "locationId",
    key: "stateKey",
    value: "value"
}
```

### Combat Actions
```javascript
// Start a battle
action: { type: "startBattle", enemyId: "enemyId", areaId: "areaId" }
```

## Available Conditions

Conditions are checked using the `checkOptionConditions` function in `dialogue.js`. They decide if the dialogue option should be displayed.

### Item Conditions
```javascript
conditions: [
    { 
        type: "item",
        itemId: "itemId",
        quantity: 1  // Optional, defaults to 1
    }
]
```

### Quest Conditions
```javascript
// Check if quest is active
conditions: [
    { type: "questActive", questId: "questId" }
]

// Check if quest is completed
conditions: [
    { type: "questCompleted", questId: "questId" }
]

// Check specific quest step
conditions: [
    { 
        type: "questStep",
        questId: "questId",
        stepIndex: 2,
        branch: "branchName"  // Optional: Check specific quest branch
    }
]
```

### Skill Conditions
```javascript
conditions: [
    { 
        type: "skill",
        stat: "statName",
        value: 10
    }
]
```

### Location Conditions
```javascript
conditions: [
    { 
        type: "location",
        locationId: "locationId"
    }
]
```

### Condition Negation
Any condition can be negated by adding `negate: true`:
```javascript
conditions: [
    { 
        type: "questActive",
        questId: "questId",
        negate: true  // Will check if quest is NOT active
    }
]
```

## Best Practices

1. **Node Organization**
   - Use descriptive IDs
   - Keep related nodes close together
   - Use "start" as the entry point

2. **Option Design**
   - Keep options clear and concise
   - Use conditions to show/hide relevant options
   - Include a way to exit dialogue

3. **Action Usage**
   - Chain related actions together
   - Consider the order of actions
   - Handle edge cases (e.g., insufficient gold)

4. **Condition Logic**
   - Use conditions to create branching paths
   - Consider using `hideWhenUnavailable` for cleaner UI
   - Test all condition combinations

## Example Dialogue

See `vrenna_stoneweave/base.js` for a complete example implementing these guidelines. 