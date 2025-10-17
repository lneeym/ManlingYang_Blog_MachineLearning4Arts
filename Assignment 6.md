# Pixel Adventure Game

A cool voice-controlled game using ml5.js and p5.js, and honestly, it turned out way better than I expected! Let me walk you through the journey.

## Inspiration

The whole thing started when I watched the ml5.js sound classification tutorial.I've always loved classic platformer games like Mario, so I decided to combine voice recognition with pixel art gaming.

## Trouble Shooting_Three Main Visions

### 1. **Natural Voice Control**
I wanted voice commands to feel intuitive. Say "UP" to jump, "GO" to attack - simple as that. The key was making it responsive enough for real-time gaming.

### 2. **Auto-Runner Gameplay** 
Instead of constantly saying "RIGHT" to move, I made the character auto-walk forward. This way, players can focus on the fun stuff - jumping over obstacles and attacking enemies.

### 3. **Infinite Scrolling Adventure**
No boring level boundaries! The game generates new platforms, enemies, and coins infinitely as you progress.

## The Bug Hunt 🐛

**Problem 1: Enemies not disappearing after attacks**
```javascript
// BEFORE (buggy)
enemies.splice(i, 1);
createParticleExplosion(enemies[i].x, enemies[i].y, colors.enemy);

// AFTER (fixed)
let enemyX = enemies[i].x;
let enemyY = enemies[i].y;
enemies.splice(i, 1);
createParticleExplosion(enemyX, enemyY, colors.enemy);
```
Classic JavaScript mistake - trying to access an object after deleting it!

**Problem 2: Microphone permissions not working**
```javascript
// The fix was using the right ml5.js API
function setup() {
  classifier = ml5.soundClassifier('SpeechCommands18w', modelReady);
}
function modelReady() {
  classifier.classifyStart(gotResult); // This properly requests mic access
}
```

**Problem 3: Game too fast and overwhelming**
```javascript
// Slowed down the auto-walking speed
autoWalk() {
  let autoSpeed = this.boosting ? 1.5 : 0.8; // Much more chill now
  this.vx += autoSpeed;
}
``` 