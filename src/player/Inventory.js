export class Inventory {
    constructor() {
        this.money = 1200;
        this.health = 100;
        this.armor = 50;
        this.weapons = [];
        this.activeIndex = 0;
    }

    init() {
        this.weapons.push({ id: 'FISTS', name: 'Fists', ammo: Infinity, maxAmmo: Infinity, damage: 15, range: 2.5, fireRate: 0.6, reloadTime: 0 });
        this.weapons.push({ id: 'PISTOL', name: 'Pistol', ammo: 17, maxAmmo: 17, damage: 25, range: 55, fireRate: 0.4, reloadTime: 2 });
    }

    addWeapon(weaponData) {
        const index = this.weapons.findIndex((weapon) => weapon.id === weaponData.id);
        if (index !== -1) return;
        this.weapons.push(weaponData);
    }

    switchWeapon(index) {
        if (index < 0 || index >= this.weapons.length) return;
        this.activeIndex = index;
    }

    getCurrentWeapon() {
        return this.weapons[this.activeIndex] || this.weapons[0];
    }

    addMoney(amount) {
        this.money += amount;
    }

    spendMoney(amount) {
        if (this.money < amount) return false;
        this.money -= amount;
        return true;
    }

    addHealth(amount) {
        this.health = Math.min(100, this.health + amount);
    }

    addArmor(amount) {
        this.armor = Math.min(100, this.armor + amount);
    }

    takeDamage(amount) {
        if (this.armor > 0) {
            const absorb = Math.min(this.armor, amount * 0.6);
            this.armor -= absorb;
            amount -= absorb;
        }
        this.health = Math.max(0, this.health - amount);
    }
}