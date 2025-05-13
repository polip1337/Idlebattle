export function updateSkillBar(skills) {
    for (let i = 0; i < 12; i++) {
        var element = document.querySelector("#skill" + (i + 1) + " img");
        var tooltip = document.querySelector("#skill" + (i + 1)).nextSibling;
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
            tooltip.innerHTML = ""; // Clear tooltip if no skill
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
    ${skill.damageType && skill.damageType.toLowerCase() !== 'none' ? `Damage Type: ${skill.damageType}<br>` : ''}
    ${skill.description}<br>
`;
    if (skill.effects) {
        const effect = skill.effects; // Assuming skill.effects is a single object, not array for this tooltip

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
    // Passive skills might have a single effect object or an array.
    // This example assumes a single effect object for simplicity in tooltip.
    // If skill.effects is an array, you might want to iterate or pick the first one.
    let effectToDisplay = null;
    if (skill.effect) { // Prefer .effect if it exists
        effectToDisplay = skill.effect;
    } else if (skill.effects && !Array.isArray(skill.effects)) { // If .effects is a single object
        effectToDisplay = skill.effects;
    } else if (skill.effects && Array.isArray(skill.effects) && skill.effects.length > 0) { // If .effects is an array
        effectToDisplay = skill.effects[0]; // Display first effect as example
    }

    if (effectToDisplay) {
        tooltipContent += `
            <strong>Effect: ${effectToDisplay.name || effectToDisplay.id || 'Unnamed Effect'}</strong><br>
            ${effectToDisplay.stat ? `Stat: ${effectToDisplay.stat}<br>` : ''}
            ${effectToDisplay.value !== undefined && effectToDisplay.value !== 0 ? `Value: ${effectToDisplay.value}<br>` : ''}
            ${effectToDisplay.subType ? `Type: ${effectToDisplay.subType}<br>` : ''}
            ${effectToDisplay.description ? `Description: ${effectToDisplay.description}<br>` : ''}
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
            tooltip.innerHTML = ""; // Clear tooltip if no skill
            skillElement.classList.remove('rainbow');
        }
    }
}

export function updateExp(member) {
    const expBar = document.querySelector('#level-progress-bar');
    const expPercentage = Math.min(100, (member.experience / member.experienceToLevel) * 100) + '%'; // Cap at 100%
    expBar.style.setProperty('width', expPercentage);
    const tooltip = expBar.querySelector('#level-progress-bar .tooltip-text');

    let statsText = '';
    if (member.statsPerLevel) {
        for (const [stat, value] of Object.entries(member.statsPerLevel)) {
            statsText += `\n${stat}: +${value} per level <br>`;
        }
    }
    if (tooltip) {
        tooltip.innerHTML = `EXP: ${member.experience} / ${member.experienceToLevel}${statsText}`;
    }
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

    // Ensure tooltip element exists or create it
    let tooltipText = progressBar.querySelector('.tooltip-text');
    if (!tooltipText) {
        tooltipText = document.createElement('div');
        tooltipText.className = 'tooltip-text';
        progressBar.appendChild(tooltipText); // Append it once
    }

    let statsText = '';
    if (member.statsPerLevel) {
        for (const [stat, value] of Object.entries(member.statsPerLevel)) {
            statsText += `\n${stat}: +${value} per level <br>`;
        }
    }

    tooltipText.innerHTML = `EXP: ${member.experience} / ${member.experienceToLevel}${statsText}`;

    const progressPercentage = Math.min(100, (member.experience / member.experienceToLevel) * 100);
    progressBar.style.width = `${progressPercentage}%`;
    classNameText.textContent = member.classType + " Level: " + member.level;
}

export function updateHealth(member) {
    if (!member.element) return;
    const healthOverlay = member.element.querySelector('.health-overlay');
    if (!healthOverlay) return;
    const healthPercentage = (100 - (member.currentHealth / member.maxHealth) * 100) + '%';
    healthOverlay.style.setProperty('--health-percentage', healthPercentage);
    updateTooltip(member);
}

export function updateTooltip(member) {
    if (!member.element) return;
    const tooltip = member.element.querySelector('.tooltip');
    if (!tooltip) return;
    tooltip.innerHTML = `
        <strong>${member.name}</strong>
        <p>Health: ${Math.round(member.currentHealth)}/${member.maxHealth}</p>
        <p>Mana: ${member.currentMana}/${member.stats.mana}</p>
        <p>Stamina: ${member.currentStamina}/${member.stats.stamina}</p>
    `;
}

