import * as THREE from 'three';
import { CityGenerator } from './world/CityGenerator.js';
import { PlayerController } from './player/PlayerController.js';
import { AudioManager } from './audio/AudioManager.js';
import { HUD } from './ui/HUD.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.clock = new THREE.Clock();
        this.cityGenerator = new CityGenerator(this.scene);
        this.playerController = new PlayerController(this.camera, this.scene);
        this.audioManager = new AudioManager();
        this.hud = new HUD();

        this.init();
        this.animate();
    }

    init() {
        // Set up basic lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Generate city
        this.cityGenerator.generateCity();

        // Initialize player
        this.playerController.init();

        // Initialize audio
        this.audioManager.init();

        // Initialize HUD
        this.hud.init();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        // Update game systems
        this.playerController.update(deltaTime);
        this.cityGenerator.update(deltaTime);
        this.audioManager.update(deltaTime);
        this.hud.update(deltaTime);

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});