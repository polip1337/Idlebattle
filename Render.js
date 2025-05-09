export function updateSkillBar(skills) {
    for (let i = 0; i < 12; i++) {
        var element = document.querySelector("#skill" + (i + 1) + " img");
        var tooltip = document.querySelector("#skill" + (i + 1) + " .tooltip");
        var skillElement = document.querySelector("#skill" + (i + 1));

        if (skills[i]) {
            skills[i].setElement(skillElement);
            element.src = skills[i].icon;
            if (skills[i].type === "passive") {
                updatePassiveSkillTooltip(tooltip, skills[i]);
            } else {
                updateSkillTooltip(tooltip, skills[i]);
            }
            // Apply rainbow class only for active skills in the bottom bar
            if (skills[i].repeat && skills[i].type === "active") {
                skillElement.classList.add('rainbow');
            } else {
                skillElement.classList.remove('rainbow');
            }
        } else {
            element.src = "Media/UI/defaultSkill.jpeg";
            skillElement.classList.remove('rainbow');
        }
    }
}

export function updateSkillTooltip(tooltip, skill) {
    let tooltipContent = `
    <strong>${skill.name}</strong><br>
    ${skill.damage !== 0 ? `Damage: ${skill.damage}<br>` : ''}
    ${skill.manaCost !== 0 ? `Mana Cost: ${skill.manaCost}<br>` : ''}
    ${skill.staminaCost !== 0 ? `Stamina Cost: ${skill.staminaCost}<br>` : ''}
    ${skill.cooldown !== 0 ? `Cooldown: ${skill.cooldown}<br>` : ''}
    ${skill.damageType.toLowerCase() !== 'none' ? `Damage Type: ${skill.damageType}<br>` : ''}
    ${skill.description}<br>
`;
    if (skill.effects) {
        const effect = skill.effects;

        tooltipContent += `
            <strong>Effect: ${effect.name !== undefined ? effect.name : 'Unnamed Effect'}</strong><br>
            ${effect.damageType !== undefined && effect.damageType !== 'none' ? `Damage Type: ${effect.damageType}<br>` : ''}
            ${effect.value !== undefined && effect.value !== 0 ? `Value: ${effect.value}<br>` : ''}
            ${effect.duration !== undefined && effect.duration !== 0 ? `Duration: ${effect.duration}s<br>` : ''}
        `;
    }

    tooltip.innerHTML = tooltipContent;
}

export function updatePassiveSkillTooltip(tooltip, skill) {
    let tooltipContent = `
    <strong>${skill.name}</strong><br>
    ${skill.description}<br>
`;
    if (skill.effect) {
        tooltipContent += `
            <strong>Effect: ${skill.effect.description || 'Unnamed Effect'}</strong><br>
            ${skill.effect.stat ? `Stat: ${skill.effect.stat}<br>` : ''}
            ${skill.effect.value !== undefined && skill.effect.value !== 0 ? `Value: ${skill.effect.value}<br>` : ''}
            ${skill.effect.subtype ? `Type: ${skill.effect.subtype}<br>` : ''}
        `;
    } else if (skill.effects && skill.effects.length > 0) {
        tooltipContent += `
            <strong>Effect: ${skill.effects[0].id || 'Unnamed Effect'}</strong><br>
        `;
    }

    tooltip.innerHTML = tooltipContent;
}

export function updatePassiveSkillBar(skills) {
    for (let i = 0; i < 12; i++) {
        var element = document.querySelector("#passiveSkill" + (i + 1) + " img");
        var tooltip = document.querySelector("#passiveSkill" + (i + 1) + " .tooltip");
        var skillElement = document.querySelector("#passiveSkill" + (i + 1));
        if (skills[i]) {
            skills[i].setElement(skillElement);
            element.src = skills[i].icon;
            updatePassiveSkillTooltip(tooltip, skills[i]);
            // Do not apply rainbow class to passive skills
            skillElement.classList.remove('rainbow');
        } else {
            element.src = "Media/UI/defaultSkill.jpeg";
            skillElement.classList.remove('rainbow');
        }
    }
}

