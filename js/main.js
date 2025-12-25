document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    const game = new Game();

    // Show score in UI
    setInterval(() => {
        if (game && !game.gameOver) {
            document.getElementById('score').textContent = `Score: ${Math.floor(game.score)}`;
        }
    }, 100);
});