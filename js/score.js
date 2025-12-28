class ScoreManager {
    constructor() {
        this.score = 0;
        this.lastScore = 0;
        this.scoreElement = document.getElementById('score');
        this.scoreDisplay = document.querySelector('.score-display');

        // Initialize score display
        if (this.scoreElement) {
            this.updateScoreDisplay();
        }
    }

    /**
     * Add points to the score
     * @param {number} points - Points to add
     */
    addPoints(points) {
        this.score += points;
        this.updateScoreDisplay();
        console.log(`Score increased by ${points}, new score: ${this.score}`);
        // Trigger animation when score increases
        if (points > 0 && this.score > this.lastScore) {
            this.animateScore();
        }

        this.lastScore = this.score;
        return this.score;
    }

    /**
     * Set the score directly
     * @param {number} newScore - New score value
     */
    setScore(newScore) {
        this.score = newScore;
        this.updateScoreDisplay();

        // Trigger animation if score increased from last known value
        if (newScore > this.lastScore) {
            this.animateScore();
        }

        this.lastScore = this.score;
        return this.score;
    }

    /**
     * Get current score
     * @returns {number} Current score
     */
    getCurrentScore() {
        return this.score;
    }

    /**
     * Update the score display in UI
     */
    updateScoreDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${Math.floor(this.score)}`;
        }
    }

    /**
     * Animate the score display (jump with glow effect)
     */
    animateScore() {
        if (this.scoreDisplay) {
            console.log('Animating score display');
            this.scoreDisplay.classList.add('animate');
            setTimeout(() => {
                this.scoreDisplay.classList.remove('animate');
                console.log('Animating score display stopped.');
            }, 300);
        }
    }

    /**
     * Reset score to zero
     */
    reset() {
        this.score = 0;
        this.lastScore = 0;
        this.updateScoreDisplay();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreManager;
}