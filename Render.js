// Render.js
import Item from './Item.js'; // Assuming Item.js is in the same directory
import { hero } from './initialize.js'; // To access hero instance for drag/drop

export function updateSkillBar(skills) {
    for (let i = 0; i < 12; i++) {
        const skillElement = document.querySelector("#skill" + (i + 1));
        if (!skillElement) continue;

        const elementImg = skillElement.querySelector("img");
        const tooltip = skillElement.querySelector(".tooltip"); // Corrected tooltip selection

        if (!elementImg || !tooltip) continue;

        if (skills[i]) {
            skills[i].setElement(skillElement); // Make sure Skill class has setElement
            elementImg.src = skills[i].icon;
            if (skills[i].type === "passive") {
                updatePassiveSkillTooltip(tooltip, skills[i]);
            } else {
                updateSkillTooltip(tooltip, skills[i]);
            }
            if (skills[i].repeat && skills[i].type === "active") {
                skillElement.classList.add('rainbow');
            } else {
                skillElement.classList.remove('rainbow');
            }
        } else {
            elementImg.src = "Media/UI/defaultSkill.jpeg";
            tooltip.innerHTML = "Empty Slot"; // Clear tooltip or set to empty
            skillElement.classList.remove('rainbow');
        }
    }
}

export function updateSkillTooltip(tooltip, skill) {
    if (!tooltip || !skill) return;
    let tooltipContent = `
    <strong>${skill.name} (Lvl ${skill.level || 1})</strong><br>
    ${skill.damage !== 0 ? `Damage: ${skill.damage}<br>` : ''}
    ${skill.manaCost !== 0 ? `Mana Cost: ${skill.manaCost}<br>` : ''}
    ${skill.staminaCost !== 0 ? `Stamina Cost: ${skill.staminaCost}<br>` : ''}
    ${skill.cooldown !== 0 ? `Cooldown: ${skill.cooldown}s<br>` : ''}
    ${skill.damageType && skill.damageType.toLowerCase() !== 'none' ? `Damage Type: ${skill.damageType}<br>` : ''}
    Description: ${skill.description}<br>
    ${skill.experience !== undefined ? `XP: ${skill.experience}/${skill.experienceToNextLevel}<br>` : ''}
`;
    if (skill.effects) {
        const effect = skill.effects; // Assuming skill.effects is a single object for this tooltip

        tooltipContent += `
            <hr><strong>Effect: ${effect.name !== undefined ? effect.name : 'Unnamed Effect'}</strong><br>
            ${effect.damageType !== undefined && effect.damageType !== 'none' ? `Damage Type: ${effect.damageType}<br>` : ''}
            ${effect.value !== undefined && effect.value !== 0 ? `Value: ${effect.value}<br>` : ''}
            ${effect.duration !== undefined && effect.duration !== 0 ? `Duration: ${effect.duration}s<br>` : ''}
            ${effect.stat ? `Stat: ${effect.stat}<br>` : ''}
            ${effect.subType ? `Type: ${effect.subType}<br>` : ''}
        `;
    }
    tooltip.innerHTML = tooltipContent;
}

export function updatePassiveSkillTooltip(tooltip, skill) {
    if (!tooltip || !skill) return;
    let tooltipContent = `
    <strong>${skill.name} (Lvl ${skill.level || 1})</strong> (Passive)<br>
    Description: ${skill.description}<br>
    ${skill.experience !== undefined ? `XP: ${skill.experience}/${skill.experienceToNextLevel}<br>` : ''}
`;
    let effectToDisplay = null;
    if (skill.effect) {
        effectToDisplay = skill.effect;
    } else if (skill.effects && !Array.isArray(skill.effects)) {
        effectToDisplay = skill.effects;
    } else if (skill.effects && Array.isArray(skill.effects) && skill.effects.length > 0) {
        effectToDisplay = skill.effects[0];
    }

    if (effectToDisplay) {
        tooltipContent += `
            <hr><strong>Effect: ${effectToDisplay.name || effectToDisplay.id || 'Unnamed Effect'}</strong><br>
            ${effectToDisplay.stat ? `Stat: ${effectToDisplay.stat}<br>` : ''}
            ${effectToDisplay.value !== undefined && effectToDisplay.value !== 0 ? `Value: ${effectToDisplay.value}<br>` : ''}
            ${effectToDisplay.subType ? `Type: ${effectToDisplay.subType}<br>` : ''}
            ${effectToDisplay.description ? `Effect Desc: ${effectToDisplay.description}<br>` : ''}
        `;
    }
    tooltip.innerHTML = tooltipContent;
}