export function updateExp(member) {
    const expBar = document.querySelector('#level-progress-bar');
    const expPercentage = ((member.experience / member.experienceToLevel) * 100) + '%';
    expBar.style.setProperty('width', expPercentage);
    const tooltip = expBar.querySelector('#level-progress-bar .tooltip-text');

    let statsText = '';
    if (member.statsPerLevel) {
        for (const [stat, value] of Object.entries(member.statsPerLevel)) {
            statsText += `\n${stat}: ${value} <br>`;
        }
    }

    tooltip.innerHTML = `EXP: ${member.experience} / ${member.experienceToLevel}${statsText}`;
}

export function updateExpBarText(string) {
    const classNameText = document.getElementById('class-name');
    classNameText.textContent = string;
}

export function expBarTextAddGlow(index) {
    const classNameText = document.getElementById('level-progress-bar');
    classNameText.classList.add('glow');
}

export function expBarTextRemoveGlow(index) {
    const classNameText = document.getElementById('level-progress-bar');
    classNameText.classList.remove('glow');
}

export function renderLevelProgress(member) {
    const progressBar = document.getElementById('level-progress-bar');
    const classNameText = document.getElementById('class-name');
    const tooltipText = document.createElement('div');
    tooltipText.className = 'tooltip-text';
    let statsText = '';
    if (member.statsPerLevel) {
        for (const [stat, value] of Object.entries(member.statsPerLevel)) {
            statsText += `\n${stat}: ${value} <br>`;
        }
    }

    tooltipText.innerHTML = `EXP: ${member.experience} / ${member.experienceToLevel}${statsText}`;

    const existingTooltip = progressBar.querySelector('.tooltip-text');
    if (existingTooltip) {
        progressBar.removeChild(existingTooltip);
    }

    const progressPercentage = (member.experience / member.experienceToLevel) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    classNameText.textContent = member.classType + " Level: " + member.level;

    progressBar.appendChild(tooltipText);
}

export function updateHealth(member) {
    const healthOverlay = member.element.querySelector('.health-overlay');
    const healthPercentage = (100 - (member.currentHealth / member.maxHealth) * 100) + '%';
    healthOverlay.style.setProperty('--health-percentage', healthPercentage);
    updateTooltip(member);
}

export function updateTooltip(member) {
    const tooltip = member.element.querySelector('.tooltip');
    tooltip.innerHTML = `
        <strong>${member.name}</strong>
        <p>Health: ${member.currentHealth}/${member.maxHealth}</p>
        <p>Mana: ${member.currentMana}/${member.stats.mana}</p>
        <p>Stamina: ${member.currentStamina}/${member.stats.stamina}</p>
    `;
}

export function updateMana(member) {
    const manaOverlay = member.element.querySelector('.mana-overlay');
    const manaPercentage = ((member.currentMana / member.stats.mana) * 100) + '%';
    manaOverlay.style.setProperty('--mana-percentage', manaPercentage);
    updateTooltip(member);
}

export function updateStamina(member) {
    const staminaOverlay = member.element.querySelector('.stamina-overlay');
    const staminaPercentage = ((member.currentStamina / member.stats.stamina) * 100) + '%';
    staminaOverlay.style.setProperty('--stamina-percentage', staminaPercentage);
    updateTooltip(member);
}

