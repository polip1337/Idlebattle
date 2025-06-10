// Render.js
import Item from './item.js'; // Assuming Item.js is in the same directory
import { hero,battleLog } from './initialize.js'; // To access hero instance for drag/drop

export function updateSkillBar(skills) {
    // Cache DOM elements and create a document fragment
    const fragment = document.createDocumentFragment();
    const skillElements = new Array(12);
    
    // Pre-fetch all skill elements
    for (let i = 0; i < 12; i++) {
        skillElements[i] = document.querySelector("#skill" + (i + 1));
    }

    // Process each skill slot
    for (let i = 0; i < 12; i++) {
        const skillElement = skillElements[i];
        if (!skillElement) continue;

        const elementImg = skillElement.querySelector("img");
        const tooltip = skillElement.parentElement.querySelector(".tooltip");
        if (!elementImg || !tooltip) continue;

        // Remove old event listeners more efficiently
        const newSkillElement = skillElement.cloneNode(true);
        skillElement.parentNode.replaceChild(newSkillElement, skillElement);
        skillElement = newSkillElement;

        if (skills[i]) {
            const currentSkill = skills[i];
            currentSkill.setElement(skillElement);
            elementImg.src = currentSkill.icon;

            skillElement.onmouseenter = (event) => {
                // Ensure tooltip content is up-to-date before showing
                if (currentSkill.type === "passive") {
                    updatePassiveSkillTooltip(tooltip, currentSkill);
                } else {
                    updateSkillTooltip(tooltip, currentSkill);
                }
                showGeneralTooltip(event, tooltip); // Use general tooltip for mouse following
            };
            skillElement.onmouseleave = () => hideGeneralTooltip(tooltip);

            if (currentSkill.type === "passive") {
                updatePassiveSkillTooltip(tooltip, currentSkill);
                skillElement.classList.remove('rainbow');
            } else if (currentSkill.type === "active") {
                updateSkillTooltip(tooltip, currentSkill);

                // Optimize double-click handler
                skillElement.addEventListener('dblclick', () => {
                    currentSkill.repeat = !currentSkill.repeat;
                    skillElement.classList.toggle('rainbow', currentSkill.repeat);
                });

                // Optimize click handler
                skillElement.addEventListener('click', () => {
                    if (!hero) return;

                    if (!currentSkill.onCooldown && !currentSkill.repeat) {
                        if (currentSkill.manaCost <= hero.currentMana && currentSkill.staminaCost <= hero.currentStamina) {
                            currentSkill.useSkill(hero);
                        } else if (battleLog?.log) {
                            battleLog.log(`Not enough resources to use ${currentSkill.name}.`);
                        }
                    } else if (currentSkill.onCooldown && battleLog?.log) {
                        battleLog.log(`${currentSkill.name} is on cooldown.`);
                    }
                });

                // Set initial rainbow state
                skillElement.classList.toggle('rainbow', currentSkill.repeat);
            }
        } else {
            elementImg.src = "Media/UI/defaultSkill.jpeg";
            tooltip.innerHTML = "Empty Slot";
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
    ${skill.experience !== undefined && skill.div && skill.div.closest('#team1') ? `XP: ${skill.experience}/${skill.experienceToNextLevel}<br>` : ''}
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
    ${skill.experience !== undefined && skill.div && skill.div.closest('#team1') ? `XP: ${skill.experience}/${skill.experienceToNextLevel}<br>` : ''}
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
    renderBattleConsumableBar(heroInstance);

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
        if (heroInstance.selectedSkills.find(s => s && s.id === skill.id)) { // MODIFIED THIS LINE
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
        });
        targetingSelect.addEventListener('change', () => {
            skill.targetingMode = targetingSelect.value;
            const selectedSkillInstance = heroInstance.selectedSkills.find(s => s && s.id === skill.id); // Check s for null
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
        if (heroInstance.selectedPassiveSkills.find(s => s && s.id === skill.id)) { // MODIFIED THIS LINE
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
            // skillBox.classList.toggle('selected'); // selectSkill will handle adding/removing 'selected' class
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
    const effectsElement = document.createElement('div');
    effectsElement.className = 'effects';
    memberDiv.appendChild(effectsElement);

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
    img.src = 'Media/default_portrait.png';
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
        icon.className = 'icon';
        // Check if the icon exists by attempting to load it, fallback if error
        icon.src = skill.icon;
        icon.alt = skill.name;
        icon.onerror = function() {
            if (icon.src !== 'Media/UI/defaultSkill.jpeg' && icon.src !== '@defaultSkill.jpeg') {
                console.warn(`Missing skill icon for skill: ${skill.name} (icon: ${skill.icon}) for member: ${member.name}`);
                icon.src = 'Media/UI/defaultSkill.jpeg';
            }
        };
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

    memberDiv.addEventListener('dragover', handleDragOver); // Allow drop
        memberDiv.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation(); // Prevent event from bubbling to other general drop handlers

            if (!draggedItem || !hero || draggedItemElement.dataset.itemSource !== "battleConsumableBar") {
                console.warn("Drop on member: Invalid dragged item or source is not battleConsumableBar.");
                draggedItem = null; draggedItemElement = null; // Clean up drag state
                return;
            }

            const itemToUse = draggedItem; // Item instance from handleDragStart
            const sourceSlotIndex = parseInt(draggedItemElement.dataset.slotIndex);

            if (itemToUse && itemToUse.type === "consumable" && !isNaN(sourceSlotIndex)) {
                console.log(`Attempting to use ${itemToUse.name} from battle bar (slot ${sourceSlotIndex}) on ${member.name}`);
                hero.useConsumableFromToolbar(sourceSlotIndex, member); // 'member' is the target instance
            } else {
                console.warn("Drop on member: Dragged item is not a consumable, or slot index invalid.");
            }

            // Clean up drag state after handling the drop
            draggedItem = null;
            draggedItemElement = null;
        });
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
            }else {
                 if (slotElement.dataset.item) {
                     const placeholderTextContent = slotElement.dataset.item;
                     if (placeholderTextContent) {
                         const placeholderText = document.createElement('span');
                         placeholderText.className = 'slot-placeholder-text';
                         placeholderText.textContent = placeholderTextContent;
                         slotElement.appendChild(placeholderText);
                     }
                 }
                 slotElement.draggable = false;
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

// Cache for frequently accessed elements
const dragDropCache = {
    hero: null,
    equipment: null,
    inventory: null,
    consumableToolbar: null
};

function updateDragDropCache(heroInstance) {
    if (!heroInstance) return;
    dragDropCache.hero = heroInstance;
    dragDropCache.equipment = heroInstance.equipment;
    dragDropCache.inventory = heroInstance.inventory;
    dragDropCache.consumableToolbar = heroInstance.consumableToolbar;
}

function handleDragStart(event) {
    if (!dragDropCache.hero) {
        console.warn("DragStart: Hero instance not available.");
        event.preventDefault();
        return;
    }

    draggedItemElement = event.target;
    const itemId = draggedItemElement.dataset.itemId;
    const itemSource = draggedItemElement.dataset.itemSource;

    if (!itemId) {
        console.warn("DragStart: No itemId found on dragged element.");
        event.preventDefault();
        return;
    }

    // Find the dragged item using the cache
    draggedItem = null;
    switch (itemSource) {
        case "inventory":
            draggedItem = dragDropCache.inventory.find(item => item.id === itemId);
            break;
        case "equipped":
            for (const slotKey in dragDropCache.equipment) {
                if (dragDropCache.equipment[slotKey]?.id === itemId) {
                    draggedItem = dragDropCache.equipment[slotKey];
                    break;
                }
            }
            break;
        case "battleConsumableBar":
            const slotIndex = parseInt(draggedItemElement.dataset.slotIndex);
            if (!isNaN(slotIndex) && dragDropCache.consumableToolbar[slotIndex]?.id === itemId) {
                draggedItem = dragDropCache.consumableToolbar[slotIndex];
            }
            break;
    }

    if (draggedItem) {
        event.dataTransfer.setData('text/plain', itemId);
        event.dataTransfer.effectAllowed = 'move';

        const imgElement = draggedItemElement.querySelector('img');
        if (imgElement) {
            event.dataTransfer.setDragImage(imgElement, imgElement.offsetWidth / 2, imgElement.offsetHeight / 2);
        }
    } else {
        console.warn(`DragStart: Item with ID ${itemId} from ${itemSource} not found.`);
        event.preventDefault();
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function handleDrop(event) {
    event.preventDefault();
    if (!draggedItem || !dragDropCache.hero) return;

    const targetElement = event.currentTarget;
    const targetSlotType = getTargetSlotType(targetElement);
    const targetSlotId = targetElement.dataset.slotId || targetElement.id;
    const targetSlotIndex = parseInt(targetElement.dataset.slotIndex);
    const sourceItemSource = draggedItemElement.dataset.itemSource;

    // Handle battle consumable bar restrictions
    if (sourceItemSource === "battleConsumableBar" && 
        !["inventory", "battleConsumableSlot"].includes(targetSlotType)) {
        console.log("Items from battle bar can only be dropped into inventory or other battle bar slots.");
        cleanupDragState();
        return;
    }

    // Process the drop based on target type
    switch (targetSlotType) {
        case "equipment":
            handleEquipmentDrop(targetSlotId, sourceItemSource);
            break;
        case "inventory":
            handleInventoryDrop(sourceItemSource);
            break;
        case "battleConsumableSlot":
            handleConsumableBarDrop(targetSlotIndex, sourceItemSource);
            break;
        default:
            if (targetElement.classList.contains('member') && sourceItemSource === "battleConsumableBar") {
                handleMemberDrop(targetElement);
            } else {
                console.warn("Item dropped on an unrecognized or invalid target area.");
            }
    }

    cleanupDragState();
}

function getTargetSlotType(element) {
    return element.dataset.slotType ||
           (element.classList.contains('inventorySlot') && !element.classList.contains('battle-consumable-slot') ? 'inventory' : null) ||
           (element.id && dragDropCache.hero.equipment.hasOwnProperty(element.id) ? 'equipment' : null);
}

function handleEquipmentDrop(targetSlotId, sourceItemSource) {
    if (draggedItem.type === "consumable") {
        console.warn("Cannot equip a consumable item to an equipment slot.");
        return;
    }

    if (draggedItem.slot === targetSlotId) {
        if (sourceItemSource === "equipped" && draggedItemElement.id !== targetSlotId) {
            dragDropCache.hero.unequipItem(draggedItemElement.id, true);
        } else if (sourceItemSource === "battleConsumableBar") {
            console.warn("Consumables from bar cannot be equipped to equipment slots.");
            return;
        }
        dragDropCache.hero.equipItem(draggedItem, targetSlotId);
    } else {
        console.warn(`Item ${draggedItem.name} (slot: ${draggedItem.slot}) cannot be placed in equipment slot ${targetSlotId}.`);
    }
}

function handleInventoryDrop(sourceItemSource) {
    if (sourceItemSource === "equipped") {
        dragDropCache.hero.unequipItem(draggedItemElement.id, true);
    } else if (sourceItemSource === "battleConsumableBar") {
        const slotIndex = parseInt(draggedItemElement.dataset.slotIndex);
        if (!isNaN(slotIndex)) {
            dragDropCache.hero.unequipConsumable(slotIndex, true);
        }
    }
}

function handleConsumableBarDrop(targetSlotIndex, sourceItemSource) {
    if (draggedItem.type !== "consumable") {
        console.warn(`Cannot place non-consumable item ${draggedItem.name} in consumable toolbar.`);
        return;
    }

    if (sourceItemSource === "inventory") {
        dragDropCache.hero.equipConsumable(draggedItem, targetSlotIndex);
    } else if (sourceItemSource === "battleConsumableBar") {
        const sourceSlotIndex = parseInt(draggedItemElement.dataset.slotIndex);
        if (!isNaN(sourceSlotIndex) && sourceSlotIndex !== targetSlotIndex) {
            swapConsumableSlots(sourceSlotIndex, targetSlotIndex);
        }
    }
}

function swapConsumableSlots(sourceIndex, targetIndex) {
    const itemBeingDragged = dragDropCache.consumableToolbar[sourceIndex];
    dragDropCache.consumableToolbar[sourceIndex] = null;
    const itemInTargetSlot = dragDropCache.consumableToolbar[targetIndex];
    dragDropCache.consumableToolbar[targetIndex] = itemBeingDragged;
    if (itemInTargetSlot) {
        dragDropCache.consumableToolbar[sourceIndex] = itemInTargetSlot;
    }
    renderBattleConsumableBar(dragDropCache.hero);
}

function handleMemberDrop(memberElement) {
    const sourceSlotIndex = parseInt(draggedItemElement.dataset.slotIndex);
    if (!isNaN(sourceSlotIndex)) {
        dragDropCache.hero.useConsumableFromToolbar(sourceSlotIndex, memberElement);
    }
}

function cleanupDragState() {
    draggedItem = null;
    draggedItemElement = null;
}

// --- GENERAL TOOLTIP FUNCTIONS ---
const tooltipCache = {
    lastTooltip: null,
    lastEvent: null,
    debounceTimer: null
};

export function showGeneralTooltip(event, tooltipElement) {
    if (!tooltipElement || !tooltipElement.innerHTML.trim()) return;

    // Cache the current tooltip and event
    tooltipCache.lastTooltip = tooltipElement;
    tooltipCache.lastEvent = event;

    // Debounce tooltip updates
    if (tooltipCache.debounceTimer) {
        clearTimeout(tooltipCache.debounceTimer);
    }

    tooltipCache.debounceTimer = setTimeout(() => {
        const tooltip = tooltipCache.lastTooltip;
        const evt = tooltipCache.lastEvent;
        
        if (!tooltip || !evt) return;

        tooltip.style.display = 'block';
        tooltip.style.visibility = 'hidden';

        // Calculate position
        const { x, y } = calculateTooltipPosition(evt, tooltip);
        
        // Apply position
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '10001';
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
    }, 50); // 50ms debounce
}

function calculateTooltipPosition(event, tooltip) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let x = event.clientX + 15;
    let y = event.clientY + 15;

    // Adjust if tooltip would go off screen
    if (x + tooltipRect.width > screenWidth - 5) {
        x = event.clientX - tooltipRect.width - 15;
    }
    if (y + tooltipRect.height > screenHeight - 5) {
        y = event.clientY - tooltipRect.height - 15;
    }
    
    // Ensure tooltip stays within screen bounds
    x = Math.max(5, Math.min(x, screenWidth - tooltipRect.width - 5));
    y = Math.max(5, Math.min(y, screenHeight - tooltipRect.height - 5));

    return { x, y };
}

export function hideGeneralTooltip(tooltipElement) {
    if (!tooltipElement) return;
    
    // Clear any pending tooltip updates
    if (tooltipCache.debounceTimer) {
        clearTimeout(tooltipCache.debounceTimer);
        tooltipCache.debounceTimer = null;
    }

    // Clear cache if this is the last shown tooltip
    if (tooltipCache.lastTooltip === tooltipElement) {
        tooltipCache.lastTooltip = null;
        tooltipCache.lastEvent = null;
    }

    tooltipElement.style.display = 'none';
    tooltipElement.style.visibility = 'hidden';
    tooltipElement.style.opacity = '0';
}

// Original showTooltip - for battle skill bar, member portraits in battle
export function showTooltip(event, contentElement) {
    if (!contentElement || !contentElement.innerHTML.trim()) return;

    const target = event.target.closest('.memberPortrait, .iconDiv, .battleSkillIcon, .buff, .debuff');
    if (!target) return;

    contentElement.style.display = 'block';
    contentElement.style.visibility = 'hidden';

    const { x, y } = calculateBattleTooltipPosition(event, target, contentElement);
    
    contentElement.style.top = `${y}px`;
    contentElement.style.left = `${x}px`;
    contentElement.style.visibility = 'visible';
    contentElement.style.position = 'fixed';
    contentElement.style.zIndex = '10001';
}

function calculateBattleTooltipPosition(event, target, tooltip) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default position above and centered
    let x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    let y = targetRect.top - tooltipRect.height - 10;

    // Adjust position based on target type
    if (target.classList.contains('buff') || target.classList.contains('debuff')) {
        y = targetRect.bottom + 5;
    }

    // Ensure tooltip stays within viewport
    x = Math.max(5, Math.min(x, viewportWidth - tooltipRect.width - 5));
    
    if (y < 5) {
        y = targetRect.bottom + 10;
        if (y + tooltipRect.height > viewportHeight - 5) {
            y = viewportHeight - tooltipRect.height - 5;
        }
    } else if (y + tooltipRect.height > viewportHeight - 5) {
        y = viewportHeight - tooltipRect.height - 5;
    }

    return { x, y };
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
}