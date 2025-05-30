# Area File Structure Documentation

This document explains the structure and purpose of area files in the game. Use this as a reference when creating new areas.

## Basic Structure

```json
{
  "id": "uniqueAreaId",        // Unique identifier used in code references
  "name": "Display Name",      // Name shown to players
  "description": "...",        // Rich description of the area's atmosphere
  "background": "path/to/bg",  // Background image path (16:9 or 4:3 ratio)
  "music": "path/to/music",    // Background music path (.ogg format)
  "stages": [...],            // Array of combat stages
  "onEnterActions": [...]     // Actions triggered on area entry
}
```

## Stages

Each stage represents a distinct combat encounter. Stages are processed in order, with increasing difficulty.

```json
{
  "stage": 1,                 // Stage number (1-based index)
  "description": "...",       // Description shown when entering stage
  "mobs": [                   // Array of enemy groups
    {
      "type": "enemyType",    // References enemy definition in database
      "count": 2,            // Number of this enemy type to spawn
      "level": 3             // Enemy level (affects stats/abilities)
    }
  ]
}
```

### Stage Design Guidelines

1. **Progressive Difficulty**
   - Start with weaker enemies (level 2-3)
   - Gradually increase enemy levels
   - Final stage should have the strongest enemies

2. **Enemy Composition**
   - Mix different enemy types for varied combat
   - Consider enemy synergies and roles
   - Balance group sizes (typically 2-4 enemies per stage)

3. **Stage Descriptions**
   - Be descriptive and atmospheric
   - Connect to the area's overall theme
   - Hint at what enemies to expect

## OnEnterActions

Actions triggered when the player first enters the area. Executed in order of appearance.

```json
{
  "type": "dialogue",         // Type of action
  "npcId": "npcId",          // For dialogue: NPC to talk to
  "dialogueId": "dialogueId", // For dialogue: specific dialogue tree
  "effect": "effectName",     // For effects: effect to apply
  "duration": 300            // For effects: duration in seconds
}
```

## Best Practices

1. **Naming Conventions**
   - Use camelCase for IDs
   - Use descriptive, thematic names
   - Keep IDs unique across all areas

2. **Asset References**
   - Use relative paths from the game root
   - Follow the established directory structure
   - Use appropriate file formats (.png for images, .ogg for audio)

3. **Difficulty Scaling**
   - Start easy, end challenging
   - Consider player level expectations
   - Mix enemy types for interesting combat

4. **Thematic Consistency**
   - Keep descriptions and enemies thematically aligned
   - Use appropriate music and backgrounds
   - Maintain narrative coherence

## Example Area

See `AncientLibrary.json` for a complete example implementing these guidelines. 