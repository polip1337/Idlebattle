export default {
    nodes: [
        {
            id: 'start',
            text: "*Panting* The fog... it's receding! *Looks back nervously* No time to wonder why - that thing's still after us! We can either risk the fog or face whatever's chasing us. Your call!",
            options: [
                {
                    text: "Into the fog! Better than whatever's behind us!",
                    nextId: 'flee_to_fog'
                },
                {
                    text: "We can't risk the fog!",
                    nextId: 'no_choice'
                }
            ]
        },
        {
            id: 'flee_to_fog',
            text: "*Sprints ahead* Good choice! *stops suddenly* What the...?",

            // No options, dialogue closes automatically
        },
        {
            id: 'no_choice',
            text: "We don't have a choice! *Sprints ahead* Good choice! *stops suddenly* What the...?",
            options: [
                {
                    text: "Fine! Let's go!",
                    nextId: 'flee_to_fog'
                }
            ]
        }
    ]
};
