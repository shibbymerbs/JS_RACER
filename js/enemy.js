class Enemy {
    constructor(game, laneIndex, speed) {
        this.game = game;
        this.width = 40;
        this.height = 80;
        this.laneWidth = 120;
        this.currentLane = laneIndex;
        this.x = this.getLaneXPosition(this.currentLane);
        this.y = -this.height; // Start above the screen
        this.speed = speed !== undefined ? speed : Math.random() * 3 + 2; // Random speed between 2 and 5
        this.hasScored = false; // Track if enemy has passed the player for scoring
        this.type = this.getRandomType();
        this.color = this.getColorForType();
    }

    getLaneXPosition(laneIndex) {
        const startX = (this.game.canvas.width - (4 * this.laneWidth)) / 2;
        return startX + laneIndex * this.laneWidth + this.laneWidth / 2 - this.width / 2;
    }

    getRandomType() {
        const types = ['car', 'truck', 'barrier'];
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex];
    }

    getColorForType() {
        switch (this.type) {
            case 'car':
                return '#e74c3c';
            case 'truck':
                return '#95a5a6';
            case 'barrier':
                return '#2ecc71';
            default:
                return '#e74c3c';
        }
    }

    update() {
        // Apply speed multiplier if boost is active
        const currentSpeed = this.game.isBoostActive()
            ? this.speed * this.game.applySpeedMultiplier(this.game.speedMultiplier)
            : this.speed;

        // Move downward
        this.y += currentSpeed;

        // Remove if off screen
        if (this.y > this.game.canvas.height) {
            return false;
        }

        return true;
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

        // Draw enemy based on type
        switch (this.type) {
            case 'car':
                // Car body
                ctx.fillRect(this.x, this.y, this.width, this.height);
                // Windows
                ctx.fillStyle = '#ecf0f1';
                ctx.fillRect(this.x + 5, this.y + 20, 15, 20);
                ctx.fillRect(this.x + 20, this.y + 20, 15, 20);
                // Wheels
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(this.x + 15, this.y + 65, 8, 0, Math.PI * 2);
                ctx.arc(this.x + 25, this.y + 65, 8, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'truck':
                // Truck body
                ctx.fillRect(this.x, this.y, this.width, this.height);
                // Cab
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(this.x + 5, this.y + 10, 20, 40);
                // Trailer
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x + 20, this.y + 30, 20, 30);
                // Wheels
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(this.x + 15, this.y + 65, 8, 0, Math.PI * 2);
                ctx.arc(this.x + 25, this.y + 65, 8, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'barrier':
                // Barrier (horizontal)
                ctx.fillRect(this.x, this.y, this.width, this.height / 3);
                ctx.fillRect(this.x, this.y + this.height / 3 * 2, this.width, this.height / 3);
                // Stripes
                ctx.fillStyle = '#27ae60';
                for (let i = 0; i < 5; i++) {
                    ctx.fillRect(this.x + 5 + i * 6, this.y + this.height / 3, 4, this.height / 3);
                }
                break;
        }
    }
}