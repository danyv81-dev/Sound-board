// Audio Generator - Creates test sounds using Web Audio API

class AudioGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Generate a beep sound
    generateBeep(frequency = 440, duration = 0.2, type = 'sine') {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.value = frequency;
        osc.type = type;
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
    }

    // Generate engine sound
    generateEngineSound() {
        const now = this.audioContext.currentTime;
        const duration = 1;
        
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(150 + i * 100, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + duration);
            osc.type = 'triangle';
            
            filter.type = 'lowpass';
            filter.frequency.value = 500;
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            osc.start(now);
            osc.stop(now + duration);
        }
    }

    // Generate whoosh sound
    generateWhoosh() {
        const now = this.audioContext.currentTime;
        const duration = 0.6;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + duration);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + duration);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    // Generate explosion sound
    generateExplosion() {
        const now = this.audioContext.currentTime;
        const duration = 0.8;
        
        // Noise burst
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + duration);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        noise.start(now);
        noise.stop(now + duration);
    }

    // Generate laugh sound
    generateLaugh() {
        const now = this.audioContext.currentTime;
        const laughs = [
            { freq: 400, time: 0 },
            { freq: 450, time: 0.15 },
            { freq: 500, time: 0.3 },
            { freq: 450, time: 0.45 }
        ];
        
        laughs.forEach(laugh => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.type = 'sine';
            osc.frequency.value = laugh.freq;
            
            gain.gain.setValueAtTime(0.15, now + laugh.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + laugh.time + 0.12);
            
            osc.start(now + laugh.time);
            osc.stop(now + laugh.time + 0.12);
        });
    }

    // Generate random sound effect
    generateRandomEffect() {
        const effects = [
            () => this.generateBeep(Math.random() * 500 + 200),
            () => this.generateWhoosh(),
            () => this.generateLaugh()
        ];
        
        effects[Math.floor(Math.random() * effects.length)]();
    }
}

// Global audio generator
let audioGen = null;

function initAudioGenerator() {
    if (!audioGen) {
        audioGen = new AudioGenerator();
    }
}

// Sound effect mapping
const soundEffects = {
    'engine': () => audioGen.generateEngineSound(),
    'whoosh': () => audioGen.generateWhoosh(),
    'explosion': () => audioGen.generateExplosion(),
    'laugh': () => audioGen.generateLaugh(),
    'beep': () => audioGen.generateBeep(),
    'random': () => audioGen.generateRandomEffect()
};
