
function openTab(evt, tabName) {
  // Hide all tab contents
  const tabContents = document.getElementsByClassName('tabcontent');
  for (let content of tabContents) {
    content.classList.remove('active');
  }

  // Deactivate all tab links
  const tabLinks = document.getElementsByClassName('tablinks');
  for (let link of tabLinks) {
    link.classList.remove('active');
  }
  if(tabName == 'heroContent'){
    var x= 0;
  }
  // Show the selected tab content
  document.getElementById(tabName).classList.add('active');

  // Activate the clicked tab link
  evt.currentTarget.classList.add('active');


}

function  updateStatsDisplay(member) {
    const element = document.querySelector(`heroStats`);


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