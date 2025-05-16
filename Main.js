window.onload = function () {
    const modal = document.getElementById('evolution-modal');

    window.onclick = function (event) {
        if (event.target === modal) {
            closeEvolutionModal();
        }
    };

    // Ensure home screen is visible on load
    document.getElementById('home-screen').classList.add('active');
};