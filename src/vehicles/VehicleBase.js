import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class VehicleBase {
    constructor(scene, physicsWorld, position = new THREE.Vector3(), type = 'CAR') {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.type = type;
        this.engineForce = 0;
        this.steeringValue = 0;
        this.brakeForce = 0;
        this.wheelVisuals = [];
        this.createChassis(position);
        this.createVehicle();
        this.createVisual();
        this.health = 100;
    }

    createChassis(position) {
        this.chassisBody = new CANNON.Body({ mass: 1200 });
        this.chassisBody.addShape(new CANNON.Box(new CANNON.Vec3(1.8, 0.5, 4.0)));
        this.chassisBody.position.set(position.x, position.y + 1.2, position.z);
        this.chassisBody.angularDamping = 0.4;
        this.physicsWorld.addBody(this.chassisBody);
    }

    createVehicle() {
        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            indexRightAxis: 0,
            indexUpAxis: 1,
            indexForwardAxis: 2
        });

        const wheelOptions = {
            radius: 0.4,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            axleLocal: new CANNON.Vec3(1, 0, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 6,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        const wheelPositions = [
            new CANNON.Vec3(-1.1, 0, 2.6),
            new CANNON.Vec3(1.1, 0, 2.6),
            new CANNON.Vec3(-1.1, 0, -2.6),
            new CANNON.Vec3(1.1, 0, -2.6)
        ];

        wheelPositions.forEach((position) => {
            const options = { ...wheelOptions, chassisConnectionPointLocal: position };
            this.vehicle.addWheel(options);
        });

        this.vehicle.addToWorld(this.physicsWorld);
    }

    createVisual() {
        this.chassisMesh = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 1.2, 8.0),
            new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.4 })
        );
        this.chassisMesh.castShadow = true;
        this.scene.add(this.chassisMesh);

        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x202020 }));
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            this.scene.add(wheel);
            this.wheelVisuals.push(wheel);
        }
    }

    setEngineForce(value) {
        this.engineForce = Math.max(-2000, Math.min(2000, value));
        this.vehicle.applyEngineForce(this.engineForce, 2);
        this.vehicle.applyEngineForce(this.engineForce, 3);
    }

    setSteeringValue(value) {
        this.steeringValue = Math.max(-0.5, Math.min(0.5, value));
        this.vehicle.setSteeringValue(this.steeringValue, 0);
        this.vehicle.setSteeringValue(this.steeringValue, 1);
    }

    setBrake(value) {
        this.brakeForce = Math.max(0, Math.min(100, value));
        this.vehicle.setBrake(this.brakeForce, 0);
        this.vehicle.setBrake(this.brakeForce, 1);
        this.vehicle.setBrake(this.brakeForce, 2);
        this.vehicle.setBrake(this.brakeForce, 3);
    }

    update() {
        const chassisPos = this.chassisBody.position;
        this.chassisMesh.position.set(chassisPos.x, chassisPos.y, chassisPos.z);
        this.chassisMesh.quaternion.copy(this.chassisBody.quaternion);

        this.vehicle.wheelInfos.forEach((wheel, index) => {
            this.vehicle.updateWheelTransform(index);
            const transform = wheel.worldTransform;
            const wheelMesh = this.wheelVisuals[index];
            wheelMesh.position.set(transform.position.x, transform.position.y, transform.position.z);
            wheelMesh.quaternion.set(transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w);
        });
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    enterVehicle(player) {
        player.state = 'IN_VEHICLE';
    }

    exitVehicle() {
        // placeholder for exit logic
    }
}