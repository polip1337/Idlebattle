import { startBattle, createHero, hidePopup, createMembers } from './Battle.js';
import Team from './Team.js';
import Hero from './Hero.js';
import Area from './Area.js';
import BattleLog from './BattleLog.js';
import { updateStatsDisplay, updateSkillBar, renderMember,renderPassiveSkills, updateMana,updateStamina,updateHealth, renderLevelUp, renderHero, updateLevelProgress, openEvolutionModal} from './Render.js';
import BattleStatistics from './BattleStatistics.js';

window.onload = function() {
    const modal = document.getElementById('evolution-modal');
    const closeButton = document.getElementsByClassName('close-button')[0];

    window.onclick = function(event) {
        if (event.target === modal) {
            closeEvolutionModal();
        }
    }
}









