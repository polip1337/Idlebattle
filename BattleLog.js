class BattleLog {
    constructor(logContainer) {
        this.logContainer = logContainer;
    }

    log(message, type) {
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logEntry.classList.add(type);

        this.logContainer.insertBefore(logEntry, this.logContainer.firstChild);
        this.logContainer.scrollTop = this.logContainer.scrollHeight; // Scroll to bottom
    }
}

export default BattleLog;
