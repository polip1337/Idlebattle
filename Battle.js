import Member from './Member.js';
import {battleLog, evolutionService, hero, isPaused, loadNextStage, reLoadStage, team1, team2} from './initialize.js';
import Hero from './Hero.js';

let battleStarted = false;
const delay = ms => new Promise(res => setTimeout(res, ms));

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

function createMembers(prefix, classes, team, opposingTeam, mobs) {
    return mobs.map((mob, index) => {
        const className = mob.type;
        let position = null;
        if (classes[className].positions[0].includes("Front")) {
            position = "Front";
        } else {
            position = "Back";
        }
        return new Member(classes[className].name, className, classes[className], `${prefix.toLowerCase()}-member${index}`, team, opposingTeam, position, mob.level);
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

function createHero(prefix, classes, team, opposingTeam) {
    const classKeys = Object.keys(classes);
    return Array.from({length: 1}, (_, i) => {
        const randomClass = classKeys[Math.floor(Math.random() * classKeys.length)];
        return new Hero("Hero", 'Novice', classes['Novice'], `${prefix.toLowerCase()}-member${i}`, team, opposingTeam);
    });
}

export {startBattle, createHero, hidePopup, createMembers, battleStarted, repeatStage, nextStage};
