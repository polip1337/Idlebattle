export default {
    nodes: [
        {
            id: "start",
            text: "The last guardian falls, its bones clattering against the damp stone floor. In the sudden silence, a faint hum draws your attention to the altar. There, nestled among ancient offerings, lies an etched bone—the Bone Whisper. As your fingers close around it, a chill runs through you. The bone thrums with dark energy, its surface covered in strange symbols that seem to writhe in the dim light. The fog around you stirs, as if disturbed by the relic's presence.",
            options: [
                {
                    text: "Take the relic",
                    nextId: null,
                    action: [
                        { type: "addItem", itemId: "boneWhisperRelic", quantity: 1 },
                    {type: 'travelToMap',mapId: 'rustmarketSewers' }
                    ]
                }
            ]
        }
    ]
};