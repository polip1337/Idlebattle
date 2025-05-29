export default {
    nodes: [
        {
            id: "start",
            text: "The figure's voice drops to a whisper, their hood swaying as they glance around. 'The fog... it's not just a barrier. It's a prison. And a guardian.' They clutch the bone whisper close, its faint hum seeming to guide their words. 'The Loomkeepers didn't just seal Hollowreach away—they sealed something in with it. Something that... changed. Adapted.'",
            options: [
                {
                    text: "What do you mean, adapted?",
                    nextId: "explain_adaptation"
                }
            ]
        },
        {
            id: "explain_adaptation",
            text: "'The fog learned,' the figure hisses. 'It watched the Loomkeepers' magic, studied their patterns. Now it doesn't just block the way—it tests those who try to pass. It... judges.' Their gloved hand traced patterns in the air. 'The scavengers, they've found ways to work with it. To use it. But they don't understand what they're playing with.'",
            options: [
                {
                    text: "What happens if they succeed?",
                    nextId: "warning"
                }
            ]
        },
        {
            id: "warning",
            text: "The figure's voice grows urgent. 'If they break the seal, if they let what's inside out...' They shake their head. 'The fog will spread. Not just here—everywhere. And it won't be a barrier anymore. It'll be a weapon.' They pressed the bone whisper to their chest. 'You need to stop them. Before they learn too much.'",
            options: [
                {
                    text: "I'll stop them.",
                    nextId: "final_advice",
                    action: [
                        { type: "startQuest", questId: "fogscarHeist" }
                    ]
                }
            ]
        },
        {
            id: "final_advice",
            text: "'Good. The [Scavenger Redoubt|scavengerRedoubt|Their hideout in the sewers] is where they keep their secrets. Find their leader—they call him the Fogscar. He's the one who's been studying the fog.' The figure's hood dipped. 'And be careful. The fog... it's watching you now too.'",
            options: [
                {
                    text: "I understand.",
                    nextId: null
                }
            ]
        }
    ]
}; 