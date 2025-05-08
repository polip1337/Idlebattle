import Member from './Member.js';
import {battleLog, evolutionService, hero, isPaused, loadNextStage, reLoadStage, team1, team2} from './initialize.js';
import Hero from './Hero.js';
import { questSystem } from './questSystem.js';

let battleStarted = false;

function startBattle(team1, team2) {
    battleLog.log("Battle started");
    battleStarted = true;
    useSkillsForAllMembers(team2);

    hero.triggerRepeatSkills();
    const battleInterval = setInterval(() => {
        if (isPaused) return;

        team1.members.forEach(member => member.handleRegeneration());
        team2.members.forEach(member => member.handleRegeneration());

        const team1Alive = team1.members.some(member => member.currentHealth > 0);
        const team2Alive = team2.members.some(member => member.currentHealth > 0);
        if (!team1Alive || !team2Alive) {
            clearInterval(battleInterval);
            if (!team1Alive) {
                showPopup("Loss!", "Your team has been defeated.");
            } else {
                showPopup("Victory!", "Your team has defeated the opposing team.");
                questSystem.updateQuestProgress('combatComplete', { poiName: poi.name });

            }
            stopBattle(team1, team2);
            evolutionService.checkClassAvailability();
            if (document.getElementById('repeat').checked) {
                setTimeout(() => {
                    repeatStage();
                }, 1000);
            }
        }

    }, 1000); // Adjust the interval as needed
}

function stopBattle(team1, team2) {
    var activeSkills = team1.members[0].skills.filter(skill => skill.type == "active");
    activeSkills.forEach(skill => {
        skill.heroStopSkill();
    });
    team2.members.forEach(member => {
        member.stopSkills();
    });
}

function useSkillsForAllMembers(team) {
    team.members.forEach(member => {
        member.skills.forEach(skill => {
            skill.useSkill(member);
        });
    });

}

function showPopup(title, message) {
    const popup = document.getElementById('popup');
    const titleDiv = document.getElementById('popupTitle');
    const messageDiv = document.getElementById('popupText');
    titleDiv.textContent = title;
    messageDiv.textContent = message;
    popup.classList.remove('hidden');
}

// Method to hide the victory popup
function hidePopup() {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
}

function repeatStage() {
    hidePopup();
    reLoadStage();
    startBattle(team1, team2);
}

function nextStage() {
    hidePopup();
    loadNextStage();
    startBattle(team1, team2)
}

export {startBattle, hidePopup, battleStarted, repeatStage, nextStage};
