import { startBattle, createRandomMembers,createHero } from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import BattleLog from './BattleLog.js';
import { updateStatsDisplay, updateSkillBar,loadSkills, renderMember,loadPassiveSkills} from './Render.js';

export let isPaused = false;
export let team1 = new Team('Team1', 'team1-members');;
export let team2 = new Team('Team2', 'team2-members');;
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
    setupSkillListeners();
});

function setupSkillListeners(){
    for(let i = 1; i<13; i++){
         document.getElementById("skill"+i).getElementsByTagName('img')[0].addEventListener('click', () => hero.useSkill(document.getElementById("skill"+i)));
    }
}

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

            const team1Members = createHero('team1', classes,team1,team2);

            hero = team1Members[0];
            initializeTeamMembers(team1Members,'team1')

            team1.addMembers(team1Members);
            document.getElementById('start-button').addEventListener('click', () => startBattle(team1,team2));
            loadSkills(team1.members[0]);
            loadPassiveSkills(team1.members[0]);
            selectInitialSkills();
        });
     fetch('Data/mobs.json')
            .then(response => response.json())
            .then(classes => {
                const team2Members = createRandomMembers('team2', classes,team2,team1,8);

                initializeTeamMembers(team2Members,'team2')
                team2.addMembers(team2Members);
            });


}

function selectInitialSkills() {
    for (let i = 0; i < 4; i++) {
        hero.selectSkill(team1.members[0].skills[i], document.querySelectorAll("#activeSkills .skill-box")[i]);
    };
    for (let i = 10; i < 14; i++) {
        hero.selectPassiveSkill(team1.members[0].skills[i], document.querySelectorAll("#passiveSkills .skill-box")[i-10]);
    };
}
function initializeTeamMembers(members, containerId) {
    const teamRows = teamContainer.querySelectorAll("#" + containerId +' .team-row');
    members.forEach(member => {
        const firstRow = teamRows[0].children.length < 4 ? teamRows[0] : teamRows[1];
        firstRow.appendChild(renderMember(member));

        member.initializeDOMElements(); // Call initializeDOMElements after team members are added to the DOM

    });

}
function switchToHeroTab() {
  updateStatsDisplay(team1.members[0]);
}