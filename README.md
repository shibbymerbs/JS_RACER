# 2D Racing Game

A simple auto-racing game with touch controls where you switch lanes to avoid obstacles and collect power-ups!

## How to Play

1. **Open the game** in a web browser on your mobile device or desktop
2. **Use the arrow buttons** at the bottom of the screen to switch lanes:
   - Left button (←) moves to the left lane
   - Right button (→) moves to the right lane
3. **Avoid obstacles**:
   - Cars, trucks, barriers, and oil slicks will appear
   - Colliding with them ends the game
4. **Collect power-ups** for bonuses:
   - Speed boost: Temporarily increases your speed
   - Shield: Protects you from one collision
   - Coin: Gives bonus points
   - Magnet: Attracts coins automatically

## Game Features

- **4 lanes** to switch between
- **Multiple obstacle types** with different behaviors
- **Power-up system** with various effects
- **Scoring system** that increases as you play longer
- **Difficulty progression**: Enemies appear more frequently as your score increases
- **Responsive design** works on mobile and desktop
- **Touch controls** optimized for mobile devices

## Controls

### Mobile:
- Tap the left (←) button to move left
- Tap the right (→) button to move right

### Desktop:
- Click the left (←) button with mouse
- Click the right (→) button with mouse
- Keyboard arrows also work if you prefer

## Files Structure

```
/
├── index.html          - Main HTML file
├── style.css           - CSS styling
├── js/
│   ├── player.js       - Player class and logic
│   ├── enemy.js        - Enemy/obstacle classes
│   ├── powerup.js      - Power-up classes
│   └── game.js         - Main game loop and logic
└── README.md           - This file
```

## How to Run

Simply open `index.html` in any modern web browser. No server or installation required!

```
open index.html
```

or

```
python -m http.server 8000
```
then navigate to `http://localhost:8000`

## Debugging Tips

Each class is in its own file for easier debugging:
- Check `player.js` for player-related issues
- Check `enemy.js` for obstacle spawning/collision problems
- Check `powerup.js` for power-up effects
- Check `game.js` for game loop and collision detection logic

## Future Improvements

- Add sound effects
- Implement different levels with varying themes
- Add more power-up types
- Include high score tracking using localStorage