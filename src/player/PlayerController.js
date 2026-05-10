import * as THREE from 'three';

export class PlayerController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.velocity = new THREE.Vector3();
        this.position = new THREE.Vector3(0, 10, 0);
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.yaw = 0;
        this.pitch = 0;
        this.speed = 50;
        this.friction = 0.9;
        this.mouseSensitivity = 0.002;
    }

    init() {
        this.camera.position.copy(this.position);
        this.camera.lookAt(0, 0, -1);

        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement) {
                this.mouse.x = e.movementX || 0;
                this.mouse.y = e.movementY || 0;
            }
        });

        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    update(deltaTime) {
        // Mouse look
        this.yaw -= this.mouse.x * this.mouseSensitivity;
        this.pitch -= this.mouse.y * this.mouseSensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        this.mouse.x = 0;
        this.mouse.y = 0;

        // Movement
        const direction = new THREE.Vector3();
        if (this.keys['KeyW']) direction.z -= 1;
        if (this.keys['KeyS']) direction.z += 1;
        if (this.keys['KeyA']) direction.x -= 1;
        if (this.keys['KeyD']) direction.x += 1;
        direction.normalize();

        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        this.velocity.add(direction.multiplyScalar(this.speed * deltaTime));
        this.velocity.multiplyScalar(this.friction);

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Update camera
        const cameraOffset = new THREE.Vector3(0, 5, 10);
        cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        cameraOffset.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
        this.camera.position.copy(this.position).add(cameraOffset);
        this.camera.lookAt(this.position);
    }
}