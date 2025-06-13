import { hero } from './initialize.js'; // Access the global hero instance

let draggedMember = null; // Store the actual Companion or Hero instance being dragged
let draggedElement = null; // Store the DOM element being dragged (e.g., the img inside the slot)

export function initializeCompanionUI() {
    if (hero) {
        renderCompanionRoster(hero);
        renderCompanionPartyFormation(hero);
        displayCompanionDetails(null); // Default: display no companion details
    }
    // setupDragAndDropListeners(); // Called by renderCompanionPartyFormation now
}
// Expose globally if other modules need to refresh parts of the UI
window.initializeCompanionUI = initializeCompanionUI;
window.renderCompanionPartyFormation = renderCompanionPartyFormation;
window.renderCompanionRoster = renderCompanionRoster; // For hero methods to call
window.refreshCompanionUIDetails = displayCompanionDetails; // To update details if companion levels up while displayed
window.refreshCompanionRosterItem = refreshCompanionRosterItem;


export function openHeroSubTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("hero-sub-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("hero-sub-tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    const currentTabElement = document.getElementById(tabName);
    if (currentTabElement) {
        currentTabElement.style.display = "block";
        currentTabElement.classList.add("active");
    }
    if (evt && evt.currentTarget) { // Check if evt and evt.currentTarget exist
       evt.currentTarget.className += " active";
    }


    if (tabName === 'heroCompanions') {
        initializeCompanionUI();
    }
}
if (!window.openHeroSubTab) { // Ensure it's globally available for HTML onclick
    window.openHeroSubTab = openHeroSubTab;
}

function refreshCompanionRosterItem(companionInstance) {
    if (!hero) return;
    const rosterList = document.getElementById('companions-roster-list');
    if (!rosterList) return;

    const itemDiv = rosterList.querySelector(`.companion-roster-item[data-companion-id="${companionInstance.companionId}"]`);
    if (itemDiv) {
        const nameSpan = itemDiv.querySelector('span');
        if (nameSpan) nameSpan.textContent = `${companionInstance.name} (Lvl ${companionInstance.level})`;
    }
}


