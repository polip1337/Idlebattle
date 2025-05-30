export default {
    nodes: [
        {
            id: "start",
            npcId: "old_maris",
            text: "Taryn, sit with me. The council's cut our funds again, those greedy fools. Orphan's Hollow can't keep you now—you're sixteen, old enough to face Hollowreach on your own. This place has been your home, but the city won't care. You'll need to find your way, and fast.",
            options: [
                {
                    text: "Leave? Maris, where do I even start?",
                    nextId: "guidance"
                },
                {
                    text: "I knew this day was coming. I'll figure it out.",
                    nextId: "farewell_gift"
                },
                {
                    text: "I found some food supplies you might need.",
                    nextId: "cache_return",
                    conditions: [{ type: 'item', itemId: 'foodSupplies' }],
                    hideWhenUnavailable: true,
                    action: [
                        { type: "openDialogue", npcId: "old_maris", dialogueId: "old_maris_cache_return" }
                    ]
                }
            ]
        },
        {
            id: "guidance",
            text: "Hollowreach is rough, Taryn. Rustmarket's your best bet—plenty of work there if you're clever. Renn 'Quickfingers' is around, making deals and dodging trouble. The factions will notice you: Loomkeepers with their tapestries, Driftkin on their barges, Pulsefinders lost in fog-worship, Emberclad burning everything they don't trust. Choose carefully. They all want something.",
            options: [
                {
                    text: "Renn? Can I still trust her?",
                    nextId: "renn_advice"
                },
                {
                    text: "What do I need to know to survive out there?",
                    nextId: "survival_advice"
                }
            ]
        },
        {
            id: "renn_advice",
            text: "Renn hasn't changed much—same sly grin, same knack for trouble. She's in Rustmarket, offering jobs that sound too good. She'll help if you pay, but watch out for Selka Ironjaw. She's a Driftkin enforcer now, still mad about those old orphanage fights. Don't let Renn pull you into anything stupid.",
            nextId: "farewell_gift"
        },
        {
            id: "survival_advice",
            text: "The city's dangerous, Taryn. The fog's worst—it gets in your head, makes you see things. Stay off Ironspire Bridge after dark. Driftkin sell fog-wards, but they're no good. Find Gavix 'The Tinker' if you need tools—his gadgets might help. And keep my herbs on you. They'll ease the city's sting.",
            nextId: "farewell_gift"
        },
        {
            id: "farewell_gift",
            text: "Take these, Taryn—five gold pieces, all we could spare. They'll get you food or a knife in Rustmarket, maybe both if you bargain well. Selka's still holding that grudge, and the factions will try to pull you in. Trust what I taught you: question everything, and don't be fooled by promises.",
            options: [
                {
                    text: "Thank you, Maris. I won't let you down.",
                    nextId: "final_words"
                }
            ]
        },
        {
            id: "final_words",
            text: "You've grown strong, Taryn, stronger than that kid who swiped my bread years ago. I'm proud of you. The council's men are coming to clear out the older wards—get moving before they show up. Orphan's Hollow will be here if you need it. Look for Gavix in Rustmarket; his contraptions could keep you alive. And if you see Tharok One-Eye on Ironspire Bridge, listen to his stories. There's truth in them. Go now, and don't look back.",
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