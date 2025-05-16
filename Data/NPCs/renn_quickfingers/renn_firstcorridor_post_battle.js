export default {
    nodes: [
        {
            id: 'start',
            text: "Whew, nasty things. Good riddance. Looks like some scavengers have moved in deeper. Probably drawn by whatever's in that vault we're looking for. They look pretty desperate... and maybe a bit touched by whatever weirdness is down here. We'll need to be careful.",
            action: [
                {
                    type: 'unlockPOI',
                    mapId: 'rustmarketSewers', // Map where the POI to unlock is located
                    poiId: 'sewer_scavengerRedoubt_POI' // Unique ID of the POI to unlock
                }
            ]
            // No options, dialogue closes automatically
        }
    ]
};