export function updatePassiveSkillBar(skills) {
    for (let i = 0; i < 12; i++) {
        const skillElement = document.querySelector("#passiveSkill" + (i + 1));
        if (!skillElement) continue;

        const elementImg = skillElement.querySelector("img");
        const tooltip = skillElement.querySelector(".tooltip");

        if (!elementImg || !tooltip) continue;

        if (skills[i]) {
            skills[i].setElement(skillElement);
            elementImg.src = skills[i].icon;
            updatePassiveSkillTooltip(tooltip, skills[i]);
            skillElement.classList.remove('rainbow');
        } else {
            elementImg.src = "Media/UI/defaultSkill.jpeg";
            tooltip.innerHTML = "Empty Slot";
            skillElement.classList.remove('rainbow');
        }
    }
}

export function updateExp(member) {
    if (!member || !member.isHero) return; // Only for hero
    const expBar = document.querySelector('#level-progress-bar');
    if (!expBar) return;
    const expPercentage = Math.min(100, (member.experience / member.experienceToLevel) * 100) + '%';
    expBar.style.setProperty('width', expPercentage);

    const tooltip = expBar.querySelector('.tooltip-text'); // Corrected selector
    if (!tooltip) return;

    let statsText = '';
    if (member.statsPerLevel) {
        for (const [stat, value] of Object.entries(member.statsPerLevel)) {
            statsText += `${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${value} per level <br>`;
        }
    }
    tooltip.innerHTML = `EXP: ${member.experience} / ${member.experienceToLevel}<hr>${statsText}`;
}

export function updateExpBarText(string) {
    const classNameText = document.getElementById('class-name');
    if (classNameText) classNameText.textContent = string;
}

export function expBarTextAddGlow() { // Removed index, applies to the bar
    const expBar = document.getElementById('level-progress-bar');
    if (expBar) expBar.classList.add('glow');
}

export function expBarTextRemoveGlow() { // Removed index
    const expBar = document.getElementById('level-progress-bar');
    if (expBar) expBar.classList.remove('glow');
}

export function renderLevelProgress(member) {
    if (!member || !member.isHero) return;
    const progressBarContainer = document.getElementById('level-progress-container');
    const progressBar = document.getElementById('level-progress-bar');
    const classNameText = document.getElementById('class-name');
    if (!progressBarContainer || !progressBar || !classNameText) return;

    let tooltipText = progressBarContainer.querySelector('.tooltip-text');
    if (!tooltipText) { // Tooltip is child of container, not bar itself
        tooltipText = document.createElement('div');
        tooltipText.className = 'tooltip-text';
        progressBarContainer.appendChild(tooltipText);
    }

    let statsText = '';
    if (member.statsPerLevel) {
        for (const [stat, value] of Object.entries(member.statsPerLevel)) {
            statsText += `${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${value} per level <br>`;
        }
    }

    tooltipText.innerHTML = `EXP: ${member.experience} / ${member.experienceToLevel}<hr>${statsText}`;

    const progressPercentage = Math.min(100, (member.experience / member.experienceToLevel) * 100);
    progressBar.style.width = `${progressPercentage}%`;
    classNameText.textContent = `${member.classType} Level: ${member.level}`;
}

export function updateHealth(member) {
    if (!member || !member.element) return;
    const healthOverlay = member.element.querySelector('.health-overlay');
    if (!healthOverlay) return;
    const healthPercentage = (100 - (member.currentHealth / member.maxHealth) * 100) + '%';
    healthOverlay.style.setProperty('--health-percentage', healthPercentage);
    updateMemberTooltip(member); // Changed from updateTooltip to avoid conflict
}

export function updateMemberTooltip(member) { // Renamed from updateTooltip
    if (!member || !member.element) return;
    const tooltip = member.element.querySelector('.memberPortrait > .tooltip'); // More specific selector
    if (!tooltip) return;
    tooltip.innerHTML = `
        <strong>${member.name}</strong> (${member.classType} Lvl ${member.level})
        <p>Health: ${Math.round(member.currentHealth)}/${member.maxHealth}</p>
        <p>Mana: ${member.currentMana}/${member.stats.mana}</p>
        <p>Stamina: ${member.currentStamina}/${member.stats.stamina}</p>
    `;
}

export function updateMana(member) {
    if (!member || !member.element) return;
    const manaOverlay = member.element.querySelector('.mana-overlay');
    if (!manaOverlay) return;
    const manaPercentage = ((member.stats.mana > 0 ? member.currentMana / member.stats.mana : 0) * 100) + '%';
    manaOverlay.style.setProperty('--mana-percentage', manaPercentage);
    updateMemberTooltip(member);
}

export function updateStamina(member) {
    if (!member || !member.element) return;
    const staminaOverlay = member.element.querySelector('.stamina-overlay');
    if (!staminaOverlay) return;
    const staminaPercentage = ((member.stats.stamina > 0 ? member.currentStamina / member.stats.stamina : 0) * 100) + '%';
    staminaOverlay.style.setProperty('--stamina-percentage', staminaPercentage);
    updateMemberTooltip(member);
}

