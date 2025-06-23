export default {
    id: "sylvara_final_test",
    title: "The Fog's Heart",
    description: "Sylvara leads you to the heart of the fog, where you'll face your final test and meet a mysterious Driftkin companion.",
    stages: [
        {
            id: "start",
            text: "Sylvara's driftbarge approaches a massive fog vortex. 'This is where the fog's heart beats. And where you'll meet someone special.'",
            options: [
                {
                    text: "Who are we meeting?",
                    nextId: "companion_intro"
                },
                {
                    text: "I'm ready for the test.",
                    nextId: "test_begin"
                }
            ]
        },
        {
            id: "companion_intro",
            text: "Her name's Lyra. She's been studying the fog's patterns for years, longer than any of us. But she's... different. The fog changed her. You'll see what I mean.",
            options: [
                {
                    text: "Let's meet her.",
                    nextId: "test_begin"
                }
            ]
        },
        {
            id: "test_begin",
            text: "A figure emerges from the fog - a young woman with eyes that glow like the portal fragments. 'I'm Lyra,' she says, her voice carrying an echo of the fog's hum. 'Sylvara says you can hear the fog's song.'",
            options: [
                {
                    text: "I've been learning.",
                    nextId: "test_challenge"
                }
            ]
        },
        {
            id: "test_challenge",
            text: "Lyra extends her hand, a portal fragment pulsing in her palm. 'Show me. Let's dance with the fog together.'",
            options: [
                {
                    text: "Join her in the fog's dance",
                    nextId: "success"
                },
                {
                    text: "Try to lead the dance yourself",
                    nextId: "failure"
                }
            ]
        },
        {
            id: "success",
            text: "The fog swirls around you both, responding to your combined rhythm. Lyra's eyes brighten. 'You understand. The fog isn't just a force - it's a partner.'",
            options: [
                {
                    text: "What happens now?",
                    nextId: "complete"
                }
            ]
        },
        {
            id: "failure",
            text: "The fog resists your attempt to control it. Lyra shakes her head. 'The fog chooses its partners. You must let it choose you.'",
            options: [
                {
                    text: "Let me try again",
                    nextId: "test_challenge"
                }
            ]
        },
        {
            id: "complete",
            text: "Lyra turns to Sylvara, who nods approvingly. 'I'll join your journey,' Lyra says. 'The fog has shown me your path is worth following.'",
            options: [
                {
                    text: "Welcome aboard",
                    nextId: null,
                    action: { 
                        type: "completeQuest", 
                        questId: "sylvara_final_test",
                        companion: {
                            id: "lyra",
                            name: "Lyra",
                            description: "A Driftkin scholar whose connection to the fog runs deeper than most. Her unique abilities make her an invaluable guide through the mist.",
                            abilities: ["Fog Reading", "Portal Fragment Mastery", "Fog Navigation"]
                        }
                    }
                }
            ]
        }
    ]
}; 