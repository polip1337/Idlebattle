import { reputationSystem } from './reputation.js';

class ReputationUI {
    constructor() {
        this.factionList = document.getElementById('faction-reputation-list');
        this.characterList = document.getElementById('character-reputation-list');
        this.initializeUI();
    }

    initializeUI() {
        this.updateFactionReputations();
        this.updateCharacterReputations();
    }

    createReputationCard(data, type) {
        const card = document.createElement('div');
        card.className = 'reputation-card';

        const header = document.createElement('div');
        header.className = 'reputation-header';

        const name = document.createElement('div');
        name.className = 'reputation-name';
        name.textContent = data.name;

        const level = document.createElement('div');
        level.className = `reputation-level ${data.currentLevel}`;
        level.textContent = data.currentLevel.charAt(0).toUpperCase() + data.currentLevel.slice(1);

        header.appendChild(name);
        header.appendChild(level);

        const description = document.createElement('div');
        description.className = 'reputation-description';
        description.textContent = data.description;

        const progress = document.createElement('div');
        progress.className = 'reputation-progress';
        const progressBar = document.createElement('div');
        progressBar.className = `reputation-progress-bar ${data.currentLevel}`;
        
        // Calculate progress percentage
        const levels = data.reputationLevels;
        const currentValue = data.currentReputation;
        let nextLevel = 'exalted';
        let nextValue = levels.exalted;
        
        if (currentValue < levels.unfriendly) {
            nextLevel = 'unfriendly';
            nextValue = levels.unfriendly;
        } else if (currentValue < levels.neutral) {
            nextLevel = 'neutral';
            nextValue = levels.neutral;
        } else if (currentValue < levels.friendly) {
            nextLevel = 'friendly';
            nextValue = levels.friendly;
        } else if (currentValue < levels.honored) {
            nextLevel = 'honored';
            nextValue = levels.honored;
        } else if (currentValue < levels.revered) {
            nextLevel = 'revered';
            nextValue = levels.revered;
        }

        const progressPercentage = ((currentValue - levels[data.currentLevel]) / (nextValue - levels[data.currentLevel])) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, progressPercentage))}%`;
        progress.appendChild(progressBar);

        const value = document.createElement('div');
        value.className = 'reputation-value';
        value.textContent = `${currentValue} / ${nextValue}`;

        card.appendChild(header);
        card.appendChild(description);
        card.appendChild(progress);
        card.appendChild(value);

        if (type === 'faction') {
            // Add faction-specific details
            const details = document.createElement('div');
            details.className = 'reputation-details';

            const motivation = document.createElement('p');
            motivation.textContent = `Motivation: ${data.motivation}`;
            details.appendChild(motivation);

            const influence = document.createElement('p');
            influence.textContent = `Influence: ${data.influence}`;
            details.appendChild(influence);

            if (data.keyLocations && data.keyLocations.length > 0) {
                const locations = document.createElement('div');
                locations.className = 'reputation-locations';
                const locationsTitle = document.createElement('h4');
                locationsTitle.textContent = 'Key Locations';
                locations.appendChild(locationsTitle);

                const locationsList = document.createElement('ul');
                data.keyLocations.forEach(location => {
                    const li = document.createElement('li');
                    li.textContent = location;
                    locationsList.appendChild(li);
                });
                locations.appendChild(locationsList);
                details.appendChild(locations);
            }

            if (data.keyFigures && data.keyFigures.length > 0) {
                const figures = document.createElement('div');
                figures.className = 'reputation-figures';
                const figuresTitle = document.createElement('h4');
                figuresTitle.textContent = 'Key Figures';
                figures.appendChild(figuresTitle);

                const figuresList = document.createElement('ul');
                data.keyFigures.forEach(figure => {
                    const li = document.createElement('li');
                    li.textContent = `${figure.name}: ${figure.description}`;
                    figuresList.appendChild(li);
                });
                figures.appendChild(figuresList);
                details.appendChild(figures);
            }

            card.appendChild(details);
        } else if (type === 'character') {
            // Add character-specific details
            const details = document.createElement('div');
            details.className = 'reputation-details';

            const location = document.createElement('p');
            location.textContent = `Location: ${data.location}`;
            details.appendChild(location);

            card.appendChild(details);
        }

        return card;
    }

    updateFactionReputations() {
        this.factionList.innerHTML = '';
        for (const [factionId, factionData] of Object.entries(reputationSystem.factionReputations)) {
            const reputation = reputationSystem.getFactionReputation(factionId);
            if (reputation) {
                const card = this.createReputationCard(reputation, 'faction');
                this.factionList.appendChild(card);
            }
        }
    }

    updateCharacterReputations() {
        this.characterList.innerHTML = '';
        for (const [characterId, characterData] of Object.entries(reputationSystem.characterReputations)) {
            const reputation = reputationSystem.getCharacterReputation(characterId);
            if (reputation) {
                const card = this.createReputationCard(reputation, 'character');
                this.characterList.appendChild(card);
            }
        }
    }

    updateUI() {
        this.updateFactionReputations();
        this.updateCharacterReputations();
    }
}

export const reputationUI = new ReputationUI(); 