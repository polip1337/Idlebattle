import Member from './Member.js';
import {battleLog, evolutionService, hero, isPaused, loadNextStage, reLoadStage, team1, team2, battleStatistics} from './initialize.js';
import Hero from './Hero.js';
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';

let battleStarted = false;
let battleInterval = null;
let isFleeOnCooldown = false;
const FLEE_COOLDOWN_SECONDS = 10;

function startBattle(team1, team2, poiName = null) {
    battleLog.log("Battle started");
    battleStarted = true;
    // Reset flee button state
    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = false;
        fleeButton.textContent = "Flee";
    }
    isFleeOnCooldown = false;


    useSkillsForAllMembers(team2);

    hero.triggerRepeatSkills();
    if (battleInterval) {
        clearInterval(battleInterval);
    }
    battleInterval = setInterval(() => {
        if (isPaused || !battleStarted) return;

        team1.members.forEach(member => member.handleRegeneration());
        team2.members.forEach(member => member.handleRegeneration());

        const team1Alive = team1.members.some(member => member.currentHealth > 0);
        const team2Alive = team2.members.some(member => member.currentHealth > 0);
        if (!team1Alive || !team2Alive) {
            clearInterval(battleInterval);
            battleStarted = false;
            if (!team1Alive) {
                showPopup("Loss!", "Your team has been defeated.");
            } else {
                let totalGoldDropped = 0;
                team2.members.forEach(mob => {
                    // Check if mob is one of the originally spawned members and is now dead
                    // This check avoids giving gold for revived/summoned units multiple times
                    // or units that weren't "defeated" in the traditional sense.
                    // For simplicity, we assume all members in team2 at start are defeatable for gold.
                    if (mob.currentHealth <= 0 && mob.goldDrop > 0) {
                        totalGoldDropped += mob.goldDrop;
                    }
                });
                if (totalGoldDropped > 0) {
                    hero.addGold(totalGoldDropped);
                    battleLog.log(`Collected ${totalGoldDropped} gold!`);
                    battleStatistics.addGoldCollected(totalGoldDropped);
                }
                showPopup("Victory!", "Your team has defeated the opposing team.");
                questSystem.updateQuestProgress('combatComplete', poiName);
            }
            stopBattle(team1, team2, false); // Don't try to open map here, popup handles it
            evolutionService.checkClassAvailability();
            if (document.getElementById('repeat').checked) {
                setTimeout(() => {
                    repeatStage();
                }, 1000);
            }
        }

    }, 1000); // Adjust the interval as needed
}

function stopBattle(team1, team2, fled = false) {
    battleStarted = false;
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
    var activeSkills = team1.members[0].skills.filter(skill => skill.type == "active");
    activeSkills.forEach(skill => {
        skill.heroStopSkill();
    });
    team2.members.forEach(member => {
        member.stopSkills();
    });
    if (fled) {
        // If fled, directly go to map, bypassing the popup
        hidePopup();
        openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
    }
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

export function returnToMap() {
    hidePopup();
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

export function attemptFlee() {
    if (!battleStarted) {
        battleLog.log("Cannot flee, battle not active.");
        return;
    }
    if (isFleeOnCooldown) {
        battleLog.log("Flee is on cooldown.");
        return;
    }

    const fleeButton = document.getElementById('flee-battle');
    fleeButton.disabled = true;
    isFleeOnCooldown = true;

    // Calculate flee chance
    let heroDex = hero.stats.dexterity || 0;
    let avgEnemyDex = 0;
    const aliveEnemies = team2.getAllAliveMembers();
    if (aliveEnemies.length > 0) {
        avgEnemyDex = aliveEnemies.reduce((sum, enemy) => sum + (enemy.stats.dexterity || 0), 0) / aliveEnemies.length;
    }
    // Base 50% chance, +1% per 5 hero dex, -1% per 5 avg enemy dex
    let fleeChance = 50 + Math.floor(heroDex / 5) - Math.floor(avgEnemyDex / 5);
    fleeChance = Math.max(10, Math.min(90, fleeChance)); // Clamp between 10% and 90%

    const randomRoll = Math.random() * 100;

    if (randomRoll < fleeChance) {
        battleLog.log(`Successfully fled from battle! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
        battleStatistics.addSuccessfulFlee();
        stopBattle(team1, team2, true); // true indicates fled
        // Cooldown visual update handled by re-enabling button after timeout
    } else {
        battleLog.log(`Failed to flee! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
        // Optionally, enemies could get a free turn here, or player turn skipped.
        // For simplicity, just log and apply cooldown.
    }

    let cooldownTimeLeft = FLEE_COOLDOWN_SECONDS;
    fleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;
    const cooldownInterval = setInterval(() => {
        cooldownTimeLeft--;
        fleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;
        if (cooldownTimeLeft <= 0) {
            clearInterval(cooldownInterval);
            fleeButton.disabled = false;
            isFleeOnCooldown = false;
            fleeButton.textContent = "Flee";
        }
    }, 1000);
}


export {startBattle, hidePopup, battleStarted, repeatStage, nextStage};