export function updateMana(member) {
    if (!member.element) return;
    const manaOverlay = member.element.querySelector('.mana-overlay');
    if (!manaOverlay) return;
    const manaPercentage = ((member.currentMana / member.stats.mana) * 100) + '%';
    manaOverlay.style.setProperty('--mana-percentage', manaPercentage);
    updateTooltip(member);
}

export function updateStamina(member) {
    if (!member.element) return;
    const staminaOverlay = member.element.querySelector('.stamina-overlay');
    if (!staminaOverlay) return;
    const staminaPercentage = ((member.currentStamina / member.stats.stamina) * 100) + '%';
    staminaOverlay.style.setProperty('--stamina-percentage', staminaPercentage);
    updateTooltip(member);
}

export function updateStatsDisplay(member) {
    const element = document.querySelector(`#heroStats`);
    if (!element) return;

    element.innerHTML = `
            <h2>Classes</h2>
            <p>Warrior</p> <!-- Placeholder -->
            <p>Mage</p> <!-- Placeholder -->
            <p>Healer</p> <!-- Placeholder -->
            <h2>Statistics</h2>
            <p>Strength: <span id="heroStrength">${member.stats.strength}</span></p>
            <p>Speed: <span id="heroSpeed">${member.stats.speed}</span></p>
            <p>Dexterity: <span id="heroDexterity">${member.stats.dexterity}</span></p>
            <p>Vitality: <span id="heroVitality">${member.stats.vitality}</span></p>
            <p>Magic Power: <span id="heroMagicPower">${member.stats.magicPower}</span></p>
            <p>Mana: <span id="heroMana">${member.currentMana}/${member.stats.mana}</span></p>
            <p>Mana Regen: <span id="heroManaRegen">${member.stats.manaRegen}</span></p>
            <p>Magic Control: <span id="heroMagicControl">${member.stats.magicControl}</span></p>
            <p>Gold: <span id="heroGold">${member.gold}</span></p>
        `;
}

