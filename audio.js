// 80s Synthwave Audio System
// Procedurally generated retro soundtrack using Web Audio API

class SynthAudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.isPlaying = false;
        
        // Music state
        this.musicIntervals = [];
        
        // 80s synthwave chord progression (I-vi-IV-V in C major)
        this.chordProgression = [
            [261.63, 329.63, 392.00], // C major (C-E-G)
            [220.00, 261.63, 329.63], // A minor (A-C-E)
            [349.23, 440.00, 523.25], // F major (F-A-C)
            [392.00, 493.88, 587.33]  // G major (G-B-D)
        ];
        
        // Bass notes for the progression
        this.bassNotes = [130.81, 110.00, 174.61, 196.00]; // C, A, F, G
        
        this.currentChord = 0;
        this.tempo = 500; // ms per beat
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.audioContext.destination);
            
            // Create music gain
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);
            
            // Create sfx gain
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.4;
            this.sfxGain.connect(this.masterGain);
            
            return true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            return false;
        }
    }
    
    // Create a synth pad sound
    createPad(frequency, startTime, duration) {
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Sawtooth waves for that 80s analog synth feel
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        
        osc1.frequency.value = frequency;
        osc2.frequency.value = frequency * 1.01; // Slight detune for richness
        
        // Low-pass filter for warmth
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        filter.Q.value = 1;
        
        // Connect oscillators through filter
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        // Envelope: slow attack, sustained, slow release
        gainNode.gain.value = 0;
        gainNode.gain.setTargetAtTime(0.15, startTime, 0.3);
        gainNode.gain.setTargetAtTime(0, startTime + duration - 0.5, 0.3);
        
        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
        
        return [osc1, osc2];
    }
    
    // Create bass synth
    createBass(frequency, startTime, duration) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'triangle';
        osc.frequency.value = frequency;
        
        // Filter for punchy bass
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        filter.Q.value = 3;
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        // Short attack, quick decay
        gainNode.gain.value = 0;
        gainNode.gain.setTargetAtTime(0.3, startTime, 0.01);
        gainNode.gain.setTargetAtTime(0.1, startTime + 0.1, 0.1);
        gainNode.gain.setTargetAtTime(0, startTime + duration - 0.05, 0.05);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        
        return osc;
    }
    
    // Create arpeggio synth
    createArp(frequency, startTime, duration) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.value = frequency;
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 2;
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        // Quick plucky envelope
        gainNode.gain.value = 0;
        gainNode.gain.setTargetAtTime(0.08, startTime, 0.005);
        gainNode.gain.setTargetAtTime(0, startTime + duration - 0.02, 0.02);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        
        return osc;
    }
    
    // Schedule the next chord
    scheduleChord() {
        const now = this.audioContext.currentTime;
        const chordDuration = (this.tempo / 1000) * 4; // 4 beats per chord
        
        const chord = this.chordProgression[this.currentChord];
        const bass = this.bassNotes[this.currentChord];
        
        // Play chord (pads)
        chord.forEach(freq => {
            this.createPad(freq, now, chordDuration);
        });
        
        // Play bass on beats 1 and 3
        this.createBass(bass, now, this.tempo / 1000 * 0.8);
        this.createBass(bass, now + (this.tempo / 1000) * 2, this.tempo / 1000 * 0.8);
        
        // Create arpeggio pattern
        const arpPattern = [0, 2, 1, 2]; // Pattern through chord notes
        for (let i = 0; i < 8; i++) {
            const noteIndex = arpPattern[i % 4];
            const freq = chord[noteIndex] * 2; // One octave higher
            const time = now + (this.tempo / 1000) * (i * 0.5);
            this.createArp(freq, time, this.tempo / 1000 * 0.4);
        }
        
        // Move to next chord
        this.currentChord = (this.currentChord + 1) % this.chordProgression.length;
    }
    
    // Start the background music
    startMusic() {
        if (!this.audioContext || this.isPlaying) return;
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = true;
        
        // Schedule first chord immediately
        this.scheduleChord();
        
        // Schedule subsequent chords
        const chordInterval = this.tempo * 4; // 4 beats per chord
        this.musicIntervals.push(
            setInterval(() => {
                if (this.isPlaying) {
                    this.scheduleChord();
                }
            }, chordInterval)
        );
    }
    
    // Stop the background music
    stopMusic() {
        this.isPlaying = false;
        
        // Clear all intervals
        this.musicIntervals.forEach(interval => clearInterval(interval));
        this.musicIntervals = [];
        
        // Fade out
        if (this.musicGain) {
            const now = this.audioContext.currentTime;
            this.musicGain.gain.setTargetAtTime(0, now, 0.3);
            setTimeout(() => {
                if (this.musicGain) {
                    this.musicGain.gain.value = 0.3;
                }
            }, 500);
        }
    }
    
    // Jump sound effect
    playJumpSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'square';
        
        // Pitch sweep upward
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    // Game over sound effect
    playGameOverSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        
        // Pitch sweep downward
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }
    
    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.masterGain) {
            const now = this.audioContext.currentTime;
            if (this.isMuted) {
                this.masterGain.gain.setTargetAtTime(0, now, 0.05);
            } else {
                this.masterGain.gain.setTargetAtTime(0.5, now, 0.05);
            }
        }
        
        return this.isMuted;
    }
}

// Export singleton instance
const synthAudio = new SynthAudio();
