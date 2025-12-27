// Audio Manager for background music and sound effects
class AudioManager {
    constructor() {
        this.bgMusic = null;
        this.soundEffects = {};
        this.isMuted = false;
        this.init();
    }

    init() {
        // Get DOM audio elements
        this.bgMusic = document.getElementById('bgMusic');
        this.soundEffects.carDestroy = document.getElementById('carDestroy');
        this.soundEffects.explosion = document.getElementById('explosion');
        this.soundEffects.points = document.getElementById('points');
        this.soundEffects.shield = document.getElementById('shield');
        this.soundEffects.speedBoost = document.getElementById('speedBoost');

        // Set volume for background music
        if (this.bgMusic) {
            this.bgMusic.volume = 0.5;
        }

        // Set volume for sound effects
        Object.values(this.soundEffects).forEach(effect => {
            if (effect) {
                effect.volume = 1.0;
            }
        });
    }

    playBackgroundMusic() {
        if (this.bgMusic && !this.isMuted) {
            // Try to play the audio, handling autoplay policy restrictions
            const promise = this.bgMusic.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.log('Audio playback prevented:', error);
                    // If autoplay is blocked, we'll try again when user interacts with the page
                });
            }
        }
    }

    pauseBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    }

    playSoundEffect(type) {
        if (!this.isMuted && this.soundEffects[type]) {
            // Reset the audio element to allow replay
            const sound = this.soundEffects[type];
            sound.currentTime = 0;
            sound.play().then(o => console.log('played sound effect')).catch(error => {
                console.log('Sound effect playback prevented:', error);
            });
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgMusic) {
            this.bgMusic.volume = this.isMuted ? 0 : 0.5;
        }
        Object.values(this.soundEffects).forEach(effect => {
            if (effect) {
                effect.volume = this.isMuted ? 0 : 0.5;
            }
        });
    }

    setVolume(volume) {
        if (this.bgMusic) {
            this.bgMusic.volume = volume;
        }
        Object.values(this.soundEffects).forEach(effect => {
            if (effect) {
                effect.volume = volume;
            }
        });
    }
}

// Global audio manager instance
var audioManager;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio manager
    audioManager = new AudioManager();

    // Initialize the game
    const game = new Game();

    // Show score in UI
    setInterval(() => {
        if (game && !game.gameOver) {
            document.getElementById('score').textContent = `Score: ${Math.floor(game.score)}`;
        }
    }, 100);

    // Play background music when game starts
    audioManager.playBackgroundMusic();

    // Try to play background music again if it was blocked by autoplay policy
    // setTimeout(() => {
    //     if (audioManager.bgMusic && !audioManager.bgMusic.paused) {
    //         console.log('Background music is playing');
    //     } else {
    //         console.log('Background music not playing, trying again...');
    //         audioManager.playBackgroundMusic();
    //     }
    // }, 2000);

    // Handle user interaction to enable autoplay
    document.addEventListener('click', () => {
        if (audioManager.bgMusic && audioManager.bgMusic.paused) {
            audioManager.playBackgroundMusic();
        }
    }, { once: true });
});