export function updateStatsDisplay(heroInstance) { // Renamed parameter
    const heroStatsDiv = document.getElementById('heroStats');
    const heroClassesDiv = document.getElementById('heroClasses'); // For class names
    if (!heroStatsDiv || !heroClassesDiv) return;

    // Display Classes
    heroClassesDiv.innerHTML = `<h2>Classes</h2>`;
    heroClassesDiv.innerHTML += `<p>${heroInstance.class.name || heroInstance.classType}</p>`;
    if (heroInstance.class2) heroClassesDiv.innerHTML += `<p>${heroInstance.class2.name}</p>`;
    if (heroInstance.class3) heroClassesDiv.innerHTML += `<p>${heroInstance.class3.name}</p>`;


    // Display Stats
    heroStatsDiv.innerHTML = `
        <h2>Statistics</h2>
        <p>Strength: <span id="heroStrength">${heroInstance.stats.strength}</span></p>
        <p>Speed: <span id="heroSpeed">${heroInstance.stats.speed}</span></p>
        <p>Dexterity: <span id="heroDexterity">${heroInstance.stats.dexterity}</span></p>
        <p>Vitality: <span id="heroVitality">${heroInstance.stats.vitality}</span></p>
        <p>Magic Power: <span id="heroMagicPower">${heroInstance.stats.magicPower}</span></p>
        <p>Mana: <span id="heroMana">${heroInstance.currentMana}/${heroInstance.stats.mana}</span></p>
        <p>Mana Regen: <span id="heroManaRegen">${heroInstance.stats.manaRegen}</span></p>
        <p>Magic Control: <span id="heroMagicControl">${heroInstance.stats.magicControl}</span></p>
        <p>Gold: <span id="heroGold">${heroInstance.gold}</span></p>
        <p>Armor: <span id="heroArmor">${heroInstance.stats.armor || 0}</span></p>
        <p>Dodge: <span id="heroDodge">${heroInstance.stats.dodge || 0}</span></p>
        <p>Accuracy: <span id="heroAccuracy">${heroInstance.stats.accuracy || 0}</span></p>
    `;

    // Call item related rendering
    renderHeroInventory(heroInstance);
    renderEquippedItems(heroInstance);
    renderWeaponSkills(heroInstance);
}

export function renderSkills(heroInstance) {
    const container = document.querySelector(`#activeSkills`);
    if (!container) return;
    container.innerHTML = '';
    const activeSkills = heroInstance.skills.filter(skill => skill.type === "active");
    activeSkills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.id = 'skill-box-' + skill.name.replace(/\s/g, ''); // Unique ID
        if (heroInstance.selectedSkills.find(s => s.id === skill.id)) {
            skillBox.classList.add('selected');
        }

        skillBox.innerHTML = `
            <img src="${skill.icon}" alt="${skill.name}">
            <span class="skill-name">${skill.name}</span>
            <select class="targeting-modes">
                ${skill.targetingModes.map(mode => `<option value="${mode}" ${skill.targetingMode === mode ? 'selected' : ''}>${mode}</option>`).join('')}
            </select>
            <div class="progressBar"><div class="progress" style="width: ${skill.experience / skill.experienceToNextLevel * 100}%"></div></div>
            <div class="tooltip"></div>
        `;
        const tooltip = skillBox.querySelector('.tooltip');
        updateSkillTooltip(tooltip, skill);

        const targetingSelect = skillBox.querySelector('.targeting-modes');
        skillBox.addEventListener('click', (event) => {
            if (event.target.tagName.toLowerCase() === 'select') return;
            skill.targetingMode = targetingSelect.value;
            heroInstance.selectSkill(skill, skillBox, false); // isPassive = false
            skillBox.classList.toggle('selected'); // Toggle selection visual
        });
        targetingSelect.addEventListener('change', () => {
            skill.targetingMode = targetingSelect.value;
            const selectedSkillInstance = heroInstance.selectedSkills.find(s => s.id === skill.id);
            if (selectedSkillInstance) selectedSkillInstance.targetingMode = targetingSelect.value;
        });
        skillBox.onmouseenter = (event) => showGeneralTooltip(event, tooltip); // Use general tooltip
        skillBox.onmouseleave = () => hideGeneralTooltip(tooltip);

        container.appendChild(skillBox);
    });
}

export function updateProgressBar(skill) {
    const progressBar = document.querySelector('#skill-box-' + skill.name.replace(/\s/g, '') + " .progress");
    if (!progressBar) return;
    const widthPercentage = (skill.experience / skill.experienceToNextLevel) * 100;
    progressBar.style.width = `${widthPercentage}%`;
}

