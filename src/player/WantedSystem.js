export class WantedSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.stars = 0;
        this.timer = 0;
    }

    init() {
        this.stars = 0;
        this.timer = 0;
    }

    addWanted(amount) {
        this.stars = Math.min(5, this.stars + amount);
        this.timer = 0;
    }

    reduceWanted(amount) {
        this.stars = Math.max(0, this.stars - amount);
    }

    clearWanted() {
        this.stars = 0;
    }

    update(deltaTime) {
        if (this.stars === 0) return;
        this.timer += deltaTime;
        if (this.timer > 90) {
            this.timer = 0;
            this.reduceWanted(1);
        }
    }
}