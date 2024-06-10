import { startBattle, createRandomMembers } from './Battle.js';
import Team from './Team.js';

document.addEventListener('DOMContentLoaded', () => {
    fetchClassesAndInitializeTeams();
});
export let isPaused = false;

// Function to toggle the pause state
function togglePause() {
    isPaused = !isPaused;
    console.log(isPaused ? "Battle Paused" : "Battle Resumed");
}

// Event listener for the spacebar to toggle pause
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        togglePause();
    }
});

function fetchClassesAndInitializeTeams() {
    fetch('classes.json')
        .then(response => response.json())
        .then(classes => {
            var team1 = new Team('Team1', 'team1-members');
            var team2 = new Team('Team2', 'team2-members');

            const team1Members = createRandomMembers('team1', classes,team1,team2);
            const team2Members = createRandomMembers('team2', classes,team2,team1);

            initializeTeamMembers(team1Members,'team1')
            initializeTeamMembers(team2Members,'team2')

            team1.addMembers(team1Members);
            team2.addMembers(team2Members);




            document.getElementById('start-button').addEventListener('click', () => startBattle(team1,team2));
        });
}

function initializeTeamMembers(members, containerId) {
    const container = document.getElementById(containerId);
    members.forEach(member => {
        container.innerHTML += `
            <div class="member" id="${member.memberId}">
                <div class="health-bar"></div>
                <div class="mana-bar"></div>
                <div class="attack-bar"></div>
                <div class="status">Status: Ready</div>
                <div class="stats"></div>
            </div>
        `;
    });
    members.forEach(member => {
        member.initializeDOMElements(); // Call initializeDOMElements after team members are added to the DOM
    });
}
