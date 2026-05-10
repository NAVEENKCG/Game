import * as THREE from 'three';

const PARTICLE_TYPES = {
    SPARK: { color: 0xffcc44, size: 0.08, lifetime: 0.3 },
    BLOOD: { color: 0xff3333, size: 0.12, lifetime: 0.4 },
    SMOKE: { color: 0x666666, size: 0.18, lifetime: 1.8 }
};

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.pool = [];
        this.active = [];
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(1500);
        this.colors = new Float32Array(1500);
        this.sizes = new Float32Array(500);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        const material = new THREE.PointsMaterial({ vertexColors: true, size: 0.15, transparent: true, opacity: 0.9 });
        this.points = new THREE.Points(this.geometry, material);
        this.scene.add(this.points);
        for (let i = 0; i < 100; i++) {
            this.pool.push({ alive: false, position: new THREE.Vector3(), velocity: new THREE.Vector3(), color: new THREE.Color(), life: 0, maxLife: 0, type: null });
        }
    }

    emit(position, type) {
        for (let i = 0; i < this.pool.length && this.active.length < 500; i++) {
            const particle = this.pool[i];
            if (particle.alive) continue;
            const props = PARTICLE_TYPES[type];
            if (!props) return;
            particle.alive = true;
            particle.position.copy(position);
            particle.velocity.set((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2);
            particle.color.setHex(props.color);
            particle.life = 0;
            particle.maxLife = props.lifetime;
            particle.type = type;
            this.active.push(particle);
            break;
        }
    }

    update(deltaTime) {
        let index = 0;
        this.active = this.active.filter((particle) => {
            particle.life += deltaTime;
            if (particle.life >= particle.maxLife) {
                particle.alive = false;
                return false;
            }
            particle.position.addScaledVector(particle.velocity, deltaTime);
            const fade = 1 - particle.life / particle.maxLife;
            this.positions[index * 3] = particle.position.x;
            this.positions[index * 3 + 1] = particle.position.y;
            this.positions[index * 3 + 2] = particle.position.z;
            this.colors[index * 3] = particle.color.r * fade;
            this.colors[index * 3 + 1] = particle.color.g * fade;
            this.colors[index * 3 + 2] = particle.color.b * fade;
            this.sizes[index] = (particle.type === 'SMOKE' ? 0.3 : 0.15) * fade;
            index++;
            return true;
        });
        this.geometry.setDrawRange(0, index);
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
    }
}