export function renderPassiveSkills(heroInstance) {
    const container = document.querySelector(`#passiveSkills`);
    if (!container) return;
    container.innerHTML = '';
    const passiveSkills = heroInstance.skills.filter(skill => skill.type !== "active");
    passiveSkills.forEach(skill => {
        const skillBox = document.createElement('div');
        skillBox.className = 'skill-box';
        skillBox.id = 'skill-box-' + skill.name.replace(/\s/g, ''); // Unique ID
        if (heroInstance.selectedPassiveSkills.find(s => s.id === skill.id)) {
            skillBox.classList.add('selected');
        }

        skillBox.innerHTML = `
            <img src="${skill.icon}" alt="${skill.name}">
            <span class="skill-name">${skill.name}</span>
            <div class="progressBar"><div class="progress" style="width: ${skill.experience / skill.experienceToNextLevel * 100}%"></div></div>
            <div class="tooltip"></div>
        `;
        const tooltip = skillBox.querySelector('.tooltip');
        updatePassiveSkillTooltip(tooltip, skill);
        skillBox.addEventListener('click', () => {
            heroInstance.selectSkill(skill, skillBox, true); // isPassive = true
            skillBox.classList.toggle('selected'); // Toggle selection visual
        });
        skillBox.onmouseenter = (event) => showGeneralTooltip(event, tooltip); // Use general tooltip
        skillBox.onmouseleave = () => hideGeneralTooltip(tooltip);
        container.appendChild(skillBox);
    });
}

export function renderHero(member) { // For map portrait or general hero display
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member'; // Standard member class
    memberDiv.id = member.memberId; // Should be unique like "hero-map-display"

    let portraitDiv = createPortrait(member); // Uses member.class.portrait

    // Tooltip for the portrait itself (health, mana, stamina)
    const portraitTooltip = document.createElement('div');
    portraitTooltip.className = 'tooltip'; // General tooltip class for styling
    portraitDiv.appendChild(portraitTooltip); // Append to portraitDiv

    memberDiv.appendChild(portraitDiv);

    // Attach event listeners for the tooltip to the portraitDiv
    portraitDiv.addEventListener('mouseenter', (event) => {
        updateMemberTooltip(member); // Ensure tooltip content is up-to-date
        showGeneralTooltip(event, portraitTooltip);
    });
    portraitDiv.addEventListener('mouseleave', () => {
        hideGeneralTooltip(portraitTooltip);
    });

    member.element = memberDiv;
    updateMana(member); // Call to set initial bar values
    updateStamina(member);
    updateHealth(member);
    updateMemberTooltip(member); // Set initial tooltip content

    return memberDiv;
}


export function createPortrait(member) {
    const portraitDiv = document.createElement('div');
    portraitDiv.className = 'memberPortrait'; // This is the main container for portrait and bars

    const img = document.createElement('img');
    img.src = member.class.portrait || 'Media/UI/defaultPortrait.png'; // Fallback portrait
    img.alt = member.name;
    img.className = 'memberPortraitImage';

    const healthOverlay = document.createElement('div');
    healthOverlay.className = 'health-overlay';

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
    // Append bars next to or around the image as per member.css styling
    portraitDiv.appendChild(staminaBar); // Order might matter for flex/grid in CSS
    portraitDiv.appendChild(manaBar);

    return portraitDiv;
}

export function renderMember(member) { // For non-hero battle members
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member';
    memberDiv.id = member.memberId;

    const portraitDiv = createPortrait(member); // Re-use createPortrait

    const portraitDetailsDiv = document.createElement('div');
    portraitDetailsDiv.className = 'portrait-details-container';

    const detailsDiv = document.createElement('div'); // For skill icons
    detailsDiv.className = 'details-container';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';
    const skillsToShow = member.skills.slice(0, 6);
    const iconRow1 = document.createElement('div'); iconRow1.className = 'icon-row';
    const iconRow2 = document.createElement('div'); iconRow2.className = 'icon-row';

    skillsToShow.forEach((skill, i) => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'iconDiv';
        iconDiv.id = member.memberId + 'Skill' + skill.name.replace(/\s/g, '');
        const icon = document.createElement('img');
        icon.className = 'icon'; icon.src = skill.icon; icon.alt = skill.name;
        const tooltip = document.createElement('div'); tooltip.className = 'tooltip';
        if (skill.type === "passive") updatePassiveSkillTooltip(tooltip, skill);
        else updateSkillTooltip(tooltip, skill);
        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.className = 'cooldown-overlay hidden';
        iconDiv.appendChild(tooltip); iconDiv.appendChild(icon); iconDiv.appendChild(cooldownOverlay);
        if (i < 3) iconRow1.appendChild(iconDiv); else iconRow2.appendChild(iconDiv);
        iconDiv.onmouseenter = (event) => showGeneralTooltip(event, tooltip);
        iconDiv.onmouseleave = () => hideGeneralTooltip(tooltip);
    });
    if (iconRow1.hasChildNodes()) iconContainer.appendChild(iconRow1);
    if (iconRow2.hasChildNodes()) iconContainer.appendChild(iconRow2);
    if (iconContainer.hasChildNodes()) detailsDiv.appendChild(iconContainer);

    const portraitTooltip = document.createElement('div'); // Tooltip for the portrait itself
    portraitTooltip.className = 'tooltip';
    portraitDiv.appendChild(portraitTooltip); // Append to portraitDiv
    portraitDiv.onmouseenter = (event) => { updateMemberTooltip(member); showGeneralTooltip(event, portraitTooltip);};
    portraitDiv.onmouseleave = () => hideGeneralTooltip(portraitTooltip);


    portraitDetailsDiv.appendChild(portraitDiv);
    if (detailsDiv.hasChildNodes()) portraitDetailsDiv.appendChild(detailsDiv);
    memberDiv.appendChild(portraitDetailsDiv);

    const effectsElement = document.createElement('div');
    effectsElement.className = 'effects';
    memberDiv.appendChild(effectsElement);

    member.element = memberDiv;
    updateMana(member); updateStamina(member); updateHealth(member); updateMemberTooltip(member);
    return memberDiv;
}

