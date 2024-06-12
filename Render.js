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

export function updateSkillBar(hero) {
        const element = document.querySelector(`#skill1`);
    element.src = hero.skills[0].icon;

}
export function updateMana(member) {
    const manaElement = document.querySelector(`#${member.memberId} .mana-bar`);
    manaElement.style.width = `${(member.currentMana / member.stats.mana) * 100}%`;
    manaElement.textContent = `Mana: ${member.currentMana}/${member.stats.mana}`;

}

export function  updateStatsDisplay(member) {
    const element = document.querySelector(`#heroStats`);


        element.innerHTML = `
            <h2>Classes</h2>
            <p>Warrior</p>
            <p>Mage</p>
            <p>Healer</p>
            <h2>Statistics</h2>
            <p>Strength: <span id="heroStrength">${member.stats.strength}</span></p>
            <p>Speed: <span id="heroSpeed">${member.stats.speed}</span></p>
            <p>Dexterity: <span id="heroDexterity">${member.stats.dexterity}</span></p>
            <p>Vitality: <span id="heroVitality">${member.stats.vitality}</span></p>
            <p>Magic Power: <span id="heroMagicPower">${member.stats.magicPower}</span></p>
            <p>Mana: <span id="heroMana">${member.currentMana}/${member.stats.mana}</span></p>
            <p>Mana Regen: <span id="heroManaRegen">${member.stats.manaRegen}</span></p>
            <p>Magic Control: <span id="heroMagicControl">${member.stats.magicControl}</span></p>
        `;
    }
export function loadSkills(hero) {
    const container = document.querySelector(`#activeSkills`);
    container.innerHTML = '';
    hero.skills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.innerHTML = `
            <img src="${skill.icon}">
            <span>${skill.name} target</span>
            <select class="targeting-modes">
                ${skill.targetingModes.map(mode => `<option value="${mode}">${mode}</option>`).join('')}
            </select>
            <div class="progressBar">
                <div class="progress" style="width: 40%;"></div>
            </div>
        `;
        skillBox.addEventListener('click', () => hero.selectSkill(skill, skillBox));
        container.appendChild(skillBox);
    });
}


export function getSelectedTargetingModes() {
    const targetingModes = {};
    selectedSkills.forEach(skill => {
        const skillBox = document.querySelector(`.skill-box:contains(${skill.name})`);
        const selectedMode = skillBox.querySelector('.targeting-modes').value;
        targetingModes[skill.name] = selectedMode;
    });
    return targetingModes;
}