# Virtual Plant Care Companion

## ML for Art - Final Project Documentation

---

## Project Overview

Virtual Plant Care Companion is an interactive installation that teaches plant care through gesture-based interaction with AI-powered virtual plants. Inspired by my mother's enthusiasm for plant care videos, I wanted to create a hands-on learning environment where mistakes are safe and feedback is immediate. Users interact with six different plant species—**roses, snake plants, ferns, monsteras, basil, and oak saplings**—each with unique care requirements. Through hand gestures captured by a webcam, users water plants, provide sunlight, and perform care actions while the plants respond in real-time through particle effects and AI-generated feedback.

---

## Visual Reference

- Projection mapping installations (like teamLab's interactive gardens)
- Plant care apps and visual guides
- Hand gesture interaction systems
- Time-lapse videos of plant growth and decay

---

## Interaction Design

Visual meters display water and sunlight levels, showing ideal ranges unique to each species. When users complete their daily care, they press **"Sleep"** to advance time. The system calculates overnight consequences based on how well the care matched the plant's needs—perfect care increases health and growth, while neglect causes wilting and decline. The Gemini AI provides morning updates in the plant's voice, explaining what went well or poorly and offering specific advice.

### Gesture Controls

- **Right hand raised**: Waters the plant
- **Left hand raised**: Provides sunlight
- **Hands waving side-to-side**: Performs weeding

---

## Process

### Machine Learning Model

I used **MediaPipe Hands** for real-time hand tracking, accessed through TensorFlow.js. This model provides twenty-one skeletal keypoints per hand, enabling both static pose detection (handedness) and dynamic gesture recognition (movement velocity). I chose MediaPipe for its balance of accuracy and browser-based performance—it runs entirely client-side without requiring server infrastructure.

---

### Research & Design Foundation

I began by researching real plant care requirements for each species I wanted to include:

- **Roses**: Abundant sunlight and moderate water
- **Snake plants**: Nearly indestructible with low water needs
- **Ferns**: Thrive in shade and high humidity
- **Monsteras**: Prefer indirect light
- **Basil**: Love moisture and warmth
- **Oak saplings**: Resilient but slow-growing


I searched online for reference images of each plant's visual characteristics—the crimson petals of roses, the sword-like leaves of snake plants, the delicate fronds of ferns—to inform my particle system design.

---

### Early Exploration: 3D Models

Initially, I uploaded plant photos to **Tripo.ai**, an AI-powered 3D generation tool, which produced mesh models from the 2D images. This gave me structured geometry to work with, but I quickly encountered limitations. The generated models, while visually interesting, felt too static and didn't convey the organic, living quality I wanted. I needed something that could subtly animate to show health states and respond fluidly to user interaction.

<img width="575" height="532" alt="Screenshot 2025-12-05 at 6 52 34 PM" src="https://github.com/user-attachments/assets/cbc98f13-9d55-4d11-91ab-9d054f6a15ba" />
<img width="486" height="505" alt="Screenshot 2025-12-05 at 6 58 08 PM" src="https://github.com/user-attachments/assets/328b1ade-3966-4319-a8da-f8b879ab5cea" />


---

### Platform Comparison: TouchDesigner vs. Three.js

#### TouchDesigner

TouchDesigner initially seemed ideal because of its powerful particle systems and real-time visual programming environment. I could create complex, beautiful effects quickly through node-based workflows. However, I encountered several critical limitations:

- Difficult to deploy as web experiences (requires local installation or complex streaming)
- Cumbersome integration with webcam ML models and external APIs
- Limited portability for exhibition settings

#### Three.js (Final Choice)

I shifted to **Three.js**, a JavaScript 3D library accessed through React Three Fiber. This decision was driven by several key advantages:

- **Web deployment**: The entire experience runs in a browser with no installation required
- **Mature ecosystem**: JavaScript provides robust libraries for MediaPipe integration and API communication
- **Clean architecture**: React's state management separates gesture detection, plant logic, rendering, and AI communication into discrete modules
- **Performance control**: Fine-grained optimization of particle counts and animation loops

While Three.js required more manual coding than TouchDesigner's visual interface, it gave me the flexibility and control I needed for a production-ready installation.


---

### Building the Particle System

The particle system became the heart of the visual experience. Each species has defined parameters:

- **Particle count**: 200-400 depending on species
- **Trunk color**: Browns and dark greens
- **Foliage color**: Species-specific hues
- **Scale multiplier**: Visual variety

The system distributes particles in two zones: a dense cylindrical trunk and a spherical or hemispherical canopy. I used Perlin noise to create organic drift, with each particle following its own phase-offset path that never repeats. Particle colors interpolate between vibrant greens when healthy and dull browns when dying.
<img width="894" height="700" alt="Screenshot 2025-12-05 at 12 33 08 AM" src="https://github.com/user-attachments/assets/30f4f5c7-fd73-4a57-9d63-dbd4508ae3bb" />
<img width="886" height="691" alt="Screenshot 2025-12-05 at 12 33 16 AM" src="https://github.com/user-attachments/assets/81e1a73a-09e2-4302-b31a-b32051b0e57d" />


---

### Designing the Game Mechanics

The game mechanics evolved through iteration. Early versions used real-time plant degradation, with health continuously declining during interaction. This created stress and punished exploration, the opposite of my educational goals. I restructured the experience around a **day-night cycle**:

1. **During the "day"**: Users freely provide care, watching meters fill without immediate consequences
2. **Press "Sleep"**: System evaluates yesterday's care holistically
3. **Morning feedback**: Health changes based on how well care matched plant's ideal ranges

Each plant species has ideal water and sun values plus tolerance ranges. If care falls within tolerance, health increases; deviations cause proportional penalties. This delayed feedback encourages experimentation and helps users understand cause and effect without punishment for momentary mistakes.

![plant1](https://github.com/user-attachments/assets/8c4aa051-b9be-437b-b241-ecd00b91e3f9)


---

### Final Integration in Google AI Studio

The final integration happened in **Google AI Studio**, which provided a unified development environment for testing the Gemini API alongside the React application. AI Studio's preview mode let me rapidly iterate on prompts and UI components simultaneously. I added several finishing touches:

- **Time-aware UI**: Day counter and growth stage indicators
- **Weather visualization**: Aesthetic elements suggesting passage of time and changing conditions
- **Species selector**: Navigation between different plants with visual transitions

These additions created narrative momentum, transforming isolated care actions into an unfolding story of cultivation.

<img width="877" height="671" alt="Screenshot 2025-12-05 at 12 52 41 AM" src="https://github.com/user-attachments/assets/4cf21fa9-f0ac-47a8-bd4c-873c2c4f8d48" />

---

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **3D Rendering**: Three.js via React Three Fiber
- **Hand Tracking**: MediaPipe Hands (TensorFlow.js)
- **AI Integration**: Google Gemini API
- **Deployment**: Netlify

---

## Next Steps

With more time, I would pursue several expansions:

- **Deeper plant behaviors**: Introduce pests, diseases, and seasonal variations that change care requirements over time
- **Progression system**: Users unlock complex species (orchids, carnivorous plants) by successfully caring for simpler ones
- **Multiplayer collaboration**: Multiple users tend a shared garden, requiring communication and coordination
- **Physical installation enhancements**: Projection mapping onto three-dimensional forms and spatial audio feedback for immersive experience
- **Companion mobile app**: Photograph real plants and receive AI-powered care recommendations, extending learning beyond the installation

---

## Reflection

Virtual Plant Care Companion demonstrates how gesture recognition, procedural visuals, and conversational AI can create empathetic educational experiences. By making plant care accessible, forgiving, and beautiful, the project offers a bridge between digital interaction and natural processes—a way to cultivate both virtual gardens and real understanding.

---

## Demo

🔗 [Live Demo]([https://plantcareguy.netlify.app](https://693367da3ed019fb80b599e2--charming-maamoul-1cff15.netlify.app/)

---

## Installation
```bash
# Clone the repository
git clone https://github.com/lneeym/plantcareguy.git

# Navigate to project directory
cd plantcareguy

# Install dependencies
npm install

# Create environment variables
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev
```

---

## Credits

**Created by**: Lynn (Manling Yang)  
**Program**: NYU IMA - ML for Art  
**Year**: 2025

---

## License

MIT License
