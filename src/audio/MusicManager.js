export class MusicManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.state = 'CALM';
        this.activeNodes = [];
        this.fadeGain = null;
    }

    init() {
        if (!this.audioManager.audioContext) return;
        const ctx = this.audioManager.audioContext;
        this.fadeGain = ctx.createGain();
        this.fadeGain.gain.setValueAtTime(0.8, ctx.currentTime);
        this.fadeGain.connect(this.audioManager.masterGain);
        this.buildTrack();
    }

    buildTrack() {
        if (!this.audioManager.audioContext) return;
        const ctx = this.audioManager.audioContext;
        this.activeNodes.forEach(node => node.stop());
        this.activeNodes = [];
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.state === 'COMBAT' ? 120 : this.state === 'CHASE' ? 180 : 90, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.fadeGain);
        osc.start();
        this.activeNodes.push(osc);
    }

    setState(state) {
        if (this.state === state) return;
        this.state = state;
        this.buildTrack();
    }

    update(deltaTime) {
        // state-based music modulation can be added here
    }
}