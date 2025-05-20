export default {
    nodes: [
        {
            id: 'start',
            text: "The door should be down that corridor it was covered by mists until recently. For some reason they retreated. The corridor sed to be the way to Hollowreach's docks, but now... well, let's just say you won't be making it to the other side. That fog'll eat you alive faster than a starving rat in a cheese shop. Best turn back while you still can!",
            options: [
                {
                    text: "Like a rat...? It doesn't even make sense. But i guess i get the point. I'll turn back.",
                    nextId: 'getToTheDoor',
                    action: [
                        {
                            type: 'unlockPOI',
                            mapId: 'rustmarketSewers',
                            poiId: 'sewer_vaultAntechamber_POI'
                        },
                        {
                            type: 'unlockPOI',
                            mapId: 'rustmarketSewers',
                            poiId: 'sewer_foggedCorridor_POI'
                        },
                    ]
                }
            ]
            // No options, dialogue closes automatically
        },
        {
            id: 'getToTheDoor',
            text: "We made it! That looks like the door, Taryn! Just like the rumors said. Heavy old thing, but I think... yes! The mechanism is still working! *click, grind* There! Let's see what treasures await!",
            options: [
                {
                    text: "Follow her in.",
                }
            ]
        }
    ]
};
