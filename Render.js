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
export function renderMember(member) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';

    const portraitDiv = document.createElement('img');
    portraitDiv.className = 'memberPortrait';
    portraitDiv.src = member.class.portrait;

    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';

    const staminaBar = document.createElement('div');
    staminaBar.className = 'stamina-bar';

    const manaBar = document.createElement('div');
    manaBar.className = 'mana-bar';

    const portraitDetailsDiv = document.createElement('div');
    portraitDetailsDiv.className = 'portrait-details-container';

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'details-container';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';

    const iconRow1 = document.createElement('div');
    iconRow1.className = 'icon-row';

    const iconRow2 = document.createElement('div');
    iconRow2.className = 'icon-row';
    for (let i = 0; i < 6; i++) {
        const skill = member.class.skills[i];
        const iconDiv = document.createElement('div');
        iconDiv.className = 'iconDiv';

        const icon = document.createElement('img');
        icon.className = 'icon';
        icon.src = skill.icon;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <strong>${skill.name}</strong><br>
            Damage: ${skill.damage}<br>
            Mana Cost: ${skill.manaCost}<br>
            Cooldown: ${skill.cooldown}<br>
            Damage Type: ${skill.damageType}<br>
            ${skill.description}
        `;
        iconDiv.appendChild(tooltip);
        iconDiv.appendChild(icon);
        if (i < 3) {
          iconRow1.appendChild(iconDiv);
        } else {
          iconRow2.appendChild(iconDiv);
        }
        iconContainer.appendChild(iconRow1);
        iconContainer.appendChild(iconRow2);


    }

    portraitDetailsDiv.appendChild(portraitDiv);
    portraitDetailsDiv.appendChild(detailsDiv);
    memberDiv.appendChild(portraitDetailsDiv);

    detailsDiv.appendChild(iconContainer);
    memberDiv.appendChild(healthBar);
    memberDiv.appendChild(staminaBar);
    memberDiv.appendChild(manaBar);

    return memberDiv;
}

export function renderDefault(member) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';

    const portraitDiv = document.createElement('img');
    portraitDiv.className = 'memberPortrait';
    portraitDiv.src = "Media/UI/defaultPortrait.jpg";

    memberDiv.appendChild(portraitDiv);

    return memberDiv;
}
