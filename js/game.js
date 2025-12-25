class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = null;
        this.enemies = [];
        this.powerups = [];
        this.score = 0;
        this.gameOver = false;
        this.lastEnemyTime = 0;
        this.lastPowerupTime = 0;
        this.enemySpawnInterval = 1500; // 0.8 seconds - faster spawning
        this.powerupSpawnInterval = 2000; // 2 seconds - much faster spawning
        this.startTime = null;

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));

        // Touch controls
        this.setupTouchControls();

        // Initialize game
        this.init();
    }

    resizeCanvas() {
        const container = document.querySelector('.game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        if (this.player) {
            this.player.y = this.canvas.height - this.player.height - 50;
        }
    }

    setupTouchControls() {
        const canvas = this.canvas;
        let startX = 0;
        let isSwiping = false;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isSwiping = true;
            startX = e.touches[0].clientX;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isSwiping || !this.player) return;

            const touchX = e.touches[0].clientX;
            const deltaX = startX - touchX;

            // Horizontal swipe detection
            if (Math.abs(deltaX) > 30) { // Minimum distance for swipe
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
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            isSwiping = false;
        });
    }

    init() {
        // Create player
        this.player = new Player(this);

        // Reset game state
        this.enemies = [];
        this.powerups = [];
        this.score = 0;
        this.gameOver = false;
        this.lastEnemyTime = 0;
        this.lastPowerupTime = 0;
        this.startTime = Date.now();

        // Hide game over screen if visible
        const gameOverScreen = document.querySelector('.game-over');
        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }

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
                    <p>Score: ${this.score}</p>
                    <button id="restartBtn">Restart</button>
                `;
                document.querySelector('.game-container').appendChild(gameOverScreen);

                // Add restart event listener
                document.getElementById('restartBtn').addEventListener('click', () => {
                    this.init();
                });
            } else {
                gameOverScreen.style.display = 'flex';
                const scoreDisplay = gameOverScreen.querySelector('p');
                if (scoreDisplay) {
                    scoreDisplay.textContent = `Score: ${this.score}`;
                }
            }
        }

        this.startTime = timestamp;
    }

    update(deltaTime) {
        // Spawn enemies - use Date.now() for accurate timing
        const currentTime = Date.now();
        if (currentTime - this.lastEnemyTime > this.enemySpawnInterval) {
            const laneIndex = Math.floor(Math.random() * 4);
            this.enemies.push(new Enemy(this, laneIndex));
            this.lastEnemyTime = currentTime;
        }

        // Spawn powerups - use Date.now() for accurate timing
        if (currentTime - this.lastPowerupTime > this.powerupSpawnInterval) {
            const laneIndex = Math.floor(Math.random() * 4);
            this.powerups.push(new PowerUp(this, laneIndex));
            this.lastPowerupTime = currentTime;
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
                        this.score += 50;
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
                    if (!this.player.isInvincible &&
                        playerBox.x < enemyBox.x + enemyBox.width &&
                        playerBox.x + playerBox.width > enemyBox.x &&
                        playerBox.y < enemyBox.y + enemyBox.height &&
                        playerBox.y + playerBox.height > enemyBox.y) {

                        // Collision detected - game over
                        this.gameOver = true;
                    }

                    // Score when enemy passes the player
                    if (enemyBox.y > playerBox.y + playerBox.height && !enemy.hasScored) {
                        this.score += 10;
                        enemy.hasScored = true;
                    }
                } else {
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

        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);
        }

        // Update lane indicators
        this.updateLaneIndicators();
    }

    drawRoad() {
        const roadWidth = 4 * 120; // 4 lanes
        const startX = (this.canvas.width - roadWidth) / 2;

        // Draw road surface
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.fillRect(startX, 0, roadWidth, this.canvas.height);

        // Draw lane markings
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 4;
        for (let i = 1; i < 4; i++) {
            const x = startX + i * 120;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();

            // Draw dashed lines
            for (let y = 50; y < this.canvas.height; y += 40) {
                this.ctx.fillStyle = '#666';
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
}