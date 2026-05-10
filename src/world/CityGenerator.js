import * as THREE from 'three';

export class CityGenerator {
    constructor(scene) {
        this.scene = scene;
        this.blockSize = 80;
        this.gridSize = 20;
    }

    generateCity() {
        for (let x = 0; x < this.gridSize; x++) {
            for (let z = 0; z < this.gridSize; z++) {
                this.createBuilding(x * this.blockSize, z * this.blockSize);
            }
        }
        this.createRoads();
    }

    createBuilding(x, z) {
        const height = Math.random() * 150 + 20;
        const geometry = new THREE.BoxGeometry(60, height, 60);
        const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        const building = new THREE.Mesh(geometry, material);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        this.scene.add(building);
    }

    createRoads() {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        for (let i = 0; i <= this.gridSize; i++) {
            // Horizontal roads
            const roadH = new THREE.Mesh(new THREE.PlaneGeometry(this.gridSize * this.blockSize, 10), roadMaterial);
            roadH.rotation.x = -Math.PI / 2;
            roadH.position.set((this.gridSize * this.blockSize) / 2 - this.blockSize / 2, 0.1, i * this.blockSize - this.blockSize / 2);
            this.scene.add(roadH);

            // Vertical roads
            const roadV = new THREE.Mesh(new THREE.PlaneGeometry(10, this.gridSize * this.blockSize), roadMaterial);
            roadV.rotation.x = -Math.PI / 2;
            roadV.position.set(i * this.blockSize - this.blockSize / 2, 0.1, (this.gridSize * this.blockSize) / 2 - this.blockSize / 2);
            this.scene.add(roadV);
        }
    }

    update(deltaTime) {
        // Update any dynamic elements if needed
    }
}