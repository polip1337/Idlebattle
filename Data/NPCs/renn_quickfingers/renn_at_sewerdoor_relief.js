export default {
    nodes: [
        {
            id: 'start',
            text: "We made it! That looks like the door, Taryn! Just like the rumors said. Heavy old thing, but I think... yes! The mechanism is still working! *click, grind* There! Let's see what treasures await!",
            action: [
                {
                    type: 'unlockPOI',
                    mapId: 'rustmarketSewers',
                    poiId: 'sewer_vaultAntechamber_POI'
                }
            ]
            // No options, dialogue closes automatically
        }
    ]
};