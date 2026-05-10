export class HUD {
    constructor() {
        this.hudElement = document.getElementById('hud');
        this.health = 100;
        this.money = 0;
        this.wantedLevel = 0;
    }

    init() {
        // Health bar
        const healthBar = document.createElement('div');
        healthBar.id = 'health-bar';
        const healthFill = document.createElement('div');
        healthFill.id = 'health-fill';
        healthBar.appendChild(healthFill);
        this.hudElement.appendChild(healthBar);

        // Money
        const moneyDiv = document.createElement('div');
        moneyDiv.id = 'money';
        moneyDiv.textContent = `$${this.money}`;
        this.hudElement.appendChild(moneyDiv);

        // Wanted stars
        const wantedDiv = document.createElement('div');
        wantedDiv.id = 'wanted-stars';
        wantedDiv.textContent = '★'.repeat(this.wantedLevel);
        this.hudElement.appendChild(wantedDiv);

        // Minimap placeholder
        const minimap = document.createElement('div');
        minimap.id = 'minimap';
        this.hudElement.appendChild(minimap);
    }

    update(deltaTime) {
        // Update HUD values
        document.getElementById('health-fill').style.width = `${this.health}%`;
        document.getElementById('money').textContent = `$${this.money}`;
        document.getElementById('wanted-stars').textContent = '★'.repeat(this.wantedLevel);
    }

    setHealth(value) {
        this.health = Math.max(0, Math.min(100, value));
    }

    setMoney(value) {
        this.money = value;
    }

    setWantedLevel(level) {
        this.wantedLevel = Math.max(0, Math.min(5, level));
    }
}