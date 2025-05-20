export default {
    nodes: [
        {
            id: 'start',
            text: "*Panting heavily* That... that was too close! A real, live Sentry Golem! I haven't seen one of those active in... well, ever! *Looks back nervously* It's still coming! The main corridor collapsed behind us - our only way out is through the fogged corridor! We have to move, NOW!",
            options: [
                {
                    text: "The fogged corridor? But you said that was dangerous!",
                    nextId: 'dangerous_choice'
                },
                {
                    text: "Lead the way! Better the fog than that thing!",
                    nextId: 'flee_to_fog'
                }
            ]
        },
        {
            id: 'dangerous_choice',
            text: "Yes, it's dangerous! But that golem will tear us apart! The fog might kill us, but that thing WILL kill us! We have no choice!",
            options: [
                {
                    text: "Fine! Let's go!",
                    nextId: 'flee_to_fog'
                }
            ]
        },
        {
            id: 'flee_to_fog',
            text: "Good choice! *Renn sprints ahead* Follow me! And whatever you do, don't breathe in the fog! Hold your breath as long as you can!",
            action: [

                { type: 'travelToMap', mapId: 'rustmarketSewersCollapsed' }
            ]
            // No options, dialogue closes automatically
        }
    ]
};