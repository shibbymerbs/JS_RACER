# 2D Racing Game Architecture

## Overview
Isometric-style 2D racing game with 4 lanes, touch controls for lane switching, obstacles, and power-ups.

## Project Structure
```
js-racer/
├── index.html          # Main HTML file
├── style.css           # CSS styling
├── js/
│   ├── player.js       # Player class
│   ├── enemy.js        # Enemy/obstacle class
│   ├── powerup.js      # Power-up class
│   ├── game.js         # Main game logic
│   └── main.js         # Game initialization
└── assets/             # Images and sprites (optional)
```

## Game Classes

### Player Class (player.js)
- Position (x, y, lane)
- Speed and acceleration
- Collision detection with obstacles/power-ups
- Visual representation
- Lane switching logic

### Enemy Class (enemy.js)
- Multiple types: cars, barriers, oil slicks
- Spawn points and patterns
- Movement speed
- Collision properties

### PowerUp Class (powerup.js)
- Types: speed boost, shield, magnet (attracts coins)
- Duration and effects
- Spawn logic and frequency
- Visual indicators

### Game Class (game.js)
- Game loop (requestAnimationFrame)
- Score tracking
- Level progression
- Game state management (running, paused, game over)
- Collision detection system

## Core Features

### Touch Controls
- Swipe left/right to change lanes
- Tap to activate power-ups
- Visual lane indicators

### Collision Detection
- AABB (Axis-Aligned Bounding Box) for simple collision
- Special handling for different obstacle types
- Power-up collection logic

### Scoring System
- Points for distance traveled
- Bonus points for consecutive safe driving
- Penalty for collisions

## Technical Details

### Canvas Setup
- 800x600 canvas size (adjustable)
- Isometric projection using CSS transforms or drawing offsets
- Scrolling background for sense of movement

### Game Loop
```javascript
function gameLoop(timestamp) {
    update(timestamp);
    render();
    requestAnimationFrame(gameLoop);
}
```

### Lane System
- 4 lanes with fixed widths
- Player can move between lanes
- Obstacles spawn in random lanes

## Implementation Plan
1. Set up project structure and HTML/CSS skeleton
2. Implement Player class with basic movement
3. Create Enemy class and spawning system
4. Add PowerUp class with different types
5. Implement collision detection
6. Add touch controls for lane switching
7. Build scoring system
8. Add game over logic and restart
9. Test and debug

## Future Enhancements
- Multiple levels with increasing difficulty
- High score system with localStorage
- Sound effects and music
- Mobile-specific optimizations
- More power-up types and obstacles