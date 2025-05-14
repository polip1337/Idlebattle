import Member from './Member.js';
import {battleLog, evolutionService, hero, isPaused, loadNextStage, reLoadStage, team1, team2, battleStatistics} from './initialize.js';
import Hero from './Hero.js'; // Assuming Hero might be used for type checks or specific hero logic
import { questSystem } from './questSystem.js';
import { openTab } from './navigation.js';

let battleStarted = false;
let battleInterval = null;
let isFleeOnCooldown = false;
const FLEE_COOLDOWN_SECONDS = 10;
let currentPoiName = null; // To store poiName for the current battle

// --- Battle Initialization and State ---

function resetFleeButtonState() {
    const fleeButton = document.getElementById('flee-battle');
    if (fleeButton) {
        fleeButton.disabled = false;
        fleeButton.textContent = "Flee";
    }
    isFleeOnCooldown = false; // Reset cooldown state flag
}

function initializeBattle(poiName = null) {
    battleLog.log("Battle started");
    battleStarted = true;
    currentPoiName = poiName;
    resetFleeButtonState();
}

// --- Core Battle Loop ---

function gameTick() {
    if (isPaused || !battleStarted) return;

    team1.members.forEach(member => member.handleRegeneration());
    team2.members.forEach(member => member.handleRegeneration());

    checkBattleOutcome();
}

function checkBattleOutcome() {
    const team1Alive = team1.members.some(member => member.currentHealth > 0);
    const team2Alive = team2.members.some(member => member.currentHealth > 0);

    if (!team1Alive || !team2Alive) {
        clearInterval(battleInterval);
        battleInterval = null; // Clear interval ID
        battleStarted = false;

        if (!team1Alive) {
            handleBattleLoss();
        } else {
            handleBattleWin();
        }
        // Common post-battle actions (excluding flee navigation)
        stopAllSkills(team1, team2);
        evolutionService.checkClassAvailability();
        checkAndHandleRepeatStage();
    }
}

// --- Battle Outcome Handling ---

function calculateGoldDrop() {
    let totalGoldDropped = 0;
    team2.members.forEach(mob => {
        if (mob.currentHealth <= 0 && mob.goldDrop > 0) {
            totalGoldDropped += mob.goldDrop;
        }
    });
    return totalGoldDropped;
}

function handleBattleWin() {
    const totalGoldDropped = calculateGoldDrop();
    if (totalGoldDropped > 0) {
        hero.addGold(totalGoldDropped);
        battleLog.log(`Collected ${totalGoldDropped} gold!`);
        battleStatistics.addGoldCollected(totalGoldDropped);
    }
    showPopup("Victory!", "Your team has defeated the opposing team.");
    questSystem.updateQuestProgress('combatComplete', currentPoiName);
}

function handleBattleLoss() {
    showPopup("Loss!", "Your team has been defeated.");
}

function checkAndHandleRepeatStage() {
    const repeatCheckbox = document.getElementById('repeat');
    if (repeatCheckbox && repeatCheckbox.checked) {
        setTimeout(() => {
            repeatStage(); // repeatStage handles popup hiding and restarting
        }, 1000);
    }
}

// --- Skill Management ---

function useTeamSkills(team) {
    team.members.forEach(member => {
        member.skills.forEach(skill => {
            // Assuming skill.useSkill exists and is appropriate here
            // (e.g., for initial buffs or one-time enemy skills at battle start)
            skill.useSkill(member);
        });
    });
}

function stopHeroActiveSkills() {
    // Assumes hero is team1.members[0] or direct hero import is the player character
    // Using imported hero for clarity on whose skills are being stopped if it's always the main player
    if (hero && hero.skills) {
        const activeSkills = hero.skills.filter(skill => skill.type === "active");
        activeSkills.forEach(skill => {
            if (typeof skill.heroStopSkill === 'function') {
                skill.heroStopSkill();
            }
        });
    }
}

function stopTeamMemberSkills(team) {
    team.members.forEach(member => {
        if (typeof member.stopSkills === 'function') {
            member.stopSkills();
        }
    });
}

function stopAllSkills(playerTeam, enemyTeam) {
    stopHeroActiveSkills(); // Specifically for hero's active/toggle skills
    stopTeamMemberSkills(enemyTeam); // Generic skill stop for enemies
    // If playerTeam has other members with skills needing stopping:
    // stopTeamMemberSkills(playerTeam); // (excluding hero if already handled)
}


// --- Flee Mechanism ---

function calculateFleeChance() {
    let heroDex = hero.stats.dexterity || 0;
    let avgEnemyDex = 0;
    const aliveEnemies = team2.getAllAliveMembers();

    if (aliveEnemies.length > 0) {
        avgEnemyDex = aliveEnemies.reduce((sum, enemy) => sum + (enemy.stats.dexterity || 0), 0) / aliveEnemies.length;
    }

    let fleeChance = 50 + Math.floor(heroDex / 5) - Math.floor(avgEnemyDex / 5);
    return Math.max(10, Math.min(90, fleeChance)); // Clamp between 10% and 90%
}

