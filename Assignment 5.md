# Assignment 5
# Maze Escape - FaceMesh Interactive Game

---

## Project Overview
I created an interactive maze game controlled entirely through facial expressions using ml5.js FaceMesh. Players navigate a blue ball through a maze using eye movements and can destroy walls by opening their mouth, creating a unique hands-free gaming experience.

**🔗 Live Demo**: https://github.com/user-attachments/assets/61ce2a08-8d1a-4caa-b143-787401f64366
<img width="599" height="602" alt="Screenshot 2025-10-10 at 4 30 34 PM" src="https://github.com/user-attachments/assets/8b019dca-c311-4a37-b141-cf2741611fda" />


---

## Inspiration
**Inspiration from Another Class:**
I was inspired by a data visualization project about abortion law complexity across U.S. states. It used **maze difficulty as a metaphor for legal complexity** — the more complex the law, the more convoluted the maze path. I found this approach of **using game mechanics to represent real-world issues** fascinating and wanted to create my own interactive maze.

**Core Concept:**
- Original project: Maze difficulty = Legal complexity
- My project: Facial control + destructible walls = Metaphor for choosing your own path

By studying the provided FaceMesh examples (especially the fish pond project), I learned core techniques for eye tracking and mouth detection, which I applied to this maze game.

---

# Key Functions from Examples

#### 1. **Eye Tracking**
```javascript
// Get iris position
const leftIris = face.leftIris;
const irisX = leftIris.centerX;
const irisY = leftIris.centerY;

// Map to force vector
let mappedX = map(irisX, 0, myVideo.width, -5, 5);
let mappedY = map(irisY, 0, myVideo.height, -5, 5);
```

#### 2. **Mouth Detection**
```javascript
function isMouthOpen(face) {
  const upperLip = face.keypoints[13];
  const lowerLip = face.keypoints[14];
  const distance = dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y);
  return distance > 10; // Threshold for "open"
}

// Trigger only on mouth opening
if (mouthOpen && !mouthWasOpen) {
  destroyNearbyWalls();
}
mouthWasOpen = mouthOpen;
```

#### 3. **Physics Engine**
```javascript
class Player {
  applyForce(force) {
    this.acc.add(force); 
  }
  
  update() {
    this.vel.add(this.acc); 
    this.vel.limit(this.maxSpeed); 
    this.pos.add(this.vel);    
    this.acc.mult(0);  
  }
}
```

---

### Maze Layout
**Strategic Significance:**
Players choose between:
1. **Conservative route**: Follow the designed path without destroying walls
2. **Aggressive route**: Strategically destroy walls to create shortcuts

This choice **echoes the original inspiration** — like navigating complex laws, people must decide whether to follow prescribed paths or find breakthroughs.

---

##  Technical Challenges

### Challenge 1: Jittery Eye Movement

### Challenge 2: Wall Destruction Spam

### Challenge 3: Collision Detection Bugs
```javascript
// 圆形-矩形碰撞检测 Circle-Rectangle collision
let closestX = constrain(this.pos.x, cell.x, cell.x + cellSize);
let closestY = constrain(this.pos.y, cell.y, cell.y + cellSize);

if (dist(this.pos.x, this.pos.y, closestX, closestY) < this.radius) {
  // 推开玩家 + 重叠校正 Push player + overlap correction
  let pushDir = createVector(this.pos.x - closestX, this.pos.y - closestY);
  this.pos.add(pushDir.normalize().mult(overlap + 0.5));
  this.vel.mult(0.3); // 碰撞减速 Collision damping
}
```

---
