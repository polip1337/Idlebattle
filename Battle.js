import Member from './Member.js';
import Team from './Team.js';
import { isPaused } from './Main.js';
import EffectClass from './EffectClass.js';
import Hero from './Hero.js';
import {battleStatistics} from './Main.js';

import { updateHealth, updateMana } from './Render.js';

function startBattle(team1, team2) {
    useSkillsForAllMembers(team2);

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

            }
        }

    }, 1000); // Adjust the interval as needed
}
function useSkillsForAllMembers(team) {
    team.members.forEach(member => {
        member.skills.forEach(skill => {
            skill.useSkill(member);
        });
    });
}
function createRandomMembers(prefix, classes,team, opposingTeam,size) {
    const classKeys = Object.keys(classes);
    return Array.from({ length: size }, (_, i) => {
        const randomClass = classKeys[Math.floor(Math.random() * classKeys.length)];
        let position = null;
        if (i<4){
            position = "Front";
        }else{
            position = "Back";}
        return new Member(classes[randomClass].name, randomClass, classes[randomClass], `${prefix.toLowerCase()}-member${i}`, team,opposingTeam,position);
    });
}
function showPopup(title,message) {
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
function createHero(prefix, classes,team, opposingTeam) {
    const classKeys = Object.keys(classes);
    return Array.from({ length: 1 }, (_, i) => {
        const randomClass = classKeys[Math.floor(Math.random() * classKeys.length)];
        return new Hero("Hero", 'Novice', classes['Novice'], `${prefix.toLowerCase()}-member${i}`, team,opposingTeam);
    });
}
function handleDeath(target, opposingTeam)
    {
         target.currentHealth = 0;
         updateHealth(target);
         updateStatus(target,'Defeated');

         opposingTeam.members.forEach(team2Member => {
             if (team2Member.currentHealth > 0) {
                 team2Member.gainExperience(50);
             }
         });
     }
export { startBattle, createRandomMembers,createHero,hidePopup };
