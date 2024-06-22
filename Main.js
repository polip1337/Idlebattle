import { startBattle, createRandomMembers,createHero } from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import BattleLog from './BattleLog.js';
import { updateStatsDisplay, updateSkillBar,loadSkills, renderMember} from './Render.js';

export let isPaused = false;
export let team1;
export let hero;
export let battleLog;

document.getElementById("heroTab").addEventListener("click", switchToHeroTab);

document.addEventListener('DOMContentLoaded', () => {
    fetchClassesAndInitializeTeams();
    const logContainer = document.getElementById('battle-log');
    battleLog = new BattleLog(logContainer);

    // Example usage of battleLog

    const toggleLogButton = document.getElementById('toggle-log');
    let logVisible = true;

    toggleLogButton.addEventListener('click', () => {
        logVisible = !logVisible;
        logContainer.style.display = logVisible ? 'flex' : 'none';
        toggleLogButton.textContent = logVisible ? 'Hide Log' : 'Show Log';
    });
});



// Function to toggle the pause state
function togglePause() {
    isPaused = !isPaused;
    battleLog.log(isPaused ? "Battle Paused" : "Battle Resumed");
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

            //const team1Members = createHero('team1', classes,team1,team2,8);
                const team1Members = createRandomMembers('team2', classes,team2,team1,8);

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
                const team2Members = createRandomMembers('team2', classes,team2,team1,8);

                initializeTeamMembers(team2Members,'team2')
                team2.addMembers(team2Members);
            });


}


function initializeTeamMembers(members, containerId) {
    const teamRows = teamContainer.querySelectorAll("#" + containerId +' .team-row');
    members.forEach(member => {
        const firstRow = teamRows[0].children.length < 4 ? teamRows[0] : teamRows[1];
        firstRow.appendChild(renderMember(member));
        //member.initializeDOMElements(); // Call initializeDOMElements after team members are added to the DOM
    });

}
function switchToHeroTab() {
  updateStatsDisplay(team1.members[0]);
  loadSkills(team1.members[0]);
}