export function renderLevelUp(skillOrMember) { // Can be skill or member level up
    const battlefield = document.querySelector(`#battlefield`); // Or a more general game container
    if (!battlefield) return;
    const levelUpContainer = document.createElement('div');
    levelUpContainer.className = 'levelUpContainer'; // Needs CSS for styling and animation
    let message = "";
    if (skillOrMember.baseDamage !== undefined) { // It's a skill
        message = `<span>Your</span> <span>${skillOrMember.name}</span> <span>is level ${skillOrMember.level} now!</span>`;
    } else { // It's a member (hero)
        message = `<span>${skillOrMember.name}</span> <span>reached level ${skillOrMember.level}!</span>`;
    }
    levelUpContainer.innerHTML = `<h1 class="levelUpTitle">${message}</h1>
                                  <div class="firework"></div><div class="firework"></div><div class="firework"></div>`;
    levelUpContainer.addEventListener('animationend', () => levelUpContainer.remove(), { once: true });
    battlefield.appendChild(levelUpContainer);
}

export function openEvolutionModal(heroInstance) {
    const modal = document.getElementById('evolution-modal');
    const evolutionOptionsDiv = document.getElementById('evolution-options');
    if (!modal || !evolutionOptionsDiv) return;
    evolutionOptionsDiv.innerHTML = '';

    heroInstance.availableClasses.forEach((evolution, index) => {
        const evolutionDiv = document.createElement('div');
        evolutionDiv.className = 'evolution-option';
        evolutionDiv.innerHTML = `<h3>${evolution.name}</h3><p>${evolution.description}</p>`;
        evolutionDiv.addEventListener('click', () => {
            // selectEvolution(index); // This should call a method on evolutionService or hero
            console.log("Evolution selected:", evolution.name); // Placeholder
            closeEvolutionModal();
        });
        evolutionOptionsDiv.appendChild(evolutionDiv);
    });
    modal.style.display = 'block';
}

export function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    if (Array.isArray(obj)) return obj.map(item => deepCopy(item));
    const copy = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }
    return copy;
}

function closeEvolutionModal() {
    const modal = document.getElementById('evolution-modal');
    if (modal) modal.style.display = 'none';
}

// --- ITEM RELATED RENDERING ---
export function renderHeroInventory(heroInstance) {
    const inventoryGrid = document.querySelector("#inventory .iconGrid");
    if (!inventoryGrid) return;

    // Get all predefined inventory slots
    const predefinedSlots = Array.from(inventoryGrid.querySelectorAll('.inventorySlot'));
    inventoryGrid.innerHTML = ''; // Clear grid to re-add predefined slots first

    // Re-add predefined slots to ensure their order and that they are clean
    predefinedSlots.forEach(slot => {
        slot.innerHTML = ''; // Clear content
        delete slot.dataset.itemId;
        delete slot.dataset.itemSource;
        slot.draggable = false;
        slot.removeEventListener('dragstart', handleDragStart); // Remove old listeners
        slot.removeEventListener('dragover', handleDragOver);
        slot.removeEventListener('drop', handleDrop);
        slot.onmouseenter = null;
        slot.onmouseleave = null;

        // Always allow dropping onto empty inventory slots
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        inventoryGrid.appendChild(slot);
    });


    heroInstance.inventory.forEach((item, index) => {
        let slotDiv;
        if (index < predefinedSlots.length) {
            slotDiv = predefinedSlots[index]; // Use a predefined slot
        } else {
            // This case should ideally not happen if inventory size <= predefined slots
            // If it can, you'd create a new div and append it.
            console.warn("More items in inventory than predefined slots. Item not rendered:", item.name);
            return;
        }

        slotDiv.dataset.itemId = item.id;
        slotDiv.dataset.itemSource = "inventory";
        slotDiv.draggable = true;

        const img = document.createElement('img');
        img.src = item.icon;
        img.alt = item.name;
        img.style.width = "45px"; img.style.height = "45px";
        img.draggable = false;

        const tooltip = createItemTooltipElement(item);
        slotDiv.appendChild(img);
        slotDiv.appendChild(tooltip);

        slotDiv.addEventListener('dragstart', handleDragStart);
        // dragover and drop are already on the slot from above

        slotDiv.onmouseenter = (event) => showGeneralTooltip(event, tooltip);
        slotDiv.onmouseleave = () => hideGeneralTooltip(tooltip);
    });
}

