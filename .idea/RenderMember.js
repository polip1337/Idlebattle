// Render.js


export function updateAttackBar(member) {
            const element = document.querySelector(`#${member.memberId}`);

        element.attackBar.style.width = `${element.attackCharge}%`;
        element.attackBar.textContent = `Charging...`;
    }

 export function updateStatus(member, message) {
        const member = document.querySelector(`#${member.memberId}`);

        member.status.textContent = `Status: ${message}`;
        if(message == "Defeated"){
            clearInterval(member.chargeInterval);
       }
    }
export function updateHealthElement(member) {
    const healthElement = document.querySelector(`#${member.memberId} .health`);
    healthElement.style.width = `${(member.currentHealth / (member.stats.vitality * 10)) * 100}%`;
}

export function updateManaElement(member) {
    const manaElement = document.querySelector(`#${member.memberId} .mana`);
    manaElement.style.width = `${(member.currentMana / member.stats.mana) * 100}%`;
}

export function renderBuffsAndDebuffs(member) {
    const buffsElement = document.querySelector(`#${member.memberId} .buffs`);
    buffsElement.innerHTML = '';
    for (const buff of member.buffs) {
        const buffIcon = document.createElement('div');
        buffIcon.className = 'buff';
        buffIcon.style.backgroundImage = `url(${buff.icon})`;
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
