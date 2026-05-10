export class CarController {
    constructor(vehicle, audioManager) {
        this.vehicle = vehicle;
        this.audioManager = audioManager;
        this.steering = 0;
        this.throttle = 0;
        this.brake = 0;
        this.maxSpeed = 40;
        this.handbrake = false;
    }

    update(inputs) {
        this.steering = 0;
        this.throttle = 0;
        this.brake = 0;

        if (inputs.forward) this.throttle = 2000;
        if (inputs.backward) this.throttle = -1200;
        if (inputs.left) this.steering = 0.35;
        if (inputs.right) this.steering = -0.35;
        if (inputs.handbrake) this.brake = 100;

        this.vehicle.setEngineForce(this.throttle);
        this.vehicle.setSteeringValue(this.steering);
        this.vehicle.setBrake(this.brake);

        if (this.audioManager) {
            const speed = Math.hypot(this.vehicle.chassisBody.velocity.x, this.vehicle.chassisBody.velocity.z);
            this.playEngineSound(speed);
        }
    }

    playEngineSound(speed) {
        if (!this.audioManager || !this.audioManager.audioContext) return;
        const tone = 200 + Math.min(800, speed * 10);
        const ctx = this.audioManager.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(tone, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.audioManager.masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }

    getSpeedKPH() {
        const speed = Math.hypot(this.vehicle.chassisBody.velocity.x, this.vehicle.chassisBody.velocity.z);
        return Math.round(speed * 3.6);
    }
}