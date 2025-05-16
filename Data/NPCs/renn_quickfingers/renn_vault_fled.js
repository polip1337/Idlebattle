export default {
    nodes: [
        {
            id: 'start',
            text: "*Panting heavily* That... that was too close! A real, live Sentry! I haven't seen one of those active in... well, ever! Okay, new plan: we are NOT going back in there anytime soon. Let's get back to the surface. Maybe that vault is best left sealed.",
            action: [
                { type: 'completeQuest', questId: 'fogscarHeist' } // Assumes quest completion here
            ]
            // No options, dialogue closes automatically
        }
    ]
};