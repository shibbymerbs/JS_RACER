// Audio Manager for background music and sound effects
class AudioManager {
    constructor() {
        this.bgMusic = null;
        this.soundEffects = {};
        this.isMuted = false;
        this.init();
    }
    isInitialized() {
        return this.bgMusic !== null;
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
            console.log('Audio BG playback');
            // Try to play the audio, handling autoplay policy restrictions
            const promise = this.bgMusic.play();
            if (promise !== undefined) {
                promise.then(_ => {
                    console.log('Background music playing');
                });
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

// Game instance will be initialized after splash screen
var game;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio manager
    audioManager = new AudioManager();

    // Get DOM elements for splash screen
    const splashScreen = document.getElementById('splashScreen');
    const startGameBtn = document.getElementById('startGameBtn');

    // Show splash screen initially
    if (splashScreen) {
        splashScreen.style.display = 'flex';
    }

    // Start game button click handler
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            // Hide splash screen with animation
            if (splashScreen) {
                splashScreen.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                splashScreen.style.opacity = '0';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500);
            }
            audioManager.playBackgroundMusic();
            // Initialize the game after splash screen is hidden
            setTimeout(() => {
                game = new Game();

                // Show score in UI and animate on score changes
                // let lastScore = 0;
                // const scoreInterval = setInterval(() => {
                //     if (game && !game.gameOver) {
                //         const currentScore = Math.floor(game.scoreManager.getCurrentScore());
                //         document.getElementById('score').textContent = `Score: ${currentScore}`;

                //         // Animate when score increases
                //         if (currentScore > lastScore) {
                //             game.scoreManager.animateScore();
                //         }
                //         lastScore = currentScore;
                //     } else {
                //         clearInterval(scoreInterval);
                //     }
                // }, 100);

                // Play background music after user interaction


                // Handle any remaining clicks to ensure autoplay works
                document.addEventListener('click', () => {
                    if (audioManager.bgMusic && audioManager.bgMusic.paused) {
                        audioManager.playBackgroundMusic();
                    }
                }, { once: true });
            }, 500);
        });
    }

    // Also allow any click on the splash screen to start the game
    if (splashScreen) {
        splashScreen.addEventListener('click', (e) => {
            // Only trigger on button click, not background clicks
            if (e.target === splashScreen || e.target === startGameBtn) {
                return;
            }
            if (startGameBtn) {
                startGameBtn.click();
            }
        });
    }
});