export function updateStatsDisplay(member) {
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

export function renderSkills(hero) {
    const container = document.querySelector(`#activeSkills`);
    container.innerHTML = '';
    var activeSkills = hero.skills.filter(skill => skill.type == "active");
    activeSkills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.id = 'skill-box' + skill.name.replace(/\s/g, '');
        skillBox.innerHTML = `
            <img src="${skill.icon}">
            <span>${skill.name}</span>
            <select class="targeting-modes">
                ${skill.targetingModes.map(mode => `<option value="${mode}">${mode}</option>`).join('')}
            </select>
            <div class="progressBar">
                <div class="progress" style="width: ${skill.experience / skill.experienceToNextLevel * 100}%"></div>
            </div>
            <div class="tooltip"></div>
        `;
        // Do not apply rainbow class in Hero tab
        const tooltip = skillBox.querySelector('.tooltip');
        updateSkillTooltip(tooltip, skill);
        skillBox.addEventListener('click', () => {
            skill.targetingMode = targetingSelect.value;
            hero.selectSkill(skill, skillBox);
        });

        const targetingSelect = skillBox.querySelector('.targeting-modes');
        targetingSelect.addEventListener('change', () => {
            console.log(`Selected targeting mode for ${skill.name}: ${targetingSelect.value}`);
            skill.targetingMode = targetingSelect.value;
        });
        container.appendChild(skillBox);
    });
}

export function updateProgressBar(skill) {
    const progressBar = document.querySelector('#skill-box' + skill.name.replace(/\s/g, '') + " .progress");

    const widthPercentage = (skill.experience / skill.experienceToNextLevel) * 100;
    progressBar.style.width = `${widthPercentage}%`;
}

export function renderPassiveSkills(hero) {
    const container = document.querySelector(`#passiveSkills`);
    container.innerHTML = '';
    var passiveSkills = hero.skills.filter(skill => skill.type != "active");
    passiveSkills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.id = 'skill-box' + skill.name.replace(/\s/g, '');

        skillBox.innerHTML = `
            <img src="${skill.icon}">
            <span>${skill.name}</span>
            <div class="progressBar">
                <div class="progress" style="width: ${skill.experience / skill.experienceToNextLevel * 100}%"></div>
            </div>
            <div class="tooltip"></div>
        `;
        // Do not apply rainbow class to passive skills
        const tooltip = skillBox.querySelector('.tooltip');
        updatePassiveSkillTooltip(tooltip, skill);
        skillBox.addEventListener('click', () => {
            hero.selectPassiveSkill(skill, skillBox);
        });

        container.appendChild(skillBox);
    });
}

export function renderHero(member) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';
    memberDiv.id = member.memberId;

    let portraitDiv = createPortrait(member);
    const portraitDetailsDiv = document.createElement('div');
    portraitDetailsDiv.className = 'portrait-details-container';

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'details-container';

    const portraitTooltip = document.createElement('div');
    portraitTooltip.className = 'tooltip';
    portraitTooltip.innerHTML = `
            <strong>${member.name}</strong><br>
            Health: ${member.currentHealth} / ${member.maxHealth}<br>
            Mana: ${member.currentMana} / ${member.stats.mana}<br>
            Stamina: ${member.currentStamina} / ${member.stats.stamina}<br>
        `;
    portraitDiv.appendChild(portraitTooltip);
    portraitDetailsDiv.appendChild(portraitDiv);
    memberDiv.appendChild(portraitDetailsDiv);

    var effectsElement = document.createElement('div');
    effectsElement.className = 'effects';
    memberDiv.appendChild(effectsElement);

    return memberDiv;
}

export function createPortrait(member) {
    const portraitDiv = document.createElement('div');
    portraitDiv.className = 'memberPortrait';

    const img = document.createElement('img');
    img.src = member.class.portrait;
    img.className = 'memberPortraitImage';

    const healthOverlay = document.createElement('div');
    healthOverlay.className = 'health-overlay';
    healthOverlay.style.setProperty('--health-percentage', (100 - (member.currentHealth / member.maxHealth) * 100) + '%');

    const staminaBar = document.createElement('div');
    staminaBar.className = 'stamina-bar';
    const staminaOverlay = document.createElement('div');
    staminaOverlay.className = 'stamina-overlay';
    staminaBar.appendChild(staminaOverlay);

    const manaBar = document.createElement('div');
    manaBar.className = 'mana-bar';
    const manaOverlay = document.createElement('div');
    manaOverlay.className = 'mana-overlay';
    manaBar.appendChild(manaOverlay);

    portraitDiv.appendChild(img);
    portraitDiv.appendChild(healthOverlay);
    portraitDiv.appendChild(manaBar);
    portraitDiv.appendChild(staminaBar);

    return portraitDiv;
}

