class PowerUp {
    constructor(game, laneIndex, speed) {
        this.game = game;
        this.width = 30;
        this.height = 30;
        this.laneWidth = 120;
        this.currentLane = laneIndex;
        this.x = this.getLaneXPosition(this.currentLane);
        this.y = -this.height; // Start above the screen
        this.speed = speed !== undefined ? speed : Math.random() * 2 + 1; // Random speed between 1 and 3
        this.type = this.getRandomType();
        this.color = this.getColorForType();
    }

    getLaneXPosition(laneIndex) {
        const startX = (this.game.canvas.width - (4 * this.laneWidth)) / 2;
        return startX + laneIndex * this.laneWidth + this.laneWidth / 2 - this.width / 2;
    }

    getRandomType() {
        const types = ['shield', 'speedBoost'];
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex];
    }

    getColorForType() {
        switch (this.type) {
            case 'shield':
                return '#f1c40f';
            case 'speedBoost':
                return '#e74c3c';
            default:
                return '#9b59b6';
        }
    }

    update() {
        // Apply speed multiplier if boost is active
        const currentSpeed = this.game.isBoostActive()
            ? this.speed * this.game.applySpeedMultiplier(this.speed)
            : this.speed;

        // Move downward
        this.y += currentSpeed;

        // Remove if off screen
        if (this.y > this.game.canvas.height) {
            return false;
        }
        else {
            return true;
        }
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

        // Draw power-up based on type
        switch (this.type) {
            case 'shield':
                // Shield icon
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 - 5, 0, Math.PI * 2);
                ctx.fill();

                // Plus sign inside
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(this.x + this.width / 2 - 8, this.y + this.height / 2 - 4, 16, 8);
                ctx.fillRect(this.x + this.width / 2 - 4, this.y + this.height / 2 - 8, 8, 16);
                break;

            case 'speedBoost':
                // Speed boost icon (lightning bolt)
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2, this.y + this.height / 4);
                ctx.lineTo(this.x + this.width / 2 - 8, this.y + this.height * 3 / 4);
                ctx.lineTo(this.x + this.width / 2 + 8, this.y + this.height * 3 / 4);
                ctx.closePath();
                ctx.fill();

                // Bolt details
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2 - 5, this.y + this.height * 3 / 4);
                ctx.lineTo(this.x + this.width / 2 - 10, this.y + this.height / 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2 + 5, this.y + this.height * 3 / 4);
                ctx.lineTo(this.x + this.width / 2 + 10, this.y + this.height / 2);
                ctx.stroke();
                break;
        }
    }

    activate(player) {
        switch (this.type) {
            case 'shield':
                player.activateInvincibility(3); // 3 seconds of invincibility
                return true;
            case 'speedBoost':
                // Activate the game's speed boost mechanism
                //if (!player.game.speedBoostActive && Date.now() >= player.game.boostCooldownEndTime) {
                player.game.activateSpeedBoost();
                //}
                return true;
        }
        return false;
    }
}