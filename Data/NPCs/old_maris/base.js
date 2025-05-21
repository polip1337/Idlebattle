export default {
    nodes: [
        {
            id: "start",
            npcId: "orphanage_mistress",
            text: "I'm afraid I have difficult news. The city council has cut our funding again. We can no longer support our older wards. You've reached the age where you must make your own way in the world. The Orphan's Hollow has always been a sanctuary, but even our crumbling walls can't protect you forever.",
            options: [
                {
                    text: "But where will I go?",
                    nextId: "guidance"
                },
                {
                    text: "I understand.",
                    nextId: "farewell_gift"
                }
            ]
        },
        {
            id: "guidance",
            text: "Rustmarket is always looking for able hands. Your old friend Renn 'Quickfingers' might have some work for you - though be careful with his schemes. The city may seem daunting, but you've been preparing for this day. Remember what you've learned about the factions: the Loomkeepers with their magical tapestries, the Driftkin in their fog-resistant barges, the Pulsefinders and their fog-worship, and the Emberclad with their fire rituals. Choose your path carefully, Taryn.",
            nextId: "farewell_gift"
        },
        {
            id: "farewell_gift",
            text: "Here. Take these 5 gold pieces. It's not much, but it should help you get started. Remember what I've taught you - stay away from the fog, keep your wits about you, and trust your instincts. The factions will try to recruit you, but choose your path carefully. And watch out for Selka Ironjaw - she's become a Driftkin enforcer and still holds that grudge from your orphanage days.",
            options: [
                {
                    text: "Thank you for everything, Mistress.",
                    nextId: "final_words"
                }
            ]
        },
        {
            id: "final_words",
            text: "You've grown into a fine young person, Taryn. I'm proud of you. Now go, before the council's men arrive to clear out the older wards. And remember - Orphan's Hollow will always be here if you need guidance. The city may be fractured, but you have friends here: Gavix 'The Tinker' is still obsessed with his fog-powered gadgets, and Old Maris wanders as a healer now. They might help you find your way.",
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
}; 