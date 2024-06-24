// Render.js

export function updateSkillBar(skills) {
    for(let i = 0; i<12; i++){
        var element = document.querySelector("#skill"+(i+1)+" img");
        if(skills[i])
            element.src = skills[i].icon;
        else
            element.src = "Media/UI/defaultSkill.jpeg";
    }

}
export function updatePassiveSkillBar(skills) {
    for(let i = 0; i<12; i++){
        var element = document.querySelector("#passiveSkill"+(i+1)+" img");
        if(skills[i])
            element.src = skills[i].icon;
        else
            element.src = "Media/UI/defaultSkill.jpeg";
    }

}

export function updateHealth(member) {
    const healthOverlay = member.element.querySelector('.health-overlay');
    const healthPercentage = (100 - (member.currentHealth / member.maxHealth) * 100) + '%';
    healthOverlay.style.setProperty('--health-percentage', healthPercentage);

}
export function updateMana(member) {
    const manaOverlay = member.element.querySelector('.mana-overlay');
    const manaPercentage = (100 - (member.currentMana / member.stats.mana) * 100) + '%';
    manaOverlay.style.setProperty('--mana-percentage', manaPercentage);
}
export function updateStamina(member) {
    const staminaOverlay = member.element.querySelector('.stamina-overlay');
    const staminaPercentage = (100 - (member.currentStamina / (member.stats.vitality*10)) * 100) + '%';
    staminaOverlay.style.setProperty('--stamina-percentage', staminaPercentage);
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
    var activeSkills = hero.skills.filter(skill => skill.type == "active");
    activeSkills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.innerHTML = `
            <img src="${skill.icon}">
            <span>${skill.name} </span>
            <select class="targeting-modes">
                ${skill.targetingModes.map(mode => `<option value="${mode}">${mode}</option>`).join('')}
            </select>
            <div class="progressBar">
                <div class="progress" style="width: 40%;"></div>
            </div>
        `;
        skillBox.addEventListener('click', () => {
            skill.targetingMode = targetingSelect.value;
            hero.selectSkill(skill, skillBox);
        });


        const targetingSelect = skillBox.querySelector('.targeting-modes');
        targetingSelect.addEventListener('change', () => {
            console.log(`Selected targeting mode for ${skill.name}: ${targetingSelect.value}`);
            skill.targetingMode = targetingSelect.value;
            // Add your custom logic here to handle the selected targeting mode
        });
        container.appendChild(skillBox);
    });
}
export function loadPassiveSkills(hero) {
    const container = document.querySelector(`#passiveSkills`);
    container.innerHTML = '';
    var passiveSkills = hero.skills.filter(skill => skill.type != "active");
    passiveSkills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.innerHTML = `
            <img src="${skill.icon}">
            <span>${skill.name} </span>

            <div class="progressBar">
                <div class="progress" style="width: 40%;"></div>
            </div>
        `;
        skillBox.addEventListener('click', () => {
            hero.selectPassiveSkill(skill, skillBox);
        });

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
    memberDiv.id=member.memberId;
    const portraitDiv = document.createElement('div');
    portraitDiv.className = 'memberPortrait';

    const img = document.createElement('img');
    img.src = member.class.portrait;
    img.className = 'memberPortraitImage';

    const healthOverlay = document.createElement('div');
    healthOverlay.className = 'health-overlay';
    healthOverlay.style.setProperty('--health-percentage', (100 - (member.currentHealth / member.maxHealth) * 100) + '%');

    // Create and append stamina bar
    const staminaBar = document.createElement('div');
    staminaBar.className = 'stamina-bar';
    const staminaOverlay = document.createElement('div');
    staminaOverlay.className = 'stamina-overlay';
    staminaBar.appendChild(staminaOverlay);

    // Create and append mana bar
    const manaBar = document.createElement('div');
    manaBar.className = 'mana-bar';
    const manaOverlay = document.createElement('div');
    manaOverlay.className = 'mana-overlay';
    manaBar.appendChild(manaOverlay);


    portraitDiv.appendChild(img);
    portraitDiv.appendChild(healthOverlay);
    portraitDiv.appendChild(manaBar);
    portraitDiv.appendChild(staminaBar);


    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';

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
    var effectsElement = document.createElement('div');
    effectsElement.className = 'effects';
    memberDiv.appendChild(effectsElement);

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

