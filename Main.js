window.onload = function () {
    const modal = document.getElementById('evolution-modal');

    window.onclick = function (event) {
        if (event.target === modal) {
            closeEvolutionModal();
        }
    }
}









