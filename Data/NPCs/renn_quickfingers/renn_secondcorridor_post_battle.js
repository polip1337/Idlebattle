export default {
    nodes: [
        {
            id: 'start',
            text: "Ah, there it is! That corridor used to be the way to Hollowreach's docks, but now... *shudders* The mists that covered it have pulled back, but don't let that fool you. That fog'll chew you up and spit you out faster than a starving rat in a cheese shop! Trust me, I've seen what happens to folks who try to push through. Best turn back while you still can!",
            options: [
                {
                    text: "Like a rat...? It doesn't even make sense. But i guess i get the point. ",
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
            text: "We made it! That looks like the door, Taryn! Just like the rumors said. But why is it open? Nevermind, let's see what treasures await!",
            options: [
                {
                    text: "...",
                    action:
                    {
                        type: 'travelToMap',
                        mapId: 'rustmarketSewers'
                    }
                }
            ]
        }
    ]
};
