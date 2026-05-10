import * as THREE from 'three';

export class MissionManager {
    constructor(scene, player, hud, audioManager, missions) {
        this.scene = scene;
        this.player = player;
        this.hud = hud;
        this.audioManager = audioManager;
        this.missions = missions;
        this.activeMission = null;
        this.triggers = [];
    }

    init() {
        this.missions.forEach((mission) => {
            const marker = this.createMarker(mission.location);
            this.triggers.push({ mission, marker });
        });
    }

    createMarker(position) {
        const geometry = new THREE.CylinderGeometry(3, 3, 0.5, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(position.x, 0.25, position.z);
        this.scene.add(marker);
        return marker;
    }

    update(deltaTime) {
        const playerPos = this.player.getPosition();
        this.triggers.forEach((trigger) => {
            if (playerPos.distanceTo(trigger.mission.location) < 5 && !trigger.mission.completed) {
                this.startMission(trigger.mission);
            }
        });
    }

    startMission(mission) {
        if (this.activeMission) return;
        this.activeMission = mission;
        this.hud.setMissionText(`MISSION: ${mission.title}`);
        mission.completed = true;
        this.audioManager.playImpact();
        setTimeout(() => {
            this.hud.setMissionText(`OBJECTIVE: ${mission.objectives[0].description}`);
        }, 2000);
    }
}