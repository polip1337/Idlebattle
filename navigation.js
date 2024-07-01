
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

  // Show the selected tab content
  document.getElementById(tabName).classList.add('active');

  // Activate the clicked tab link
  evt.currentTarget.classList.add('active');

    if(tabName == 'battle-statistics'){
        battleStatistics.updateBattleStatistics();
    }
}

