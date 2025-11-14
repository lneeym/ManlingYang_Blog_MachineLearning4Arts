## Final Project Proposal

**Project Title** 
Virtual Plant Care Companion

**One Sentence Description**
An interactive projection installation that teaches plant care through gesture-based interactions, where users water and tend to virtual plants that respond in real-time and provide care tips when struggling.

**Project Abstract**
Virtual Plant Care Companion is an interactive installation that makes learning about plant care more engaging and visual. Users interact with projected plants through hand gestures - they can water plants, remove weeds, and provide sunlight by moving their hands in front of a camera. The system uses machine learning to recognize these gestures and the plants respond accordingly: they grow when cared for properly, wilt when neglected, and show signs of common problems like overwatering or lack of light.

When a plant becomes sick or dies, the system displays helpful care tips and educational content about what went wrong and how to fix it. This creates a safe space to learn from mistakes without killing real plants. The visual feedback is immediate and intuitive - users can see leaves drooping, colors changing, or new growth appearing based on their actions.

I will use machine learning for gesture recognition to detect watering motions, weeding actions, and other care gestures. The plant growth and health will be simulated based on these inputs. To keep the scope manageable, I will focus on one or two common houseplants and 3-4 basic care interactions. The projection will be created using p5.js, with the ML model trained using Teachable Machine or ml5.js for gesture recognition.

**Inspiration**
My mom is a plant enthusiast who loves watching plant care videos online. She has a huge collection at home and is always learning about how to keep them healthy. I want to create something more interactive and visually engaging than just watching videos - a hands-on way to learn plant care that's also fun and forgiving of mistakes.

**Visual Reference:**
- Projection mapping installations (like teamLab's interactive gardens)
- Plant care apps and visual guides
- Hand gesture interaction systems
- Time-lapse videos of plant growth and decay

- <img width="430" height="391" alt="Screenshot 2025-11-14 at 5 27 32 PM" src="https://github.com/user-attachments/assets/f968ee50-6bad-49cd-8f1d-361383f53f61" />



**Challenges:**
- Setting up the projection system and camera tracking
- Creating smooth, realistic plant growth animations
- Synchronizing gesture detection with visual feedback in real-time
- Making the interaction feel natural and intuitive without instructions

**Code Sketches:**
[Will add links to early prototypes testing gesture recognition and basic plant animation]

---

**Scope Plan:**
- Week 11: Train gesture recognition model, basic p5.js plant visuals; Connect ML to visuals, implement 2-3 gestures
- Week 12: Add plant health system and care tips; Testing and refinement
