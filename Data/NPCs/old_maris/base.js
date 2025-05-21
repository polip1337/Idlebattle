export default {
    nodes: [
{
    id: "start",
    npcId: "orphanage_mistress",
    dialogue: [
        {
            id: "initial_dismissal",
            text: "I'm afraid I have difficult news. The city council has cut our funding again. We can no longer support our older wards. You've reached the age where you must make your own way in the world.",
            responses: [
                {
                    text: "But where will I go?",
                    next: "guidance"
                },
                {
                    text: "I understand.",
                    next: "farewell_gift"
                }
            ]
        },
        {
            id: "guidance",
            text: "Rustmarket is always looking for able hands. And your old friend Renn might have some work for you. The city may seem daunting, but you've been preparing for this day. You're ready.",
            next: "farewell_gift"
        },
        {
            id: "farewell_gift",
            text: "Here. Take these 5 gold pieces. It's not much, but it should help you get started. Remember what I've taught you - stay away from the fog, keep your wits about you, and trust your instincts. The factions will try to recruit you, but choose your path carefully.",
            responses: [
                {
                    text: "Thank you for everything, Mistress.",
                    next: "final_words"
                }
            ]
        },
        {
            id: "final_words",
            text: "You've grown into a fine young person, Taryn. I'm proud of you. Now go, before the council's men arrive to clear out the older wards. And remember - Orphan's Hollow will always be here if you need guidance.",
            is_final: true,
            effects: [
                {
                    type: "add_gold",
                    amount: 5
                },
                {
                    type: "unlock_location",
                    locationId: "rustmarket"
                }
            ]
        }
    ]
} 