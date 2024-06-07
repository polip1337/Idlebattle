// Render.js


export function updateAttackBar(member) {
        const element = document.querySelector(`#${member.memberId} .attack-bar`);
        element.style.width = `${member.attackCharge}%`;
        element.textContent = `Charging...`;
    }

 export function updateStatus(member, message) {
        const element = document.querySelector(`#${member.memberId} .status`);

        element.textContent = `Status: ${message}`;
        if(message == "Defeated"){
            clearInterval(member.chargeInterval);
       }
    }
export function updateHealth(member) {
    const healthElement = document.querySelector(`#${member.memberId} .health-bar`);
    healthElement.style.width = `${(member.currentHealth / (member.stats.vitality * 10)) * 100}%`;
    healthElement.textContent = `HP: ${member.currentHealth}/${member.stats.vitality * 10}`;

}

export function updateMana(member) {
    const manaElement = document.querySelector(`#${member.memberId} .mana-bar`);
    manaElement.style.width = `${(member.currentMana / member.stats.mana) * 100}%`;
    manaElement.textContent = `Mana: ${member.currentMana}/${member.stats.mana}`;

}

export function  updateStatsDisplay(member) {
    const element = document.querySelector(`#${member.memberId} .stats`);

        element.innerHTML = `
            Class: ${member.classType}<br>
            Level: ${member.level}<br>
            Strength: ${member.stats.strength}<br>
            Speed: ${member.stats.speed}<br>
            Dexterity: ${member.stats.dexterity}<br>
            Vitality: ${member.stats.vitality}<br>
            Magic Power: ${member.stats.magicPower}<br>
            Mana: ${member.currentMana}/${member.stats.mana}<br>
            Mana Regen: ${member.stats.manaRegen}<br>
            Magic Control: ${member.stats.magicControl}
        `;
    }


export function renderBuffsAndDebuffs(member,effect) {
    const buffsElement = document.querySelector(`#${member.memberId} .buffs`);
    buffsElement.innerHTML = '';
    for (const buff of member.buffs) {
        const buffIcon = document.createElement('div');
        buffIcon.className = 'buff';
        buffIcon.style.backgroundImage = `url(${buff.icon})`;
       // buffIcon.setAttribute('title', `${effect.type}: ${effect.stat}`); // Tooltip

        buffsElement.appendChild(buffIcon);

    }
    const debuffsElement = document.querySelector(`#${member.memberId} .debuffs`);
    debuffsElement.innerHTML = '';
    for (const debuff of member.debuffs) {
        const debuffIcon = document.createElement('div');
        debuffIcon.className = 'debuff';
        debuffIcon.style.backgroundImage = `url(${debuff.icon})`;
        debuffsElement.appendChild(debuffIcon);
    }
}
