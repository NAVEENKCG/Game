import * as THREE from 'three';

export class WeaponSystem {
    constructor(scene, camera, player, inventory, audioManager, wantedSystem) {
        this.scene = scene;
        this.camera = camera;
        this.player = player;
        this.inventory = inventory;
        this.audioManager = audioManager;
        this.wantedSystem = wantedSystem;
        this.lastFire = 0;
        this.aiming = false;
        this.raycaster = new THREE.Raycaster();
        this.targets = [];
    }

    init() {
        window.addEventListener('mousedown', (event) => {
            if (event.button === 0) this.fire();
            if (event.button === 2) this.aiming = true;
        });
        window.addEventListener('mouseup', (event) => {
            if (event.button === 2) this.aiming = false;
        });
    }

    update(deltaTime) {
        if (this.aiming) {
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 45, 0.08);
        } else {
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 75, 0.08);
        }
        this.camera.updateProjectionMatrix();
    }

    onKeyDown(event) {
        if (event.code === 'KeyR') {
            this.reload();
        }
        if (event.code === 'Digit1') {
            this.inventory.switchWeapon(0);
        }
        if (event.code === 'Digit2') {
            this.inventory.switchWeapon(1);
        }
    }

    fire() {
        const weapon = this.inventory.getCurrentWeapon();
        const now = performance.now() / 1000;
        if (now - this.lastFire < weapon.fireRate) return;
        if (weapon.ammo <= 0 && weapon.maxAmmo !== Infinity) return;
        this.lastFire = now;

        if (weapon.maxAmmo !== Infinity) {
            weapon.ammo -= 1;
        }

        this.audioManager.playGunshot();

        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const origin = this.raycaster.ray.origin;
        const direction = this.raycaster.ray.direction;
        const targetPoint = origin.clone().add(direction.multiplyScalar(weapon.range));

        this.targets.forEach((target) => {
            const sphere = new THREE.Sphere(target.mesh.position, target.radius || 1.0);
            if (sphere.containsPoint(targetPoint)) {
                target.takeDamage(weapon.damage);
            }
        });
    }

    reload() {
        const weapon = this.inventory.getCurrentWeapon();
        if (weapon.maxAmmo === Infinity) return;
        setTimeout(() => {
            weapon.ammo = weapon.maxAmmo;
        }, weapon.reloadTime * 1000);
    }

    addTarget(target) {
        this.targets.push(target);
    }
}