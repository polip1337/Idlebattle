export default {
    nodes: [
        {
            id: "start",
            text: "The fog hums around us, doesn't it? I can feel its rhythm in my bones. Sylvara says you've learned to listen to it too. That's rare. Most people only hear the danger, not the song.",
            options: [
                {
                    text: "How did you learn to hear the fog's song?",
                    nextId: "origin"
                },
                {
                    text: "What can you teach me about the fog?",
                    nextId: "teach"
                },
                {
                    text: "Tell me about your connection to the portal fragments.",
                    nextId: "fragments"
                },
                {
                    text: "I need to go.",
                    nextId: null
                }
            ]
        },
        {
            id: "origin",
            text: "I was born in the fog's heart. My parents were Driftkin scholars, studying the Old Empire's portal technology. The fog... changed me. Gave me these eyes, this connection. Some call it a curse, but I see it as a gift. It lets me understand the fog in ways others can't.",
            options: [
                {
                    text: "What do you see with those eyes?",
                    nextId: "vision"
                },
                {
                    text: "Can you teach me to understand the fog better?",
                    nextId: "teach"
                }
            ]
        },
        {
            id: "vision",
            text: "I see the fog's patterns, its currents, its memories. The Old Empire's echoes still linger in the mist. Sometimes I can see where portals used to be, where they might be again. It's like reading a map made of light and shadow.",
            options: [
                {
                    text: "That sounds incredible. Can you show me?",
                    nextId: "teach"
                },
                {
                    text: "What do you know about the Old Empire?",
                    nextId: "old_empire"
                }
            ]
        },
        {
            id: "teach",
            text: "The fog isn't just a force of nature - it's alive, in its own way. It responds to emotion, to intention. When you navigate it, don't fight it. Dance with it. Let it guide you, and you'll find paths others can't see.",
            options: [
                {
                    text: "How do I start learning this dance?",
                    nextId: "dance_lesson"
                },
                {
                    text: "What about the dangers in the fog?",
                    nextId: "dangers"
                }
            ]
        },
        {
            id: "dance_lesson",
            text: "Close your eyes. Feel the fog's movement around you. Its currents, its pulses. Don't try to control it - just feel it. When you understand its rhythm, you'll know when to move, when to wait, when to let it carry you.",
            options: [
                {
                    text: "I think I'm starting to feel it.",
                    nextId: "encouragement"
                },
                {
                    text: "This is harder than it sounds.",
                    nextId: "patience"
                }
            ]
        },
        {
            id: "fragments",
            text: "Portal fragments are like pieces of a song. Each one hums its own tune, but together they can create something beautiful. I've spent years learning their language, understanding how they interact with the fog.",
            options: [
                {
                    text: "Can you teach me to read them?",
                    nextId: "fragment_lesson"
                },
                {
                    text: "What's the most interesting thing you've learned?",
                    nextId: "discoveries"
                }
            ]
        },
        {
            id: "old_empire",
            text: "The Old Empire tried to control the fog, to use it. They built their portals to harness its power, but they didn't understand it. The fog isn't something to be controlled - it's something to be understood, to be worked with.",
            options: [
                {
                    text: "What happened to them?",
                    nextId: "fall"
                },
                {
                    text: "How do we avoid their mistakes?",
                    nextId: "lessons"
                }
            ]
        },
        {
            id: "dangers",
            text: "The fog's dangers are real, but they're often misunderstood. The [Pulsefinders|pulsefinders|Fog cult] fear the fog, try to control it. That's what makes them dangerous. The fog itself isn't malicious - it's just... different. It follows its own rules.",
            options: [
                {
                    text: "How do you deal with the Pulsefinders?",
                    nextId: "pulsefinders"
                },
                {
                    text: "What other dangers should I watch for?",
                    nextId: "other_dangers"
                }
            ]
        }
    ]
}; 