export function renderSkills(hero) {
    const container = document.querySelector(`#activeSkills`);
    if (!container) return;
    container.innerHTML = '';
    var activeSkills = hero.skills.filter(skill => skill.type == "active");
    activeSkills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.id = 'skill-box' + skill.name.replace(/\s/g, '');
        skillBox.innerHTML = `
            <img src="${skill.icon}" alt="${skill.name}">
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

        const targetingSelect = skillBox.querySelector('.targeting-modes');
        // Set current targeting mode if available
        if (skill.targetingMode) {
            targetingSelect.value = skill.targetingMode;
        }

        skillBox.addEventListener('click', (event) => {
            // Prevent skill selection if click is on the select element itself
            if (event.target.tagName.toLowerCase() === 'select') {
                return;
            }
            skill.targetingMode = targetingSelect.value; // Ensure mode is set before selecting
            hero.selectSkill(skill, skillBox);
        });

        targetingSelect.addEventListener('change', () => {
            console.log(`Selected targeting mode for ${skill.name}: ${targetingSelect.value}`);
            skill.targetingMode = targetingSelect.value;
             // If skill is already selected in bottom bar, update its instance there too (optional)
            const selectedSkillInstance = hero.selectedSkills.find(s => s.name === skill.name);
            if (selectedSkillInstance) {
                selectedSkillInstance.targetingMode = targetingSelect.value;
            }
        });
        container.appendChild(skillBox);
    });
}

export function updateProgressBar(skill) {
    const progressBar = document.querySelector('#skill-box' + skill.name.replace(/\s/g, '') + " .progress");
    if (!progressBar) return;
    const widthPercentage = (skill.experience / skill.experienceToNextLevel) * 100;
    progressBar.style.width = `${widthPercentage}%`;
}

export function renderPassiveSkills(hero) {
    const container = document.querySelector(`#passiveSkills`);
    if (!container) return;
    container.innerHTML = '';
    var passiveSkills = hero.skills.filter(skill => skill.type != "active"); // Or specific passive type
    passiveSkills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.id = 'skill-box' + skill.name.replace(/\s/g, '');

        skillBox.innerHTML = `
            <img src="${skill.icon}" alt="${skill.name}">
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
            hero.selectSkill(skill, skillBox, true); // Use selectSkill with isPassive = true
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

    const portraitTooltip = document.createElement('div');
    portraitTooltip.className = 'tooltip';
    portraitTooltip.innerHTML = `
            <strong>${member.name}</strong><br>
            Health: ${Math.round(member.currentHealth)} / ${member.maxHealth}<br>
            Mana: ${member.currentMana} / ${member.stats.mana}<br>
            Stamina: ${member.currentStamina} / ${member.stats.stamina}<br>
        `;
    portraitDiv.appendChild(portraitTooltip);
    portraitDetailsDiv.appendChild(portraitDiv);
    memberDiv.appendChild(portraitDetailsDiv);

    var effectsElement = document.createElement('div');
    effectsElement.className = 'effects';
    memberDiv.appendChild(effectsElement);

    const portrait = memberDiv.querySelector('.memberPortrait');
    const tooltip = portrait.querySelector('.tooltip');
    portrait.addEventListener('mouseenter', (event) => {
        showTooltip(event, tooltip);
    });
    portrait.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });

    member.element = memberDiv; // Assign the created element to the member instance

    // Update mana and stamina bars
    updateMana(member);
    updateStamina(member);
    updateHealth(member); // Already present in original code, included for completeness

    return memberDiv;
}

export function createPortrait(member) {
    const portraitDiv = document.createElement('div');
    portraitDiv.className = 'memberPortrait';

    const img = document.createElement('img');
    img.src = member.class.portrait;
    img.alt = member.name;
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

export function renderMember(member) { // For non-hero members
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

    // Simplify to show only a few skills or none for mobs if too cluttered
    const skillsToShow = member.skills.slice(0, 6); // Show up to 6 skills

    const iconRow1 = document.createElement('div');
    iconRow1.className = 'icon-row';
    const iconRow2 = document.createElement('div');
    iconRow2.className = 'icon-row';

    skillsToShow.forEach((skill, i) => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'iconDiv';
        iconDiv.id = member.memberId + 'Skill' + skill.name.replace(/\s/g, '');

        const icon = document.createElement('img');
        icon.className = 'icon';
        icon.src = skill.icon;
        icon.alt = skill.name;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        if (skill.type === "passive") {
            updatePassiveSkillTooltip(tooltip, skill);
        } else {
            updateSkillTooltip(tooltip, skill);
        }
        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.className = 'cooldown-overlay hidden'; // Start hidden

        iconDiv.appendChild(tooltip);
        iconDiv.appendChild(icon);
        iconDiv.appendChild(cooldownOverlay);

        if (i < 3) {
            iconRow1.appendChild(iconDiv);
        } else {
            iconRow2.appendChild(iconDiv);
        }
    });
    if (iconRow1.hasChildNodes()) iconContainer.appendChild(iconRow1);
    if (iconRow2.hasChildNodes()) iconContainer.appendChild(iconRow2);

    const portraitTooltip = document.createElement('div');
    portraitTooltip.className = 'tooltip';
    // Initial content, will be updated by updateTooltip
    portraitTooltip.innerHTML = `
            <strong>${member.name}</strong><br>
            Health: ${Math.round(member.currentHealth)} / ${member.maxHealth}<br>
            Mana: ${member.currentMana} / ${member.stats.mana}<br>
            Stamina: ${member.currentStamina} / ${member.stats.stamina}<br>
        `;
    portraitDiv.appendChild(portraitTooltip);
    portraitDetailsDiv.appendChild(portraitDiv);
    portraitDetailsDiv.appendChild(detailsDiv); // This holds skill icons
    memberDiv.appendChild(portraitDetailsDiv);

    if (iconContainer.hasChildNodes()) detailsDiv.appendChild(iconContainer); // Add skill icons only if they exist

    var effectsElement = document.createElement('div');
    effectsElement.className = 'effects';
    memberDiv.appendChild(effectsElement);

    // Add hover listeners for skill icons
    const iconDivs = memberDiv.querySelectorAll('.iconDiv');
    iconDivs.forEach(iconDiv => {
        const tooltip = iconDiv.querySelector('.tooltip');
        iconDiv.addEventListener('mouseenter', (event) => {
            showTooltip(event, tooltip);
        });
        iconDiv.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });

    member.element = memberDiv; // Assign the created element to the member instance

    return memberDiv;
}

export function renderLevelUp(skill) {
    const battlefield = document.querySelector(`#battlefield`);
    if (!battlefield) return;
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
    if (!modal || !evolutionOptionsDiv) return;
    evolutionOptionsDiv.innerHTML = '';

    hero.availableClasses.forEach((evolution, index) => {
        const evolutionDiv = document.createElement('div');
        evolutionDiv.className = 'evolution-option';
        evolutionDiv.innerHTML = `
            <h3>${evolution.name}</h3>
            <p>${evolution.description}</p>
        `;
        evolutionDiv.addEventListener('click', () => {
            selectEvolution(index); // Placeholder for actual evolution logic
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
    if (modal) modal.style.display = 'none';
}

function selectEvolution(index) {
    // This function needs to be implemented with actual evolution logic
    console.log(`Selected evolution index: ${index}`);
    // E.g., hero.evolveTo(hero.availableClasses[index]);
}

export function showTooltip(event, contentElement) {
    if (!contentElement) return;

    const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff');
    if (!target) return;

    contentElement.style.display = 'block';
    contentElement.style.visibility = 'hidden';

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = contentElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let top = 0;
    let left = 0;

    if (target.classList.contains('battleSkillIcon') || target.classList.contains('iconDiv')) {
        top = targetRect.top - tooltipRect.height - 10; // Above the skill icon
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2; // Center horizontally
    } else if (target.classList.contains('buff') || target.classList.contains('debuff')) {
        top = targetRect.bottom + 5; // Below the effect icon
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2; // Center horizontally
    } else {
        top = targetRect.top - tooltipRect.height - 5; // Above portrait
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2; // Center horizontally
    }

    // Adjust if off-screen
    if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 5;
    }
    if (left < 0) {
        left = 5;
    }
    if (top < 0) {
        top = targetRect.bottom + 5; // Flip to below if no space above
    }
    if (top + tooltipRect.height > viewportHeight) {
        top = viewportHeight - tooltipRect.height - 5;
    }

    contentElement.style.top = `${top}px`;
    contentElement.style.left = `${left}px`;
    contentElement.style.visibility = 'visible';
    contentElement.style.position = 'fixed'; // Use fixed positioning
    contentElement.style.zIndex = '99999999';
    contentElement.style.overflow = 'visible';
}

export function updateHeroMapStats(heroInstance) {
    const statsContainer = document.getElementById('hero-portrait-container');

    const healthOverlay = statsContainer.querySelector('.health-overlay');
    const manaOverlay = statsContainer.querySelector('.mana-overlay');
    const staminaOverlay = statsContainer.querySelector('.stamina-overlay');
    const tooltip = statsContainer.querySelector('.tooltip');
    const goldSpan = statsContainer.querySelector('#hero-gold');

    if (healthOverlay) {
        const healthPercentage = (100 - (heroInstance.currentHealth / heroInstance.maxHealth) * 100) + '%';
        healthOverlay.style.setProperty('--health-percentage', healthPercentage);
    }

    if (manaOverlay) {
        const manaPercentage = ((heroInstance.currentMana / heroInstance.stats.mana) * 100) + '%';
        manaOverlay.style.setProperty('--mana-percentage', manaPercentage);
    }

    if (staminaOverlay) {
        const staminaPercentage = ((heroInstance.currentStamina / heroInstance.stats.stamina) * 100) + '%';
        staminaOverlay.style.setProperty('--stamina-percentage', staminaPercentage);
    }

    if (tooltip) {
        tooltip.innerHTML = `
            <strong>${heroInstance.name}</strong><br>
            Health: ${Math.round(heroInstance.currentHealth)}/${heroInstance.maxHealth}<br>
            Mana: ${heroInstance.currentMana}/${heroInstance.stats.mana}<br>
            Stamina: ${heroInstance.currentStamina}/${heroInstance.stats.stamina}<br>
        `;
    }

    if (goldSpan) {
        goldSpan.textContent = heroInstance.gold;
    }

    // Add hover event listeners for tooltip
    const portrait = statsContainer.querySelector('.stats-portrait');
    if (portrait && tooltip) {
        portrait.addEventListener('mouseenter', (event) => {
            showTooltip(event, tooltip);
        }, { once: true });
        portrait.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        }, { once: true });
    }
}