export function renderEquippedItems(heroInstance) {
    for (const slotId in heroInstance.equipment) {
        const slotElement = document.getElementById(slotId);
        if (slotElement) {
            slotElement.innerHTML = '';
            delete slotElement.dataset.itemId;
            delete slotElement.dataset.itemSource;
            slotElement.dataset.slotId = slotId; // Keep this to identify the slot
            slotElement.draggable = false;
            slotElement.removeEventListener('dragstart', handleDragStart);
            slotElement.onmouseenter = null;
            slotElement.onmouseleave = null;


            const item = heroInstance.equipment[slotId];
            if (item) {
                slotElement.dataset.itemId = item.id;
                slotElement.dataset.itemSource = "equipped";
                slotElement.draggable = true;

                const img = document.createElement('img');
                img.src = item.icon; img.alt = item.name;
                img.style.width = "50px"; img.style.height = "50px";
                img.draggable = false;

                const tooltip = createItemTooltipElement(item);
                slotElement.appendChild(img);
                slotElement.appendChild(tooltip);

                slotElement.addEventListener('dragstart', handleDragStart);
                slotElement.onmouseenter = (event) => showGeneralTooltip(event, tooltip);
                slotElement.onmouseleave = () => hideGeneralTooltip(tooltip);
            }
            // Always allow dropping onto equipment slots
            slotElement.addEventListener('dragover', handleDragOver);
            slotElement.addEventListener('drop', handleDrop);
        }
    }
}

export function createItemTooltipElement(item) {
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.style.minWidth = '200px'; tooltip.style.textAlign = 'left';
    tooltip.style.display = 'none';

    let content = `<strong>${item.name}</strong> (${item.rarity})<br>`;
    content += `<em>Type: ${item.type}, Slot: ${item.slot.replace('Slot','')}</em><br>`;
    if (item.value > 0) content += `Value: ${item.value}g<br>`;
    content += `Description: ${item.description}<br>`;

    if (Object.keys(item.stats).length > 0) {
        content += "<hr><strong>Stats:</strong><br>";
        for (const stat in item.stats) {
            content += `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${item.stats[stat] > 0 ? '+' : ''}${item.stats[stat]}<br>`;
        }
    }
    if (item.effects && item.effects.length > 0) {
        content += "<hr><strong>Effects:</strong><br>";
        item.effects.forEach(eff => {
            content += `- ${eff.name || eff.subType}: ${eff.value || ''} ${eff.stat || ''} (Dur: ${eff.duration}s)<br>`;
        });
    }
    if (item.weaponSkills && item.weaponSkills.length > 0) {
        content += "<hr><strong>Grants Skills:</strong><br>";
        item.weaponSkills.forEach(skill => { content += `- ${skill.name}<br>`; });
    }
    tooltip.innerHTML = content;
    return tooltip;
}

export function renderWeaponSkills(heroInstance) {
    const weaponSkillsContainer = document.getElementById('heroWeaponSkills');
    if (!weaponSkillsContainer) return;
    weaponSkillsContainer.innerHTML = '<h2>Weapon Skills</h2>';

    const skillsGrid = document.createElement('div');
    skillsGrid.style.display = 'grid';
    skillsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    skillsGrid.style.gap = '10px';

    let hasWeaponSkills = false;
    if (heroInstance.equipment.weaponSlot && heroInstance.equipment.weaponSlot.weaponSkills.length > 0) {
        heroInstance.equipment.weaponSlot.weaponSkills.forEach(skill => {
            hasWeaponSkills = true;
            const skillBox = document.createElement('div');
            skillBox.classList.add('skill-box'); // Re-use general skill box styling
            skillBox.style.cursor = 'default'; // Not clickable for selection here

            const img = document.createElement('img');
            img.src = skill.icon; img.alt = skill.name;
            img.style.width = '30px'; img.style.height = '30px';

            const nameP = document.createElement('p');
            nameP.textContent = skill.name; nameP.style.fontSize = '12px';

            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');
            updateSkillTooltip(tooltip, skill); // Use existing skill tooltip updater

            skillBox.appendChild(img); skillBox.appendChild(nameP); skillBox.appendChild(tooltip);
            skillBox.onmouseenter = (event) => showGeneralTooltip(event, tooltip);
            skillBox.onmouseleave = () => hideGeneralTooltip(tooltip);
            skillsGrid.appendChild(skillBox);
        });
    }
    if (!hasWeaponSkills) {
        const noSkillsP = document.createElement('p');
        noSkillsP.textContent = "No weapon skills to display.";
        skillsGrid.appendChild(noSkillsP);
    }
    weaponSkillsContainer.appendChild(skillsGrid);
}

