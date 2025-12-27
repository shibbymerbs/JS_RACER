class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 80;
        this.laneWidth = 120;
        this.currentLane = 1; // Start in center-left lane (index 1)
        this.x = this.getLaneXPosition(this.currentLane);
        this.y = game.canvas.height - this.height - 250;
        // Player stays static on y-axis, no speed or acceleration needed
        this.color = '#3498db';
        this.isInvincible = false;
        this.invincibilityTimer = 0;

        // Keyboard controls
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            'A': false,
            'D': false,
            'W': false
        };
        this.laneChangeInProgress = false;
        this.targetLane = null;
        this.animationDuration = 150; // 150ms for smooth transition
        this.animationStartTime = 0;

        // Speed tracking for moving average calculation
        this.speedHistory = [];
        this.maxSpeedHistory = 20; // Keep last 20 speed measurements

        // Set up keyboard event listeners
        this.setupKeyboardControls();
    }

    getLaneXPosition(laneIndex) {
        const startX = (this.game.canvas.width - (4 * this.laneWidth)) / 2;
        return startX + laneIndex * this.laneWidth + this.laneWidth / 2 - this.width / 2;
    }

    update(deltaTime) {
        // Player stays static on y-axis

        // Handle smooth lane transition animation
        if (this.targetLane !== null && this.animationStartTime > 0) {
            const elapsed = Date.now() - this.animationStartTime;
            if (elapsed < this.animationDuration) {
                // Calculate interpolation factor (0 to 1)
                const progress = Math.min(elapsed / this.animationDuration, 1);
                // Ease-out animation for smoother movement
                const easedProgress = 1 - Math.pow(1 - progress, 3);

                // Calculate target X position
                const startX = this.getLaneXPosition(this.currentLane);
                const endX = this.getLaneXPosition(this.targetLane);
                this.x = startX + (endX - startX) * easedProgress;
            } else {
                // Animation complete
                this.currentLane = this.targetLane;
                this.x = this.getLaneXPosition(this.targetLane);
                this.targetLane = null;
                this.animationStartTime = 0;
                this.laneChangeInProgress = false;
            }
        }

        // Handle keyboard controls for lane changing - only move one lane at a time
        if ((this.keys.ArrowLeft || this.keys.A) && !this.laneChangeInProgress) {
            if (this.currentLane > 0) {
                this.moveToLane(this.currentLane - 1, true);
                this.laneChangeInProgress = true;
                setTimeout(() => {
                    this.laneChangeInProgress = false;
                }, 150); // Small delay to prevent rapid lane changes
            }
        } else if ((this.keys.ArrowRight || this.keys.D) && !this.laneChangeInProgress) {
            if (this.currentLane < 3) {
                this.moveToLane(this.currentLane + 1, true);
                this.laneChangeInProgress = true;
                setTimeout(() => {
                    this.laneChangeInProgress = false;
                }, 150); // Small delay to prevent rapid lane changes
            }
        }

        // Handle speed boost with up arrow or W key
        if ((this.keys.ArrowUp || this.keys.W) && !this.game.speedBoostActive && Date.now() >= this.game.boostCooldownEndTime) {
            this.game.activateSpeedBoost();
            // Reset the key to prevent immediate reactivation
            this.keys.ArrowUp = false;
            this.keys.W = false;
        }

        // Update speed history for moving average calculation
        this.updateSpeedHistory();

        // Only handle invincibility timer
        if (this.isInvincible) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
            }
        }
    }

    moveToLane(laneIndex, immediate = false) {
        // Validate lane index
        if (laneIndex >= 0 && laneIndex < 4) {
            if (immediate) {
                this.targetLane = laneIndex;
                this.animationStartTime = Date.now();
            } else {
                // Instant transition for keyboard controls when needed
                this.currentLane = laneIndex;
                this.x = this.getLaneXPosition(this.currentLane);
            }
            return true;
        }
        return false;
    }

    getBoundingBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        ctx.fillStyle = this.color;

        // Draw player car
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw car details (simplified)
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(this.x + 10, this.y + 20, 20, 40);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(this.x + 5, this.y + 70, 30, 10); // roof

        // Draw wheels
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 65, 8, 0, Math.PI * 2);
        ctx.arc(this.x + 25, this.y + 65, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw invincibility effect
        if (this.isInvincible) {
            const opacity = Math.min(1, this.invincibilityTimer / 3000);
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
            ctx.restore();
        }
    }

    activateInvincibility(duration) {
        this.isInvincible = true;
        this.invincibilityTimer = duration * 1000; // Convert to milliseconds
    }

    getCurrentSpeed() {
        // Calculate current speed based on game's speed multiplier
        const baseSpeed = 50; // Base speed in km/hr

        // Check if game is properly initialized to avoid NaN values
        if (!this.game || !this.game.speedBoostActive) {
            return baseSpeed;
        }

        if (this.game.speedBoostActive) {
            // During boost, speed is between 60-80 km/hr
            return Math.min(80, baseSpeed + (this.game.speedMultiplier - 1) * 20);
        } else if (Date.now() < this.game.boostCooldownEndTime && this.game.boostCooldownEndTime > 0) {
            // During cooldown, speed is slightly reduced
            const cooldownProgress = 1 - Math.min(1, (this.game.boostCooldownEndTime - Date.now()) / 2000);
            return baseSpeed * (0.9 + cooldownProgress * 0.1); // 50-55 km/hr during cooldown
        }

        return baseSpeed; // Normal speed
    }

    updateSpeedHistory() {
        const currentSpeed = this.getCurrentSpeed();
        this.speedHistory.push(currentSpeed);

        // Keep only the most recent speeds
        if (this.speedHistory.length > this.maxSpeedHistory) {
            this.speedHistory.shift();
        }
    }

    getAverageSpeed() {
        if (this.speedHistory.length === 0) {
            return 50;
        }

        const sum = this.speedHistory.reduce((acc, speed) => acc + speed, 0);
        return Math.round(sum / this.speedHistory.length * 10) / 10; // Round to 1 decimal place
    }

    setupKeyboardControls() {
        const handleKeyDown = (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
                e.preventDefault();
            }
        };

        const handleKeyUp = (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Store references to remove event listeners later if needed
        this.keyboardHandlers = {
            keydown: handleKeyDown,
            keyup: handleKeyUp
        };
    }
}