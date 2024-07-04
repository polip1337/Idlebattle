import { startBattle, createHero, hidePopup, createMembers,repeatStage, nextStage } from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import Member from './Member.js';
import Area from './Area.js';
import Skill from './Skill.js';
import BattleLog from './BattleLog.js';
import { updateStatsDisplay, updateSkillBar,renderSkills, renderMember,
renderPassiveSkills, updateMana,updateStamina,updateHealth, renderLevelUp,
renderHero, updateLevelProgress, openEvolutionModal, deepCopy, showTooltip} from './Render.js';
import BattleStatistics from './BattleStatistics.js';
import {openTab} from './navigation.js';

export let battleStatistics = new BattleStatistics();
export let isPaused = false;
export let team1 = new Team('Team1', 'team1-members');;
export let team2 = new Team('Team2', 'team2-members');;
export let hero;
export let battleLog;
export let classTiers;
export let heroClasses;

updateLevelProgress(0, 100, "Novice");
let currentArea = new Area("Data/Areas/goblinPlains.JSON");
export let mobsClasses = null;
let currentStage = 1;
let clickTimeout;

battleStatistics.updateBattleStatistics();



async function loadJSON(url) {
    const response = await fetch(url);
    return response.json();
}

async function loadEffects() {
    const data = await loadJSON('Data/effects.json');

    return data;
}

async function loadSkills(effects,path) {
    const data = await loadJSON(path);
    const skills = {};

    Object.keys(data).forEach(skillKey => {
        const skill = data[skillKey];

        if (skill.effects && skill.effects[0].id) {
            const effect = effects[skill.effects[0].id];
            if (effect) {
                skill.effects = Object.assign(deepCopy(effect), deepCopy(skill.effects[0]));
            }
        }

        skills[skillKey] = new Skill(skill, skill.effects);
    });

    return skills;
}

async function loadMobs(skills) {
    const mobsData = await loadJSON('Data/mobs.json');
    const classes = {};
    for (const key in mobsData) {
        const mob = mobsData[key];
        const classSkills = mob.skills.map(skillId => skills[skillId]);
        classes[mob.id] = new Member(mob.name,mob, classSkills);
    }
    return classes;
}
async function loadClasses(skills) {
    var classesData = await loadJSON('Data/classes.json');
    const classes = {};
    classTiers = classesData['tiers'];
    classesData = classesData['classes'];
    for (const key in classesData) {
        const heroClass = classesData[key];
        const classSkills = heroClass.skills.map(skillId => skills[skillId]);
        classes[heroClass.id] = {...heroClass, skills: classSkills};
    }
    return classes;
}
async function loadGameData() {

        const effects = await loadEffects();
        let skills = await loadSkills(effects,'Data/skills.json');
        const passiveSkills = await loadSkills(effects,'Data/passives.json');
        skills = {...skills, ...passiveSkills};
        mobsClasses = await loadMobs(skills);
        heroClasses = await loadClasses(skills);

        initiateBattleLog();
        createAndInitHero(heroClasses,team1,team2);
        loadStage(currentStage,mobsClasses);
        initiateEventListeners();

}


function createAndInitHero(classes, team,opposingTeam){
    hero = new Hero("Hero", classes['novice'], classes['novice'].skills,1, team, opposingTeam);
    team1.addMember(hero);

    renderTeamMembers(team1.members,'team1')

    renderSkills(team1.members[0]);
    renderPassiveSkills(team1.members[0]);
    selectInitialSkills();

    return hero;
}
function loadStage(stageNumber,mobs) {
    currentArea.stageNumber = stageNumber;
    team2.clearMembers();
    let memberIndex = 0;
    var team2Members = [];
    currentArea.spawnMobs(mobs, team2).forEach(member => {
        member.initialize(team1,team2,memberIndex);
        memberIndex++;
        team2Members.push(member);
    })
    renderTeamMembers(team2Members,'team2');

    team2.addMembers(team2Members);
}
export function reLoadStage() {
    loadStage(currentArea.stageNumber,mobsClasses);
}
function selectInitialSkills() {
    for (let i = 0; i < 4; i++) {
        hero.selectSkill(team1.members[0].skills[i], document.querySelectorAll("#activeSkills .skill-box")[i]);
    };
    for (let i = 4; i < 8; i++) {
        hero.selectSkill(team1.members[0].skills[i], document.querySelectorAll("#passiveSkills .skill-box")[i-4],true);
    };
}

function initiateBattleLog() {
    const logContainer = document.getElementById('battle-log');
    battleLog = new BattleLog(logContainer);

    const toggleLogButton = document.getElementById('toggle-log');
    let logVisible = true;

    toggleLogButton.addEventListener('click', () => {
        logVisible = !logVisible;
        logContainer.style.display = logVisible ? 'flex' : 'none';
        toggleLogButton.textContent = logVisible ? 'Hide Log' : 'Show Log';
    });

}

export function renderTeamMembers(members, containerId, clear = true) {
    const teamRows = teamContainer.querySelectorAll("#" + containerId +' .team-row');
    if (clear){
    teamRows[0].innerHTML = '';
        teamRows[1].innerHTML = '';
    }

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
function initiateEventListeners() {
    document.getElementById('team2-overlay').addEventListener('click', () => {
        document.getElementById('team2-overlay').classList.add('hidden');
        document.getElementById('teamAndBattleContainer').style = 'opacity: 1'
        startBattle(team1,team2);
    });
    document.getElementById('battlefieldNavButton').addEventListener('click', () => openTab(event, 'battlefield'));
    document.getElementById('heroContentNavButton').addEventListener('click', () => openTab(event, 'heroContent'));
    document.getElementById('mapNavButton').addEventListener('click', () => openTab(event, 'map'));
    document.getElementById('libraryNavButton').addEventListener('click', () => openTab(event, 'library'));
    document.getElementById('optionsNavButton').addEventListener('click', () => openTab(event, 'options'));
    document.getElementById('battle-statisticsNavButton').addEventListener('click', () => openTab(event, 'battle-statistics'));
    document.getElementById('evolveNavButton').addEventListener('click', () => openEvolutionModal(hero));

    document.getElementById('repeat-popup').addEventListener('click', () => repeatStage());
    document.getElementById('nextStage-popup').addEventListener('click', () => nextStage());

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            togglePause();
        }
    });
    const elementsWithTooltips = document.querySelectorAll('.memberPortrait');
        elementsWithTooltips.forEach(element => {
            element.addEventListener('mouseenter', (event) => {
                const content = element.querySelector('.tooltip'); // Assuming the tooltip content is stored in a data attribute
                showTooltip(event, content);
            });
            //element.addEventListener('mouseleave', hideTooltip);
        });
    setupSkillListeners();
}
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
            if(!event.target.parentNode.classList.contains("disabled")){
                hero.useSkill(document.getElementById("skill"+i));
                clickTimeout = null;
            }
          }, 300); // Adjust the delay as needed
        }
      });

    }
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
      loadStage(currentStage,mobsClasses);
    }
  });

  increaseStageButton.addEventListener('click', () => {
    loadNextStage(currentStage);
  });
  updateStageDisplay();
});
export function loadNextStage() {
    if (currentStage < 10) {
        currentArea.stageNumber = currentStage +1;
        document.getElementById('current-stage').textContent = `Stage ${currentStage}`;
        loadStage(currentArea.stageNumber,mobsClasses);
    }
}
function togglePause() {
    isPaused = !isPaused;
    battleLog.log(isPaused ? "Battle Paused" : "Battle Resumed");
}
loadGameData();