// --- DRAG AND DROP HANDLERS ---
let draggedItem = null;
let draggedItemElement = null;

function handleDragStart(event) {
    // Ensure 'hero' is accessible, e.g., by importing it from initialize.js
    if (!hero) {
        console.warn("DragStart: Hero instance not available.");
        event.preventDefault();
        return;
    }

    draggedItemElement = event.target; // The div being dragged (.inventorySlot or .slot)
    const itemId = draggedItemElement.dataset.itemId;
    const itemSource = draggedItemElement.dataset.itemSource;

    if (!itemId) {
        console.warn("DragStart: No itemId found on dragged element.", draggedItemElement);
        event.preventDefault();
        return;
    }

    // Reset draggedItem for safety at the start of a new drag
    draggedItem = null;

    if (itemSource === "inventory") {
        draggedItem = hero.inventory.find(item => item.id === itemId);
    } else if (itemSource === "equipped") {
        for (const slotKey in hero.equipment) { // slotKey is "weaponSlot", "helmetSlot", etc.
            if (hero.equipment[slotKey] && hero.equipment[slotKey].id === itemId) {
                draggedItem = hero.equipment[slotKey];
                break;
            }
        }
    }

    if (draggedItem) {
        event.dataTransfer.setData('text/plain', itemId); // Store item ID
        event.dataTransfer.effectAllowed = 'move';

        const imgElement = draggedItemElement.querySelector('img');
        if (imgElement) {
            // Use the actual image element as the drag image
            // Center the drag image relative to the cursor: (offsetX, offsetY)
            event.dataTransfer.setDragImage(imgElement, imgElement.offsetWidth / 2, imgElement.offsetHeight / 2);
        } else {
            // Fallback if no image, or prevent drag. For now, let browser decide (original problematic state for this case)
            console.warn("DragStart: No img element found in dragged item slot to use for setDragImage.", draggedItemElement);
        }

        // setTimeout(() => { draggedItemElement.classList.add('dragging'); }, 0); // Optional visual feedback
    } else {
        console.warn(`DragStart: Item with ID ${itemId} from ${itemSource} not found in hero's data or draggedItemElement issue.`);
        event.preventDefault();
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function handleDrop(event) {
    event.preventDefault();
    if (!draggedItem || !hero) return;

    // if (draggedItemElement) draggedItemElement.classList.remove('dragging'); // Optional visual

    const targetElement = event.currentTarget; // The slot where item is dropped
    const targetSlotId = targetElement.dataset.slotId || targetElement.id; // e.g., "weaponSlot" or "inventory_0"

    const sourceIsEquipped = draggedItemElement.dataset.itemSource === "equipped";
    const sourceSlotIdIfEquipped = sourceIsEquipped ? draggedItemElement.id : null;

    // Case 1: Dropping onto an equipment slot (Paper Doll)
    if (hero.equipment.hasOwnProperty(targetSlotId)) { // Check if targetSlotId is a valid equipment slot key
        if (draggedItem.slot === targetSlotId) { // Item's designated slot matches target
             // If item came from another equipment slot, unequip it first (it will go to inventory)
            if (sourceIsEquipped && sourceSlotIdIfEquipped !== targetSlotId) {
                 hero.unequipItem(sourceSlotIdIfEquipped, true); // true to move to inventory
            }
            hero.equipItem(draggedItem, targetSlotId); // equipItem removes from inventory
        } else {
            console.warn(`Item ${draggedItem.name} (slot: ${draggedItem.slot}) cannot be placed in equipment slot ${targetSlotId}.`);
        }
    }
    // Case 2: Dropping onto an inventory slot (or general inventory area)
    else if (targetElement.classList.contains('inventorySlot') || targetElement.closest('#inventory .iconGrid')) {
        if (sourceIsEquipped) { // Item came from equipment
            hero.unequipItem(sourceSlotIdIfEquipped, true); // true to move to inventory
        }
        // If item came from inventory and dropped on inventory, no specific action for now (reordering not implemented)
        // The item is already in inventory. If it was dragged from one inv slot to another,
        // renderHeroInventory will redraw it in its current position.
    } else {
        console.warn("Item dropped on an invalid target area.");
    }

    draggedItem = null;
    draggedItemElement = null;
    // UI updates are handled by equipItem/unequipItem -> updateStatsDisplay -> renderHeroInventory/EquippedItems
}


// --- GENERAL TOOLTIP FUNCTIONS (for items, skills in hero sheet, etc.) ---
export function showGeneralTooltip(event, tooltipElement) {
    if (!tooltipElement || !tooltipElement.innerHTML.trim()) return;

    tooltipElement.style.display = 'block';
    tooltipElement.style.visibility = 'hidden'; // Calculate size first

    // Position tooltip near mouse
    let x = event.clientX + 15;
    let y = event.clientY + 15;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const tooltipRect = tooltipElement.getBoundingClientRect();

    if (x + tooltipRect.width > screenWidth - 5) { // 5px buffer
        x = event.clientX - tooltipRect.width - 15;
    }
    if (y + tooltipRect.height > screenHeight - 5) { // 5px buffer
        y = event.clientY - tooltipRect.height - 15;
    }
    if (x < 5) x = 5; // 5px buffer
    if (y < 5) y = 5; // 5px buffer

    tooltipElement.style.left = `${x}px`;
    tooltipElement.style.top = `${y}px`;
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.zIndex = '10001'; // Ensure above other UI
    tooltipElement.style.visibility = 'visible';
    tooltipElement.style.opacity = '1';
}

export function hideGeneralTooltip(tooltipElement) {
    if (tooltipElement) {
        tooltipElement.style.display = 'none';
        tooltipElement.style.visibility = 'hidden';
        tooltipElement.style.opacity = '0';
    }
}

// Original showTooltip - for battle skill bar, member portraits in battle
export function showTooltip(event, contentElement) {
    if (!contentElement || !contentElement.innerHTML.trim()) return;

    const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff');
    if (!target) return;

    contentElement.style.display = 'block';
    contentElement.style.visibility = 'hidden';

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = contentElement.getBoundingClientRect(); // Measure after display block
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let top = 0;
    let left = 0;

    // Default above and centered
    top = targetRect.top - tooltipRect.height - 10;
    left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

    if (target.classList.contains('battleSkillIcon')) { // Skills in bottom bar
        // Already default: above
    } else if (target.classList.contains('iconDiv')) { // Skills on battle members
        // Default: above
    } else if (target.classList.contains('buff') || target.classList.contains('debuff')) {
        top = targetRect.bottom + 5; // Below the effect icon
    } else if (target.classList.contains('memberPortrait')) {
        // Default: above
    }


    // Adjust if off-screen
    if (left + tooltipRect.width > viewportWidth - 5) left = viewportWidth - tooltipRect.width - 5;
    if (left < 5) left = 5;
    if (top < 5) { // If not enough space above, try below
        top = targetRect.bottom + 10;
        if (top + tooltipRect.height > viewportHeight - 5) { // If still no space, adjust
            top = viewportHeight - tooltipRect.height - 5;
        }
    } else if (top + tooltipRect.height > viewportHeight -5 ){
         top = viewportHeight - tooltipRect.height - 5;
    }


    contentElement.style.top = `${top}px`;
    contentElement.style.left = `${left}px`;
    contentElement.style.visibility = 'visible';
    contentElement.style.position = 'fixed';
    contentElement.style.zIndex = '10001';
    // contentElement.style.overflow = 'visible'; // Not needed for tooltip div
}

export function updateHeroMapStats(heroInstance) { // For the hero display on the map
    const mapHeroContainer = document.getElementById('hero-portrait-container');
    if (!mapHeroContainer || !heroInstance) return;

    // Assuming renderHero(heroInstance) was already called to create the initial structure inside mapHeroContainer
    const healthOverlay = mapHeroContainer.querySelector('.health-overlay');
    const manaOverlay = mapHeroContainer.querySelector('.mana-overlay');
    const staminaOverlay = mapHeroContainer.querySelector('.stamina-overlay');
    const portraitTooltip = mapHeroContainer.querySelector('.memberPortrait > .tooltip'); // Tooltip is child of .memberPortrait

    if (healthOverlay) {
        const healthPercentage = (100 - (heroInstance.currentHealth / heroInstance.maxHealth) * 100) + '%';
        healthOverlay.style.setProperty('--health-percentage', healthPercentage);
    }
    if (manaOverlay) {
        const manaPercentage = ((heroInstance.stats.mana > 0 ? heroInstance.currentMana / heroInstance.stats.mana : 0) * 100) + '%';
        manaOverlay.style.setProperty('--mana-percentage', manaPercentage);
    }
    if (staminaOverlay) {
        const staminaPercentage = ((heroInstance.stats.stamina > 0 ? heroInstance.currentStamina / heroInstance.stats.stamina : 0) * 100) + '%';
        staminaOverlay.style.setProperty('--stamina-percentage', staminaPercentage);
    }
    if (portraitTooltip) { // Update the tooltip content
        portraitTooltip.innerHTML = `
            <strong>${heroInstance.name}</strong> (${heroInstance.classType} Lvl ${heroInstance.level})<br>
            Health: ${Math.round(heroInstance.currentHealth)}/${heroInstance.maxHealth}<br>
            Mana: ${heroInstance.currentMana}/${heroInstance.stats.mana}<br>
            Stamina: ${heroInstance.currentStamina}/${heroInstance.stats.stamina}<br>
            Gold: ${heroInstance.gold} <!-- Added Gold -->
        `;
    }
    // Gold display if there's a specific span for it on map view (not in current structure)
    // const goldSpan = mapHeroContainer.querySelector('#hero-map-gold-display'); // Example ID
    // if (goldSpan) goldSpan.textContent = heroInstance.gold;
}