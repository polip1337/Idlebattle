import Member from './Member.js';
import Team from './Team.js';
import { isPaused } from './Main.js';
import EffectClass from './EffectClass.js';

import { updateHealth, updateMana, updateAttackBar,updateStatus,updateStatsDisplay } from './RenderMember.js';

function startBattle(team1, team2) {
    team1.members.forEach(team1Member => {
        if (team1Member.currentHealth > 0) {
            team1Member.chargeAttack();
        }
    });

    team2.members.forEach(team2Member => {
        if (team2Member.currentHealth > 0) {
            team2Member.chargeAttack();
        }
    });

    const battleInterval = setInterval(() => {
        if (isPaused) return;

        team1.members.forEach(team1Member => {
            if (team1Member.currentHealth > 0 ){
                team1Member.regenMana();
            }else if(team1Member.status.innerHTML != "Status: Defeated" ){
                handleDeath(team1Member,team2);
            }

        });

        team2.members.forEach(team2Member => {
            if (team2Member.currentHealth > 0){
                team2Member.regenMana();
            }else if(team2Member.status.innerHTML != "Status: Defeated"){
                 handleDeath(team2Member,team1);
             }
        });
        // Check for battle end conditions
        const team1Alive = team1.members.some(member => member.currentHealth > 0);
        const team2Alive = team2.members.some(member => member.currentHealth > 0);
        if (!team1Alive || !team2Alive) {
            clearInterval(battleInterval);
            if (!team1Alive) {
                team1.members.forEach(member => member.updateStatus('Defeated'));
                team2.members.forEach(member => member.updateStatus('Victory!'));
            } else {
                team1.members.forEach(member => member.updateStatus('Victory!'));
                team2.members.forEach(member => member.updateStatus('Defeated'));
            }
        }
        console.log(new Date().toLocaleTimeString());

    }, 1000); // Adjust the interval as needed
}
function createRandomMembers(prefix, classes,team, opposingTeam) {
    const classKeys = Object.keys(classes);
    return Array.from({ length: 1 }, (_, i) => {
        const randomClass = classKeys[Math.floor(Math.random() * classKeys.length)];
        return new Member(`${prefix}-Member${i + 1}`, randomClass, classes[randomClass].stats, classes[randomClass].skills, `${prefix.toLowerCase()}-member${i}`, team,opposingTeam);
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
export { startBattle, createRandomMembers };
