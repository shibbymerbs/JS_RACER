class Explosion {
    constructor(game, x, y, speedX, speedY) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.particles = [];
        this.lifetime = 0;
        this.maxLifetime = 60; // frames
        this.createdAt = Date.now();

        // Create particles for the explosion
        this.createParticles();
    }

    createParticles() {
        const particleCount = 50;
        const colors = ['#ff4500', '#ff8c00', '#ffd700', '#ffffff'];

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 3;
            const size = 2 + Math.random() * 12;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const lifetime = 30 + Math.random() * 300;

            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: size,
                color: color,
                lifetime: lifetime,
                maxLifetime: lifetime
            });
        }
    }

    update() {
        this.lifetime++;

        // Update all particles
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            // Move particle based on its velocity and explosion's speed
            particle.x += particle.vx + this.speedX * 0.3;
            particle.y += particle.vy + this.speedY * 0.3;

            // Fade out as lifetime progresses
            particle.lifetime--;
        }

        return this.lifetime < this.maxLifetime;
    }

    draw(ctx) {
        // Draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            if (particle.lifetime <= 0) continue;

            ctx.save();

            // Calculate opacity based on lifetime
            const opacity = particle.lifetime / particle.maxLifetime;
            ctx.globalAlpha = opacity * 0.8;

            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(
                this.x + particle.x,
                this.y + particle.y,
                particle.size * (particle.lifetime / particle.maxLifetime),
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.restore();
        }
    }

    getBoundingBox() {
        return {
            x: this.x - 50,
            y: this.y - 50,
            width: 100,
            height: 100
        };
    }
}