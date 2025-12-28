class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = null;
        this.enemies = [];
        this.powerups = [];
        this.explosions = []; // Track explosion animations
        this.score = 0;
        this.gameOver = false;
        this.lastEnemyTime = 0;
        this.lastPowerupTime = 0;
        this.enemySpawnInterval = 1500; // 0.8 seconds - faster spawning
        this.powerupSpawnInterval = 2000; // 2 seconds - much faster spawning
        this.startTime = null;

        // Speed boost state
        this.speedBoostActive = false;
        this.speedBoostEndTime = Date.now();
        this.boostCooldownEndTime = Date.now();
        this.speedMultiplier = 1.5; // 1.5x speed during boost

        // Get UI elements for speed boost indicator and speed display
        this.speedBoostFill = document.querySelector('.speed-boost-fill');
        this.cooldownFill = document.querySelector('.cooldown-fill');
        this.speedDisplay = document.querySelector('.speed-display');


        // Toast notifications
        this.toastContainer = document.getElementById('toastContainer');
        this.activeToasts = [];

        // Load high scores from local storage
        this.highScores = this.loadHighScores();
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));

        // Touch controls
        this.setupTouchControls();

        // Initialize game
        this.init();

        // Setup fullscreen button
        //this.setupFullscreenButton();

        // Request fullscreen on mobile devices
        //this.requestFullscreen();
    }

    resizeCanvas() {
        const container = document.querySelector('.game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        if (this.player) {
            this.player.y = this.canvas.height - this.player.height - 250;
        }
    }

    /**
     * Request fullscreen mode for better mobile experience
     */
    requestFullscreen() {
        // Check if already in fullscreen
        if (!document.fullscreenElement) {
            const canvas = document.getElementById('gameCanvas');
            if (canvas && canvas.requestFullscreen) {
                // Try to go fullscreen on mobile devices
                canvas.requestFullscreen().catch(err => {
                    console.log('Fullscreen request failed:', err);
                    // If fullscreen fails, at least hide address bar on mobile
                    setTimeout(() => {
                        window.scrollTo(0, 1);
                    }, 100);
                });
            }
        } else {
            document.exitFullscreen();
        }
    }

    setupFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.requestFullscreen();
            });
        }

        // Listen for fullscreen change events
        document.addEventListener('fullscreenchange', () => {
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (fullscreenBtn) {
                if (document.fullscreenElement) {
                    fullscreenBtn.textContent = 'Exit Fullscreen';
                } else {
                    fullscreenBtn.textContent = 'Fullscreen';
                }
            }
            // Resize canvas when entering/exiting fullscreen
            this.resizeCanvas();
        });
    }

    setupTouchControls() {
        const canvas = this.canvas;
        let startX = 0;
        let startY = 0;
        let isSwiping = false;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isSwiping = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isSwiping || !this.player) return;

            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const deltaX = startX - touchX;
            const deltaY = startY - touchY;

            // Deadzone: only process swipes that exceed 50 pixels
            if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) {
                return;
            }

            // Horizontal swipe detection
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < 0 && this.player.currentLane < 3) {
                    // Swipe right (finger moves left, deltaX negative) - move to right lane
                    const targetLane = Math.min(3, this.player.currentLane + 1);
                    this.player.moveToLane(targetLane, true); // immediate: true for smooth transition
                    startX = touchX;
                } else if (deltaX > 0 && this.player.currentLane > 0) {
                    // Swipe left (finger moves right, deltaX positive) - move to left lane
                    const targetLane = Math.max(0, this.player.currentLane - 1);
                    this.player.moveToLane(targetLane, true); // immediate: true for smooth transition
                    startX = touchX;
                }
            }
            // Vertical swipe detection
            else if (Math.abs(deltaY) > Math.abs(deltaX)) {
                console.log('Swipe up - speed boost');
                // Swipe up - speed boost
                if (!this.speedBoostActive && Date.now() >= this.boostCooldownEndTime) {
                    this.activateSpeedBoost();
                    console.log('Speed boost activated!');
                }
            }

            startY = touchY; // Update Y position for vertical swipe detection
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isSwiping = false;
            console.log('Touch end detected');
            if (!this.player || this.gameOver) return;

            // const touchX = e.changedTouches[0].clientX;
            // const touchY = e.changedTouches[0].clientY;
            // const deltaX = startX - touchX;
            // const deltaY = startY - touchY;
        });
    }

    activateSpeedBoost() {
        // Activate speed boost for 3 seconds
        this.speedBoostActive = true;
        this.speedBoostEndTime = Date.now() + 3000; // 3 second boost

        // Set cooldown to start after boost ends (2 seconds cooldown)
        this.boostCooldownEndTime = this.speedBoostEndTime + 2000;

        // Play speed boost sound effect
        if (window.audioManager) {
            window.audioManager.playSoundEffect('speedBoost');
        }

        // Visual feedback - flash the screen or show indicator
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.border = '4px solid #ffeb3b';
            setTimeout(() => {
                canvas.style.border = '';
            }, 200);
        }
    }

    applySpeedMultiplier(speed) {
        return this.speedBoostActive ? speed * this.speedMultiplier : speed;
    }

    isBoostActive() {
        const now = Date.now();
        // Boost is active if it's currently in boost period or on cooldown
        return this.speedBoostActive || (now < this.boostCooldownEndTime && !this.speedBoostActive);
    }

    init() {
        // Remove old player's keyboard event listeners before creating new player
        if (this.player && this.player.keyboardHandlers) {
            window.removeEventListener('keydown', this.player.keyboardHandlers.keydown);
            window.removeEventListener('keyup', this.player.keyboardHandlers.keyup);
        }

        // Remove old game over screen event listeners to prevent duplicates
        const restartBtn = document.querySelector('.restart-btn');
        if (restartBtn) {
            restartBtn.replaceWith(restartBtn.cloneNode(true));
        }
        const submitScoreBtn = document.getElementById('submitScoreBtn');
        if (submitScoreBtn) {
            submitScoreBtn.replaceWith(submitScoreBtn.cloneNode(true));
        }

        // Initialize score manager
        this.scoreManager = new ScoreManager();
        // Create player
        this.player = new Player(this);
        this.startTime = null;
        // Reset game state - clear all existing enemies and powerups
        this.enemies = [];
        this.powerups = [];
        this.explosions = []; // Clear explosions on restart
        this.scoreManager.reset();
        this.gameOver = false;
        this.lastEnemyTime = 0;
        this.lastPowerupTime = 0;
        //this.startTime = Date.now();
        // Reset speed boost state to prevent speed increase on restart
        this.speedBoostActive = false;
        this.speedBoostEndTime = Date.now();
        this.boostCooldownEndTime = Date.now();

        // Hide game over screen if visible
        const gameOverScreen = document.querySelector('.game-over');
        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }

        // Play background music when game starts
        if (window.audioManager && !window.audioManager.isInitialized()) {
            window.audioManager.init();
        }
        if (window.audioManager) {
            window.audioManager.playBackgroundMusic();
        }
        // Add restart event listener
        document.querySelector('.restart-btn').addEventListener('click', () => {
            gameOverScreen.querySelector('.score-form').style.display = 'flex';
            //window.location.reload();
            this.init();
        });

        // Add score submission event listener
        document.getElementById('submitScoreBtn').addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            const playerName = document.getElementById('playerName').value.trim();
            if (playerName) {
                this.saveScore(playerName, this.score);
                gameOverScreen.querySelector('.score-form').style.display = 'none';
                this.showHighScores(); // Refresh high scores display
            }
        });
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        if (!this.startTime) {
            this.startTime = timestamp;
        }
        const deltaTime = timestamp - this.startTime;

        this.update(deltaTime);
        this.render();

        if (!this.gameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        } else {
            // Show game over screen
            let gameOverScreen = document.querySelector('.game-over');
            if (!gameOverScreen) {
                gameOverScreen = document.createElement('div');
                gameOverScreen.className = 'game-over';
                gameOverScreen.innerHTML = `
                    <h1>Game Over</h1>
                    <p>Score: ${this.scoreManager.getCurrentScore()}</p>
                    <div class="score-form">
                        <label for="playerName">Enter your name (max 10 chars):</label>
                        <input type="text" id="playerName" maxlength="10" placeholder="Your Name">
                        <button id="submitScoreBtn">Submit Score</button>
                    </div>
                    <button class="restart-btn" click="init" id="restartBtn">Restart</button>
                `;
                document.querySelector('.game-container').appendChild(gameOverScreen);
            } else {
                gameOverScreen.style.display = 'flex';
                window.audioManager.pauseBackgroundMusic();
                const scoreDisplay = gameOverScreen.querySelector('p');
                if (scoreDisplay) {
                    scoreDisplay.textContent = `Score: ${this.scoreManager.getCurrentScore()}`;
                }

                // Show high scores
                this.showHighScores();
            }
        }
        this.startTime = timestamp;
    }

    update(deltaTime) {
        // Spawn enemies - use Date.now() for accurate timing
        const currentTime = Date.now();
        if (currentTime - this.lastEnemyTime > this.enemySpawnInterval) {
            const laneIndex = Math.floor(Math.random() * 4);
            const enemySpeed = this.applySpeedMultiplier(2); // Base speed of 2, multiplied during boost
            this.enemies.push(new Enemy(this, laneIndex, enemySpeed));
            this.lastEnemyTime = currentTime;
        }

        // Spawn powerups - use Date.now() for accurate timing
        if (currentTime - this.lastPowerupTime > this.powerupSpawnInterval) {
            const laneIndex = Math.floor(Math.random() * 4);
            const powerupSpeed = this.applySpeedMultiplier(2); // Base speed of 2, multiplied during boost
            this.powerups.push(new PowerUp(this, laneIndex, powerupSpeed));
            this.lastPowerupTime = currentTime;
        }

        // Update explosions - remove completed ones
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            if (!this.explosions[i].update()) {
                this.explosions.splice(i, 1);
            }
        }

        // Update player
        if (this.player) {
            this.player.update(deltaTime);

            // Check for power-up collisions
            for (let i = this.powerups.length - 1; i >= 0; i--) {
                const powerup = this.powerups[i];
                if (powerup.update()) {
                    const playerBox = this.player.getBoundingBox();
                    const powerupBox = powerup.getBoundingBox();

                    // Simple AABB collision detection
                    if (playerBox.x < powerupBox.x + powerupBox.width &&
                        playerBox.x + playerBox.width > powerupBox.x &&
                        playerBox.y < powerupBox.y + powerupBox.height &&
                        playerBox.y + playerBox.height > powerupBox.y) {

                        // Collect the power-up
                        powerup.activate(this.player);
                        this.powerups.splice(i, 1);
                        this.scoreManager.addPoints(50);

                        // Play points sound effect for collecting power-up
                        if (window.audioManager) {
                            window.audioManager.playSoundEffect('points');
                        }

                        // Show toast notification for points
                        this.showToast(50, powerupBox.x + powerupBox.width / 2, powerupBox.y - 30);
                    }
                } else {
                    this.powerups.splice(i, 1);
                }
            }

            // Check for enemy collisions and scoring
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (enemy.update()) {
                    const playerBox = this.player.getBoundingBox();
                    const enemyBox = enemy.getBoundingBox();

                    // Simple AABB collision detection
                    if (playerBox.x < enemyBox.x + enemyBox.width &&
                        playerBox.x + playerBox.width > enemyBox.x &&
                        playerBox.y < enemyBox.y + enemyBox.height &&
                        playerBox.y + playerBox.height > enemyBox.y) {

                        // Collision detected - check shield status
                        if (this.player.isInvincible) {
                            // Shield is active - destroy the enemy with explosion effect
                            this.enemies.splice(i, 1);
                            this.scoreManager.addPoints(50); // Bonus for destroying enemy with shield

                            // Play points sound effect
                            if (window.audioManager) {
                                window.audioManager.playSoundEffect('points');
                            }

                            // Create explosion at enemy position following its trajectory
                            const explosion = new Explosion(
                                this,
                                enemyBox.x + enemyBox.width / 2,
                                enemyBox.y + enemyBox.height / 2,
                                enemy.speedX, // Follow enemy's horizontal speed
                                enemy.speedY   // Follow enemy's vertical speed
                            );
                            this.explosions.push(explosion);

                            // Play explosion sound effect
                            if (window.audioManager) {
                                window.audioManager.playSoundEffect('explosion');
                            }

                            // Show toast notification for points
                            this.showToast(50, enemyBox.x + enemyBox.width / 2, enemyBox.y - 30);
                        } else {
                            // No shield - game over
                            this.gameOver = true;

                            // Play explosion sound effect for player destruction
                            if (window.audioManager) {
                                window.audioManager.playSoundEffect('explosion');
                            }

                            // Play car destroy sound effect for player
                            if (window.audioManager) {
                                window.audioManager.playSoundEffect('carDestroy');
                            }
                        }
                    }

                    // Score when enemy passes the player
                    if (enemyBox.y > playerBox.y + playerBox.height && !enemy.hasScored) {
                        this.scoreManager.addPoints(10);
                        enemy.hasScored = true;

                        // Play points sound effect
                        if (window.audioManager) {
                            window.audioManager.playSoundEffect('points');
                        }

                        // Show toast notification for points
                        this.showToast(10, enemyBox.x + enemyBox.width / 2, enemyBox.y - 30);
                    }
                } else {
                    // Enemy goes off screen without scoring - no sound needed
                    this.enemies.splice(i, 1);
                }
            }
        }
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw road background
        this.drawRoad();

        // Draw power-ups
        this.powerups.forEach(powerup => powerup.draw(this.ctx));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw explosions (after enemies so they appear on top)
        this.explosions.forEach(explosion => explosion.draw(this.ctx));

        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);
        }

        // Update speed boost indicator
        this.updateSpeedBoostIndicator();

        // Update lane indicators
        this.updateLaneIndicators();
    }

    drawRoad() {
        const roadWidth = 4 * 120; // 4 lanes
        const startX = (this.canvas.width - roadWidth) / 2;

        // Draw road surface
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.fillRect(startX, 0, roadWidth, this.canvas.height);

        // Calculate animation speed based on enemy speed and boost state
        const baseSpeed = -200;
        let scrollSpeed = baseSpeed;

        // Get current time for animation
        const now = Date.now();

        // If boost is active or on cooldown, use the multiplier
        if (this.isBoostActive()) {
            scrollSpeed = baseSpeed * this.speedMultiplier;
        }

        // Draw animated lane markings that scroll upward
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 4;

        // Calculate how much to offset the lines based on time and speed
        const scrollOffset = (now % 1000) * scrollSpeed / 1000;
        const lineSpacing = 40; // Distance between dashed line segments

        for (let i = 1; i < 4; i++) {
            const x = startX + i * 120;

            // Draw solid lane divider
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();

            // Draw animated dashed lines that scroll upward
            for (let y = -scrollOffset % lineSpacing; y < this.canvas.height + lineSpacing; y += lineSpacing) {
                this.ctx.fillStyle = '#eaeaeaff';
                this.ctx.fillRect(x - 2, y, 4, 20);
            }
        }

        // Draw road edges
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, 0);
        this.ctx.lineTo(startX, this.canvas.height);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(startX + roadWidth, 0);
        this.ctx.lineTo(startX + roadWidth, this.canvas.height);
        this.ctx.stroke();
    }

    updateLaneIndicators() {
        const indicators = document.querySelectorAll('.lane-indicator');
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });

        if (this.player) {
            const activeIndicator = document.querySelector(`.lane-indicator[data-lane="${this.player.currentLane}"]`);
            if (activeIndicator) {
                activeIndicator.classList.add('active');
            }
        }
    }

    updateSpeedBoostIndicator() {
        const now = Date.now();

        // Check if boost is active or on cooldown
        if (this.speedBoostActive && now < this.speedBoostEndTime) {
            // Boost is active - show green fill for boost bar
            const boostProgress = 1 - ((now - this.speedBoostEndTime + 3000) / 3000);
            const clampedBoostProgress = Math.max(0, Math.min(1, boostProgress));
            this.speedBoostFill.style.width = `${clampedBoostProgress * 100}%`;
        } else if (now >= this.speedBoostEndTime && now < this.boostCooldownEndTime) {
            // Cooldown is active - show orange fill for cooldown bar
            const cooldownProgress = 1 - ((now - this.boostCooldownEndTime + 2000) / 2000);
            const clampedCooldownProgress = Math.max(0, Math.min(1, cooldownProgress));
            this.cooldownFill.style.width = `${clampedCooldownProgress * 100}%`;
        } else {
            // No boost or cooldown - hide indicators
            this.speedBoostFill.style.width = '0%';
            this.cooldownFill.style.width = '0%';
        }

        // Update boost state based on time
        if (now >= this.speedBoostEndTime) {
            this.speedBoostActive = false;
        }

        // Calculate and display moving average speed
        this.updateSpeedDisplay();
    }

    updateSpeedDisplay() {
        // Get player's current speed from player.js
        const playerSpeed = this.player ? this.player.getCurrentSpeed() : 0;

        // Calculate moving average using player's history array
        let averageSpeed = 0;
        if (this.player && this.player.speedHistory.length > 0) {
            averageSpeed = this.player.getAverageSpeed();
        }

        // Convert to km/hr and clamp to reasonable range (50-80 km/hr)
        const speedKmHr = Math.max(50, Math.min(80, averageSpeed));

        // Update speed display text
        if (this.speedDisplay) {
            this.speedDisplay.textContent = `${Math.round(speedKmHr)} km/hr`;
        }
    }

    /**
     * Show toast notification for points
     * @param {number} points - Points value to display
     * @param {number} x - X position for the toast
     * @param {number} y - Y position for the toast
     */
    showToast(points, x, y) {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = `+${points}pt`;

        // Position the toast near the player
        toast.style.left = `${x}px`;
        toast.style.top = `${y}px`;

        this.toastContainer.appendChild(toast);
        toast.classList.add('visible');

        // Remove toast after animation completes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500); // Match CSS transition duration
    }

    /**
     * Save score to local storage
     */
    saveScore(name, score) {
        const scores = this.loadHighScores();
        scores.push({ name: name.substring(0, 10), score: this.scoreManager.getCurrentScore() }); // Limit to 10 chars

        // Sort by score (descending)
        scores.sort((a, b) => b.score - a.score);

        // Keep only top 10 scores
        if (scores.length > 10) {
            scores.splice(10);
        }

        localStorage.setItem('highScores', JSON.stringify(scores));
    }

    /**
     * Load high scores from local storage
     */
    loadHighScores() {
        const scores = localStorage.getItem('highScores');
        return scores ? JSON.parse(scores) : [];
    }

    /**
     * Display high scores on game over screen
     */
    showHighScores() {
        const currentScore = this.scoreManager.getCurrentScore();
        // Check if high scores section already exists
        let highScoresSection = document.querySelector('.high-scores');
        if (!highScoresSection) {
            highScoresSection = document.createElement('div');
            highScoresSection.className = 'high-scores';
            highScoresSection.innerHTML = '<h2>High Scores</h2><ol id="scoresList"></ol>';
            const gameOverScreen = document.querySelector('.game-over');
            if (gameOverScreen) {
                // Insert after the score form
                const restartBtn = gameOverScreen.querySelector('#restartBtn');
                if (restartBtn) {
                    gameOverScreen.insertBefore(highScoresSection, restartBtn);
                } else {
                    gameOverScreen.appendChild(highScoresSection);
                }
            }
        }

        // Update scores list
        const scoresList = highScoresSection.querySelector('#scoresList');
        if (scoresList) {
            scoresList.innerHTML = '';
            this.highScores = this.loadHighScores();
            this.highScores.forEach(score => {
                const li = document.createElement('li');
                li.textContent = `${score.name}: ${score.score}`;
                scoresList.appendChild(li);
            });
        }
    }


    /**
     * Game over handler - called when player loses all lives
     */
    gameOver() {
        this.gameOver = true;
        // Play explosion sound effect
        if (window.audioManager) {
            window.audioManager.playSoundEffect('explosion');
        }
    };
}