export function renderMember(member) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';
    memberDiv.id = member.memberId;

    let portraitDiv = createPortrait(member);

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
        const skill = member.skills[i];
        const iconDiv = document.createElement('div');
        iconDiv.className = 'iconDiv';
        iconDiv.id = member.memberId + 'Skill' + skill.name.replace(/\s/g, '');

        const icon = document.createElement('img');
        icon.className = 'icon';
        icon.src = skill.icon;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        if (skill.type === "passive") {
            updatePassiveSkillTooltip(tooltip, skill);
        } else {
            updateSkillTooltip(tooltip, skill);
        }
        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.className = 'cooldown-overlay';

        iconDiv.appendChild(tooltip);
        iconDiv.appendChild(icon);
        iconDiv.appendChild(cooldownOverlay);

        if (i < 3) {
            iconRow1.appendChild(iconDiv);
        } else {
            iconRow2.appendChild(iconDiv);
        }
        iconContainer.appendChild(iconRow1);
        iconContainer.appendChild(iconRow2);
    }
    const portraitTooltip = document.createElement('div');
    portraitTooltip.className = 'tooltip';
    portraitTooltip.innerHTML = `
            <strong>${member.name}</strong><br>
            Health: ${member.currentHealth} / ${member.maxHealth}<br>
            Mana: ${member.currentMana} / ${member.stats.mana}<br>
            Stamina: ${member.currentStamina} / ${member.stats.stamina}<br>
        `;
    portraitDiv.appendChild(portraitTooltip);
    portraitDetailsDiv.appendChild(portraitDiv);
    portraitDetailsDiv.appendChild(detailsDiv);
    memberDiv.appendChild(portraitDetailsDiv);

    detailsDiv.appendChild(iconContainer);
    var effectsElement = document.createElement('div');
    effectsElement.className = 'effects';
    memberDiv.appendChild(effectsElement);

    return memberDiv;
}

export function renderLevelUp(skill) {
    const battlefield = document.querySelector(`#battlefield`);
    const levelUpContainer = document.createElement('div');
    levelUpContainer.className = 'levelUpContainer';
    levelUpContainer.innerHTML = `<h1 class="levelUpTitle">
                                              <span>Your</span>
                                              <span>${skill.name}</span>
                                              <span>is level ${skill.level} now!</span>
                                          </h1>
                                          <div class="firework"></div>
                                          <div class="firework"></div>
                                          <div class="firework"></div>`;
    levelUpContainer.addEventListener('animationend', () => {
        levelUpContainer.remove();
    }, {once: true});
    battlefield.appendChild(levelUpContainer);
}

export function openEvolutionModal(hero) {
    const modal = document.getElementById('evolution-modal');
    const evolutionOptionsDiv = document.getElementById('evolution-options');
    evolutionOptionsDiv.innerHTML = '';

    hero.availableClasses.forEach((evolution, index) => {
        const evolutionDiv = document.createElement('div');
        evolutionDiv.className = 'evolution-option';
        evolutionDiv.innerHTML = `
            <h3>${evolution.name}</h3>
            <p>${evolution.description}</p>
        `;
        evolutionDiv.addEventListener('click', () => {
            selectEvolution(index);
            closeEvolutionModal();
        });
        evolutionOptionsDiv.appendChild(evolutionDiv);
    });

    modal.style.display = 'block';
}

export function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item));
    }
    const copy = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }
    return copy;
}

function closeEvolutionModal() {
    const modal = document.getElementById('evolution-modal');
    modal.style.display = 'none';
}

function selectEvolution(index) {
    console.log(`Selected evolution index: ${index}`);
}

export function showTooltip(event, content) {
    var tooltip = content;

    let top = event.clientY + 20;
    let left = event.clientX + 20;

    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipHeight = tooltipRect.height;

    if (0 > tooltipRect.top) {
        top = 100;
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `40px`;
        tooltip.style.bottom = `auto`;
    }
}