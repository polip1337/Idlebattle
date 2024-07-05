window.onload = function () {
    const modal = document.getElementById('evolution-modal');
    const closeButton = document.getElementsByClassName('close-button')[0];

    window.onclick = function (event) {
        if (event.target === modal) {
            closeEvolutionModal();
        }
    }
}









