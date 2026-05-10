import * as THREE from 'three';

const STATES = {
    CLEAR: 'CLEAR',
    OVERCAST: 'OVERCAST',
    RAIN: 'RAIN',
    THUNDER: 'THUNDER',
    FOG: 'FOG'
};

export class WeatherSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.state = STATES.CLEAR;
        this.nextChange = 0;
        this.particles = null;
        this.velocities = [];
        this.ambientFlash = null;
        this.flashTimer = 0;
    }

    init() {
        this.particles = this.createRainParticles(5000);
        this.scene.add(this.particles);
        this.particles.visible = false;
        this.ambientFlash = new THREE.PointLight(0xFFFFFF, 0, 500, 2);
        this.scene.add(this.ambientFlash);
        this.scheduleNextWeather();
    }

    scheduleNextWeather() {
        this.nextChange = performance.now() + (180000 + Math.random() * 300000);
        const keys = Object.keys(STATES);
        this.state = keys[Math.floor(Math.random() * keys.length)];
        if (this.state === STATES.THUNDER) {
            this.state = STATES.RAIN;
            this.flashTimer = 0;
        }
        this.applyWeather();
    }

    applyWeather() {
        if (this.state === STATES.FOG) {
            this.scene.fog.density = 0.008;
            this.particles.visible = false;
        } else if (this.state === STATES.RAIN) {
            this.scene.fog.density = 0.002;
            this.particles.visible = true;
        } else {
            this.scene.fog.density = 0.0007;
            this.particles.visible = false;
        }
    }

    createRainParticles(count) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1600;
            positions[i * 3 + 1] = Math.random() * 300 + 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1600;
            this.velocities[i] = -(Math.random() * 0.5 + 1.2);
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.8, transparent: true, opacity: 0.6 });
        return new THREE.Points(geometry, material);
    }

    update(deltaTime) {
        if (performance.now() > this.nextChange) {
            this.scheduleNextWeather();
        }

        if (this.state === STATES.RAIN) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3 + 1] += this.velocities[i] * deltaTime * 60;
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = Math.random() * 300 + 150;
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;

            this.flashTimer += deltaTime;
            if (this.flashTimer > 4) {
                this.flashTimer = 0;
                this.ambientFlash.intensity = 4;
                setTimeout(() => this.ambientFlash.intensity = 0, 100);
            }
        }
    }
}