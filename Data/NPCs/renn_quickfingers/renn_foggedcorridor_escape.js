export default {
    nodes: [
        {
            id: 'start',
            text: "*Coughing* We... we made it! *Takes deep breaths* That was too close.",
            options: [
                {
                    text: "What was that thing we fought?",
                    nextId: 'explain_creature'
                },
                {
                    text: "Let's get out of here before more show up.",
                    nextId: 'escape_plan'
                }
            ]
        },
        {
            id: 'explain_creature',
            text: "Some kind of fog-wraith. They say they're the spirits of people who died in the fog, twisted by its magic. *Shudders* I've never seen one up close before. Let's hope we don't see another.",
            options: [
                {
                    text: "So what's our next move?",
                    nextId: 'escape_plan'
                }
            ]
        },
        {
            id: 'escape_plan',
            text: "Figure out why the fog didn't kill us. Then we can figure out what to do next.",
            options: [
                {
                    text: "Lead the way. I'm right behind you.",
                    action: [
                        { type: 'hidePOI', mapId: 'hollowreach', poiId: 'renn_quickfingers_heist' },
                        { type: 'hidePOI', mapId: 'rustmarketSewers', poiId: 'sewer_foggedCorridor_POI' },
                        { type: 'hidePOI', mapId: 'rustmarketSewers', poiId: 'sewer_vaultAntechamber_POI' },
                        { type: 'unlockPOI', mapId: 'hollowreach', poiId: 'renn_quickfingers_house' },
                        { type: 'travelToMap', mapId: 'foggedDocks' }
                    ]
                }
            ]
        }
    ]
}; 