function handleSuccessfulFlee(fleeChance, randomRoll) {
    battleLog.log(`Successfully fled from battle! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
    battleStatistics.addSuccessfulFlee();
    stopBattle(team1, team2, true); // true indicates fled
}

function handleFailedFlee(fleeChance, randomRoll) {
    battleLog.log(`Failed to flee! (Chance: ${fleeChance.toFixed(0)}%, Rolled: ${randomRoll.toFixed(0)})`);
    // Cooldown is managed after the attempt
}

function startFleeCooldownVisuals() {
    const fleeButton = document.getElementById('flee-battle');
    if (!fleeButton) return;

    let cooldownTimeLeft = FLEE_COOLDOWN_SECONDS;
    fleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;

    const cooldownInterval = setInterval(() => {
        cooldownTimeLeft--;
        // Re-fetch button in case it becomes invalid (e.g., UI changes)
        const currentFleeButton = document.getElementById('flee-battle');
        if (currentFleeButton) {
            currentFleeButton.textContent = `Flee (${cooldownTimeLeft}s)`;
        }

        if (cooldownTimeLeft <= 0) {
            clearInterval(cooldownInterval);
            isFleeOnCooldown = false; // Actual cooldown ends
            if (currentFleeButton && battleStarted) { // Only re-enable if battle is still ongoing
                currentFleeButton.disabled = false;
                currentFleeButton.textContent = "Flee";
            } else if (currentFleeButton) { // If battle ended, just reset text
                 currentFleeButton.textContent = "Flee";
            }
        }
    }, 1000);
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
    if (fleeButton) {
        fleeButton.disabled = true;
    }
    isFleeOnCooldown = true; // Mark cooldown active immediately

    const fleeChance = calculateFleeChance();
    const randomRoll = Math.random() * 100;

    if (randomRoll < fleeChance) {
        handleSuccessfulFlee(fleeChance, randomRoll);
        // Cooldown still applies but user navigates away. Visuals might not complete on battle screen.
        // isFleeOnCooldown flag remains true for FLEE_COOLDOWN_SECONDS.
    } else {
        handleFailedFlee(fleeChance, randomRoll);
    }
    startFleeCooldownVisuals(); // Manages button text and re-enables it after cooldown
}


// --- UI Interaction & Navigation ---

function showPopup(title, message) {
    const popup = document.getElementById('popup');
    const titleDiv = document.getElementById('popupTitle');
    const messageDiv = document.getElementById('popupText');
    if (popup && titleDiv && messageDiv) {
        titleDiv.textContent = title;
        messageDiv.textContent = message;
        popup.classList.remove('hidden');
    }
}

function hidePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.classList.add('hidden');
    }
}

export function returnToMap() {
    hidePopup();
    openTab({ currentTarget: document.getElementById('mapNavButton') }, 'map');
}

// --- Main Battle Control Functions ---

function startBattle(currentTeam1, currentTeam2, poiName = null) {
    initializeBattle(poiName);

    useTeamSkills(currentTeam2); // Enemies use initial skills
    if (hero) hero.triggerRepeatSkills(); // Hero triggers their passive/repeat skills

    if (battleInterval) {
        clearInterval(battleInterval);
    }
    battleInterval = setInterval(gameTick, 1000);
}

function stopBattle(currentTeam1, currentTeam2, fled = false) {
    // battleStarted and battleInterval are cleared in checkBattleOutcome or if fled directly
    if (battleInterval) { // Ensure interval is cleared if stopBattle is called directly (e.g. flee)
        clearInterval(battleInterval);
        battleInterval = null;
    }
    battleStarted = false;

    stopAllSkills(currentTeam1, currentTeam2);

    if (fled) {
        hidePopup(); // Ensure no popups linger if fleeing
        returnToMap(); // Navigate away
    }
    // If not fled, win/loss popups are handled by checkBattleOutcome's flow.
}

// --- Stage Progression ---

function repeatStage() {
    hidePopup();
    reLoadStage(); // Assumes reLoadStage prepares team1 and team2
    startBattle(team1, team2, currentPoiName); // Restart battle with potentially new instances from reLoadStage
}

function nextStage() {
    hidePopup();
    loadNextStage(); // Assumes loadNextStage prepares team1 and team2 for the new stage
    startBattle(team1, team2); // Start battle with new instances
}

// --- Exports ---
export {startBattle, stopBattle, hidePopup, battleStarted, repeatStage, nextStage};
// attemptFlee and returnToMap are already exported by their definition