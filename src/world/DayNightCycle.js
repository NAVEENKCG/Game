import * as THREE from 'three';

const COLORS = {
    sunrise: new THREE.Color(0xFF8C00),
    noon: new THREE.Color(0xFFFFFF),
    sunset: new THREE.Color(0xFF4500),
    night: new THREE.Color(0x4169E1)
};

export class DayNightCycle {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.time = 6;
        this.sun = null;
        this.ambient = null;
        this.streetLights = [];
    }

    init() {
        this.sun = new THREE.DirectionalLight(0xffffff, 1.0);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.set(2048, 2048);
        this.sun.shadow.camera.left = -300;
        this.sun.shadow.camera.right = 300;
        this.sun.shadow.camera.top = 300;
        this.sun.shadow.camera.bottom = -300;
        this.scene.add(this.sun);

        this.ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambient);

        for (let i = 0; i < 20; i++) {
            const light = new THREE.PointLight(0xffd07f, 0, 10, 2);
            const x = (Math.random() - 0.5) * 1200;
            const z = (Math.random() - 0.5) * 1200;
            light.position.set(x, 6, z);
            this.scene.add(light);
            this.streetLights.push(light);
        }
    }

    update(deltaTime) {
        this.time += deltaTime * 0.04;
        if (this.time >= 24) this.time -= 24;

        const hour = this.time;
        let skyColor = new THREE.Color(0x87ceeb);
        let intensity = 1.0;
        if (hour >= 6 && hour < 12) {
            const t = (hour - 6) / 6;
            skyColor = COLORS.sunrise.clone().lerp(COLORS.noon, t);
            intensity = 0.8 + 0.7 * t;
        } else if (hour >= 12 && hour < 18) {
            const t = (hour - 12) / 6;
            skyColor = COLORS.noon.clone().lerp(COLORS.sunset, t);
            intensity = 1.5 - 0.9 * t;
        } else if (hour >= 18 || hour < 6) {
            const t = hour >= 18 ? (hour - 18) / 6 : (hour + 6) / 6;
            skyColor = COLORS.sunset.clone().lerp(COLORS.night, t);
            intensity = 0.6 - 0.5 * t;
        }

        this.scene.background = skyColor;
        this.scene.fog.color = skyColor;
        this.ambient.intensity = 0.3 + intensity * 0.3;

        const sunAngle = ((hour / 24) * Math.PI * 2) - Math.PI / 2;
        this.sun.position.set(Math.cos(sunAngle) * 200, Math.sin(sunAngle) * 150, 100);
        this.sun.color = skyColor;
        this.sun.intensity = intensity;

        const isNight = hour < 6 || hour > 18;
        this.streetLights.forEach((light) => {
            light.intensity = isNight ? 0.8 : 0;
        });
    }
}