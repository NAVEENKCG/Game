import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const TYPES = [
    { color: 0x1f8eff, size: [2.2, 1.2, 4.2], speed: 26 },
    { color: 0xffa400, size: [2.6, 1.5, 5.2], speed: 22 },
    { color: 0x2ecc71, size: [2.0, 1.1, 3.8], speed: 30 },
    { color: 0xffff00, size: [2.4, 1.3, 4.8], speed: 24 }
];

export class TrafficSystem {
    constructor(scene, physicsWorld, cityGenerator) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.cityGenerator = cityGenerator;
        this.vehicles = [];
        this.waypoints = [];
    }

    init() {
        this.createWaypoints();
        this.spawnVehicles(30);
    }

    createWaypoints() {
        const spacing = this.cityGenerator.blockSize + this.cityGenerator.roadWidth;
        const grid = this.cityGenerator.gridSize;
        const full = grid * spacing - this.cityGenerator.roadWidth;
        for (let i = 0; i <= grid; i++) {
            const coord = -full / 2 + i * spacing;
            this.waypoints.push({ position: new THREE.Vector3(coord, 0, -full / 2), direction: new THREE.Vector3(0, 0, 1) });
            this.waypoints.push({ position: new THREE.Vector3(-full / 2, 0, coord), direction: new THREE.Vector3(1, 0, 0) });
        }
    }

    spawnVehicles(count) {
        for (let i = 0; i < count; i++) {
            const type = TYPES[i % TYPES.length];
            const waypoint = this.waypoints[Math.floor(Math.random() * this.waypoints.length)];
            const x = waypoint.position.x + (Math.random() - 0.5) * 10;
            const z = waypoint.position.z + (Math.random() - 0.5) * 10;
            const vehicle = this.createVehicle(type, new THREE.Vector3(x, 1.2, z), waypoint.direction);
            this.vehicles.push(vehicle);
        }
    }

    createVehicle(type, position, direction) {
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(type.size[0], type.size[1], type.size[2]), new THREE.MeshStandardMaterial({ color: type.color }));
        chassis.castShadow = true;
        chassis.position.copy(position);
        this.scene.add(chassis);

        const body = new CANNON.Body({ mass: 400 });
        body.addShape(new CANNON.Box(new CANNON.Vec3(type.size[0] / 2, type.size[1] / 2, type.size[2] / 2)));
        body.position.set(position.x, position.y, position.z);
        body.linearDamping = 0.9;
        this.physicsWorld.addBody(body);

        return {
            mesh: chassis,
            body,
            direction: direction.clone(),
            speed: type.speed * (0.8 + Math.random() * 0.4),
            type
        };
    }

    update(deltaTime) {
        this.vehicles.forEach((vehicle) => {
            const desired = vehicle.direction.clone().multiplyScalar(vehicle.speed);
            vehicle.body.velocity.x = THREE.MathUtils.lerp(vehicle.body.velocity.x, desired.x, 0.02);
            vehicle.body.velocity.z = THREE.MathUtils.lerp(vehicle.body.velocity.z, desired.z, 0.02);

            const pos = vehicle.body.position;
            vehicle.mesh.position.set(pos.x, pos.y, pos.z);
            vehicle.mesh.quaternion.copy(vehicle.body.quaternion);

            if (Math.abs(pos.x) > 1000 || Math.abs(pos.z) > 1000) {
                vehicle.body.position.set((Math.random() - 0.5) * 200, 1.2, (Math.random() - 0.5) * 200);
            }
        });
    }
}