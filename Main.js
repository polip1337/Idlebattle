import { startBattle, createRandomMembers,createHero, hidePopup, createMembers } from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import Area from './Area.js';
import BattleLog from './BattleLog.js';
import { updateStatsDisplay, updateSkillBar,loadSkills, renderMember,loadPassiveSkills, updateMana,updateStamina,updateHealth, renderLevelUp, renderHero, updateLevelProgress, openEvolutionModal} from './Render.js';
import BattleStatistics from './BattleStatistics.js';

export let battleStatistics = new BattleStatistics();
export let isPaused = false;
export let team1 = new Team('Team1', 'team1-members');;
export let team2 = new Team('Team2', 'team2-members');;
export let hero;
export let battleLog;

battleStatistics.updateBattleStatistics();

window.onload = function() {
    const modal = document.getElementById('evolution-modal');
    const closeButton = document.getElementsByClassName('close-button')[0];

    window.onclick = function(event) {
        if (event.target === modal) {
            closeEvolutionModal();
        }
    }
}
document.getElementById('close-popup').addEventListener('click', hidePopup);
updateLevelProgress(0, 100, "Novice");
let currentArea = new Area("Data/Areas/goblinPlains.JSON");
let mobsData = null;
let currentStage = 1;
let clickTimeout;
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
     document.getElementById("skill"+i).getElementsByTagName('img')[0].addEventListener('click', (event) => {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
          if(!event.target.parentNode.classList.contains("disabled")){
            hero.useSkill(document.getElementById("skill"+i));
          }
          let repeat = hero.getSkill(document.getElementById("skill"+i)).repeat;
          hero.getSkill(document.getElementById("skill"+i)).repeat = !repeat;// Toggle the repeat property
          event.target.parentNode.classList.toggle("rainbow");
        } else {
          clickTimeout = setTimeout(() => {
            hero.useSkill(document.getElementById("skill"+i));
            clickTimeout = null;
          }, 300); // Adjust the delay as needed
        }
      });

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
                mobsData = classes;
                loadStage(currentStage);
            });


}

function selectInitialSkills() {
    for (let i = 0; i < 4; i++) {
        hero.selectSkill(team1.members[0].skills[i], document.querySelectorAll("#activeSkills .skill-box")[i]);
    };
    for (let i = 4; i < 8; i++) {
        hero.selectSkill(team1.members[0].skills[i], document.querySelectorAll("#passiveSkills .skill-box")[i-4],true);
    };
}
function initializeTeamMembers(members, containerId) {
    const teamRows = teamContainer.querySelectorAll("#" + containerId +' .team-row');
    teamRows[0].innerHTML = '';
    teamRows[1].innerHTML = '';
    members.forEach(member => {
        var row = member.position == "Front" ? teamRows[0] : teamRows[1];
        let rowChildren = Array.from(row.children);

                if (rowChildren.length >= 4) {
                    // Select the other row to add the member
                    row = row === teamRows[0] ? teamRows[1] : teamRows[0];
                }
        if(member.name == "Hero"){
                row.appendChild(renderHero(member));
        }else{
                row.appendChild(renderMember(member));
        }

        member.initializeDOMElements(); // Call initializeDOMElements after team members are added to the DOM
        updateMana(member);
        updateStamina(member);
        updateHealth(member);
    });

}
function loadStage(stageNumber) {
    currentArea.stageNumber = stageNumber;
    team2.clearMembers();

    const team2Members = createMembers('team2', mobsData,team2,team1,currentArea.spawnMobs());

    initializeTeamMembers(team2Members,'team2');

    team2.addMembers(team2Members);
}

document.addEventListener('DOMContentLoaded', () => {
  const maxStage = 10; // Adjust according to your game's maximum stage
  const minStage = 1; // Adjust according to your game's minimum stage

  const currentStageSpan = document.getElementById('current-stage');
  const decreaseStageButton = document.getElementById('decrease-stage');
  const increaseStageButton = document.getElementById('increase-stage');

  function updateStageDisplay() {
    currentStageSpan.textContent = `Stage ${currentStage}`;
  }

  decreaseStageButton.addEventListener('click', () => {
    if (currentStage > minStage) {
      currentStage--;
      updateStageDisplay();
      // Call function to handle mob spawning for the new stage
      loadStage(currentStage);
    }
  });

  increaseStageButton.addEventListener('click', () => {
    if (currentStage < maxStage) {
      currentStage++;
      updateStageDisplay();
      // Call function to handle mob spawning for the new stage
      loadStage(currentStage);
    }
  });


                  updateStageDisplay();

  // Initial load

});

