import { startBattle, createRandomMembers,createHero } from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import { updateStatsDisplay, updateSkillBar,loadSkills, renderMember} from './Render.js';

document.getElementById("heroTab").addEventListener("click", switchToHeroTab);

document.addEventListener('DOMContentLoaded', () => {
    fetchClassesAndInitializeTeams();
});
export let isPaused = false;
export let team1;
export let hero;


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
    fetch('Data/classes.json')
        .then(response => response.json())
        .then(classes => {
            team1 = new Team('Team1', 'team1-members');

            const team1Members = createHero('team1', classes,team1,team2,1);
            hero = team1Members[0];
            initializeTeamMembers(team1Members,'team1')

            team1.addMembers(team1Members);
            updateSkillBar(team1Members[0]);
            document.getElementById('start-button').addEventListener('click', () => startBattle(team1,team2));
        });
     fetch('Data/mobs.json')
            .then(response => response.json())
            .then(classes => {
                var team2 = new Team('Team2', 'team2-members');
                const team2Members = createRandomMembers('team2', classes,team2,team1,4);

                initializeTeamMembers(team2Members,'team2')
                team2.addMembers(team2Members);
            });


}


function initializeTeamMembers(members, containerId) {
    const container = document.getElementById(containerId);
    members.forEach(member => {
        container.appendChild(renderMember(member));
    });
    members.forEach(member => {
        member.initializeDOMElements(); // Call initializeDOMElements after team members are added to the DOM
    });
}
function switchToHeroTab() {
  updateStatsDisplay(team1.members[0]);
  loadSkills(team1.members[0]);
}