function renderCompanionRoster(currentHero) {
    const rosterList = document.getElementById('companions-roster-list');
    if (!rosterList || !currentHero) return;
    rosterList.innerHTML = '';

    currentHero.allCompanions.forEach(comp => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('companion-roster-item');
        itemDiv.dataset.companionId = comp.companionId;

        const portrait = document.createElement('img');
        portrait.src = comp.class.portrait || 'Media/UI/defaultPortrait.png';
        portrait.alt = comp.name;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${comp.name} (Lvl ${comp.level})`;

        itemDiv.appendChild(portrait);
        itemDiv.appendChild(nameSpan);

        const isInParty = currentHero.partyFormation.flat().includes(comp);
        if (isInParty) {
            itemDiv.classList.add('in-party');
        }

        itemDiv.addEventListener('click', () => {
            if (!isInParty) {
                const added = currentHero.addCompanionToFirstAvailableSlot(comp);
                // addCompanionToFirstAvailableSlot now calls render functions if successful
            }
            displayCompanionDetails(comp);
        });
        rosterList.appendChild(itemDiv);
    });
}

function renderCompanionPartyFormation(currentHero) {
    const formationContainer = document.getElementById('companions-party-formation');
    if (!formationContainer || !currentHero) return;

    // Ensure hero is in formation if not already
    if (!currentHero.isHeroInFormation()) {
        currentHero.placeHeroInFirstAvailableSlot();
    }

    currentHero.partyFormation.forEach((rowMembers, rowIndex) => {
        const rowDiv = formationContainer.querySelectorAll('.party-formation-row')[rowIndex];
        if (!rowDiv) { console.error(`Formation row ${rowIndex} not found`); return; }

        rowMembers.forEach((member, colIndex) => {
            const slotDiv = rowDiv.querySelectorAll('.party-formation-slot')[colIndex];
            if (!slotDiv) { console.error(`Formation slot [${rowIndex},${colIndex}] not found`); return; }

            slotDiv.innerHTML = ''; // Clear previous content
            slotDiv.classList.remove('has-hero', 'has-companion');
            delete slotDiv.dataset.memberIdentifier; // Clear old identifier

            // Remove old listeners to prevent accumulation
            slotDiv.ondragover = null;
            slotDiv.ondrop = null;
            slotDiv.onclick = null;


            if (member) {
                slotDiv.dataset.memberIdentifier = member.isHero ? 'hero' : member.companionId;
                const portraitImg = document.createElement('img');
                portraitImg.src = member.class.portrait || 'Media/UI/defaultPortrait.png';
                portraitImg.alt = member.name;
                portraitImg.classList.add('companion-portrait-in-slot');
                portraitImg.draggable = true;

                const nameDiv = document.createElement('div');
                nameDiv.classList.add('companion-name-in-slot');
                nameDiv.textContent = member.name.substring(0, 8);


                slotDiv.appendChild(portraitImg);
                slotDiv.appendChild(nameDiv);
                slotDiv.classList.add(member.isHero ? 'has-hero' : 'has-companion');

                portraitImg.addEventListener('dragstart', (event) => {
                    draggedMember = member; // Store the actual member instance
                    draggedElement = portraitImg; // Store the element being dragged
                    event.dataTransfer.setData('text/plain', member.isHero ? 'hero' : member.companionId);
                    event.dataTransfer.effectAllowed = 'move';
                    // Set a transparent drag image or a small custom one if needed
                    // For now, browser default (semi-transparent copy of element)
                    // event.dataTransfer.setDragImage(draggedElement, draggedElement.offsetWidth / 2, draggedElement.offsetHeight / 2);
                    setTimeout(() => { // Hide original element slightly delayed
                        if (draggedElement) draggedElement.style.opacity = '0.5';
                    },0);
                });
                portraitImg.addEventListener('dragend', () => {
                     if (draggedElement) draggedElement.style.opacity = '1'; // Restore opacity
                     draggedMember = null;
                     draggedElement = null;
                });

                slotDiv.addEventListener('click', () => { // Click on the slot (even if it has a member)
                    displayCompanionDetails(member);
                });
            }

            // Always set up drop listeners for the slot itself
            slotDiv.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            });

            slotDiv.addEventListener('drop', (event) => {
                event.preventDefault();
                if (!draggedMember) return;
                if (draggedElement) draggedElement.style.opacity = '1'; // Restore opacity of dragged element

                const targetRow = parseInt(slotDiv.dataset.row);
                const targetCol = parseInt(slotDiv.dataset.col);

                currentHero.setMemberPositionInFormation(draggedMember, targetRow, targetCol);
                // setMemberPositionInFormation now calls renderCompanionPartyFormation

                draggedMember = null;
                draggedElement = null;
            });
        });
    });
}


function displayCompanionDetails(member) {
    const detailsPanel = document.getElementById('companion-selected-details');
    if (!detailsPanel) return;

    if (!member) {
        detailsPanel.innerHTML = '<p>Select a companion or an empty slot to manage party.</p>';
        return;
    }

    let skillsHTML = '<ul>';
    member.skills.forEach(skill => {
        // skill.description might be long, consider a summary or tooltip for full desc
        skillsHTML += `<li>${skill.name} (Lvl ${skill.level || 1})</li>`;
    });
    skillsHTML += '</ul>';

    detailsPanel.innerHTML = `
        <img src="${member.class.portrait || 'Media/UI/defaultPortrait.png'}" alt="${member.name}" class="detail-portrait">
        <h4>${member.name} - ${member.class.name || member.classType} (Lvl ${member.level})</h4>
        <p><em>${member.description || 'No description.'}</em></p>
        <hr>
        <p>HP: ${Math.round(member.currentHealth)} / ${member.maxHealth}</p>
        <p>Mana: ${member.currentMana} / ${member.getEffectiveStat('mana')}</p>
        <p>Stamina: ${member.currentStamina} / ${member.getEffectiveStat('stamina')}</p>
        <p>XP: ${member.experience} / ${member.experienceToLevel}
            <div class="companion-stat-xp-bar">
                <div class="progress" style="width:${(member.experience / member.experienceToLevel) * 100}%"></div>
            </div>
        </p>
        <h5>Base Stats:</h5>
        <ul class="comp-stats-list">
            <li>Strength: ${member.getEffectiveStat('strength')}</li>
            <li>Speed: ${member.getEffectiveStat('speed')}</li>
            <li>Dexterity: ${member.getEffectiveStat('dexterity')}</li>
            <li>Vitality: ${member.getEffectiveStat('vitality')}</li>
            <li>Vitality: ${member.getEffectiveStat('magicPower')}</li>
            <li>Armor: ${member.getEffectiveStat('armor') || 0}</li>
            <li>Dodge: ${member.getEffectiveStat('dodge') || 0}</li>
        </ul>
        <h5>Skills:</h5>
        ${skillsHTML}
        <button id="remove-from-party-btn" style="margin-top:10px;" ${member.isHero ? 'disabled' : ''}>
            ${member.isHero ? 'Hero (Cannot Remove)' : 'Remove from Party'}
        </button>
    `;

    const removeBtn = detailsPanel.querySelector('#remove-from-party-btn');
    if (removeBtn && !member.isHero) {
        removeBtn.addEventListener('click', () => {
            hero.removeMemberFromFormation(member);
            // removeMemberFromFormation now calls render functions
            displayCompanionDetails(null); // Clear details panel
        });
    }
}