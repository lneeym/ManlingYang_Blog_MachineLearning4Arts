import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlantState, GestureType, PlantSpecies } from '../types';

interface PlantParticlesProps {
  plantState: PlantState;
  currentGesture: GestureType;
  species: PlantSpecies;
}

export const PlantParticles: React.FC<PlantParticlesProps> = ({ plantState, currentGesture, species }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const dustRef = useRef<THREE.Points>(null!);
  
  // --- Procedural Generation Logic for Plant ---
  const { positions, colors, types, initialPos, phases, growthIndices, particleCount } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const type: number[] = []; // 0: Wood/Stem, 1: Foliage/Flower
    const ph: number[] = [];
    const gr: number[] = []; // Growth Index (0.0 - 1.0) - when does this particle appear?

    // Shared Helper
    const addParticle = (x: number, y: number, z: number, t: number, growthIdx: number) => {
      pos.push(x * species.particleScale, y * species.particleScale, z * species.particleScale);
      col.push(1, 1, 1); // Placeholder, updated in loop
      type.push(t);
      ph.push(Math.random() * Math.PI * 2); 
      gr.push(growthIdx);
    };

    // --- ALGORITHMS ---

    // 1. ROSE
    const generateRose = () => {
       const stemCount = 5;
       for (let i = 0; i < stemCount; i++) {
         const angle = (i / stemCount) * Math.PI * 2;
         const r = 0.5 + Math.random() * 0.5;
         let sx = Math.cos(angle) * r;
         let sz = Math.sin(angle) * r;
         let sy = -4;
         const height = 6 + Math.random() * 2;
         
         // Stem
         for (let h = 0; h < height; h += 0.02) {
            sx += Math.sin(h * 0.5 + angle) * 0.01; 
            sz += Math.cos(h * 0.5 + angle) * 0.01;
            sy += 0.02;
            
            // Growth: Based on height up the stem
            const stemProgress = h / height;
            
            // Core Stem
            addParticle(sx, sy, sz, 0, stemProgress * 0.7); // Stem grows 0.0 -> 0.7

            // Thorns
            if (Math.random() > 0.95) {
                const thornDir = Math.random() * Math.PI * 2;
                addParticle(sx + Math.cos(thornDir)*0.15, sy, sz + Math.sin(thornDir)*0.15, 0, stemProgress * 0.7);
            }

            // Leaves (Oval clusters along stem)
            if (h > 1 && Math.random() > 0.98) {
               const lx = sx;
               const lz = sz;
               const ly = sy;
               const lDir = Math.random() * Math.PI * 2;
               for(let l=0; l<1.5; l+=0.05) {
                   const spread = Math.sin(l * Math.PI) * 0.3; 
                   for(let w=0; w<5; w++) {
                       addParticle(
                           lx + Math.cos(lDir)*l + (Math.random()-0.5)*spread,
                           ly + l*0.5 + (Math.random()-0.5)*0.1,
                           lz + Math.sin(lDir)*l + (Math.random()-0.5)*spread,
                           0, // Green part
                           stemProgress * 0.7 + 0.05 // Leaves appear slightly after stem segment
                       );
                   }
               }
            }
         }

         // Flower Head (Rose) - appears last (0.7 -> 1.0)
         const flowerY = sy;
         const flowerR = 0.8;
         for(let t=0; t<25; t+=0.05) {
             const rad = (t/25) * flowerR;
             const ang = t * 2.5; 
             const x = sx + Math.cos(ang) * rad;
             const z = sz + Math.sin(ang) * rad;
             const y = flowerY + (t/25) * 1.5 - (rad*rad); 
             
             // Dense petals
             for(let d=0; d<4; d++) {
                 // Flower blooms from center out? Or outside in?
                 // Let's say it buds then opens. 
                 const petalGrowth = 0.7 + (t/25) * 0.3;
                 addParticle(x + (Math.random()-0.5)*0.1, y + (Math.random()-0.5)*0.1, z + (Math.random()-0.5)*0.1, 1, petalGrowth);
             }
         }
       }
    };

    // 2. MONSTERA
    const generateMonstera = () => {
        const leafCount = 7;
        for(let i=0; i<leafCount; i++) {
            // Sequential growth of leaves
            const leafOrderStart = i / leafCount; 
            const leafOrderEnd = (i + 1) / leafCount;

            // Stalk
            const angle = (i/leafCount) * Math.PI * 2 + (Math.random()*0.5);
            const dist = 0.5;
            let sx = Math.cos(angle) * dist;
            let sz = Math.sin(angle) * dist;
            let sy = -4;
            const stemLen = 3 + i * 0.8;
            
            // Draw Stem
            for(let h=0; h<stemLen; h+=0.02) {
                sx += Math.cos(angle) * 0.01;
                sz += Math.sin(angle) * 0.01;
                sy += 0.02;
                // Stem grows first half of leaf's duration
                const stemGrowth = leafOrderStart + (h/stemLen) * (0.5/leafCount);
                addParticle(sx, sy, sz, 0, stemGrowth);
            }

            // Draw Leaf
            const tilt = 0.5 + Math.random() * 0.5;
            const leafSize = 1.5 + Math.random() * 0.5;
            
            for(let lx=-1; lx<=1; lx+=0.03) {
                for(let ly=-0.2; ly<=1.5; ly+=0.03) {
                    const xx = lx * 1.5;
                    const yy = ly - Math.abs(lx)*0.5; 
                    
                    if (xx*xx + yy*yy < 1) {
                         const noise = Math.sin(lx * 10) * Math.cos(ly * 10);
                         const isHole = (ly > 0.3 && Math.abs(lx) > 0.3 && noise > 0.6);
                         
                         if (!isHole) {
                             const finalX = sx + lx * leafSize;
                             const finalY = sy + Math.sin(tilt) * ly * leafSize;
                             const finalZ = sz + Math.cos(tilt) * ly * leafSize;
                             
                             // Leaf grows/unfurls second half
                             // Simple: Leaf appears after stem
                             const leafGrowth = leafOrderStart + 0.5/leafCount + Math.random() * 0.1;
                             addParticle(finalX, finalY, finalZ, 1, leafGrowth);
                         }
                    }
                }
            }
        }
    };

    // 3. BASIL
    const generateBasil = () => {
        // Main Stem
        for(let h=0; h<6; h+=0.02) {
            const progress = h/6;
            addParticle(0, -4+h, 0, 0, progress);
            
            // Branches
            if (h > 1 && Math.floor(h * 10) % 15 === 0) {
                const nodeAngle = h * 2; 
                for(let side=0; side<2; side++) {
                    const ang = nodeAngle + side * Math.PI;
                    // Branch/Leaf
                    let bx = Math.cos(ang) * 0.1;
                    let bz = Math.sin(ang) * 0.1;
                    let by = -4 + h;
                    
                    const leafSize = 0.6;
                    for(let l=0; l<leafSize; l+=0.02) {
                        const width = Math.sin(l/leafSize * Math.PI) * 0.4;
                        const cup = l*l*0.5; 
                        const cx = Math.cos(ang) * l;
                        const cz = Math.sin(ang) * l;
                        const cy = l * 0.5; 
                        
                        for(let w=-width; w<=width; w+=0.02) {
                            const cupD = w*w*2; 
                            // Leaves appear as stem reaches them
                            addParticle(
                                cx - Math.sin(ang)*w, 
                                by + cy - cupD, 
                                cz + Math.cos(ang)*w, 
                                1,
                                progress // Leaves attach to stem timestamp
                            );
                        }
                    }
                }
            }
        }
    };

    // 4. FERN
    const generateFern = () => {
      const frondCount = 24; 
      for (let i = 0; i < frondCount; i++) {
        const angle = (i / frondCount) * Math.PI * 2;
        const length = 4.5 + Math.random() * 1.5;
        const curveHeight = 2.0;
        
        // Fronds unfurl from center 0->1
        for (let t = 0; t <= 1; t += 0.005) { 
          const r = t * length; 
          const h = (Math.sin(t * Math.PI) * curveHeight * 0.5) + (t * 2); 
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          const y = h - 4; 

          // Fern growth is radial (i) AND longitudinal (t)
          // Actually ferns unfurl (fiddlehead). So t is dominant.
          const growthT = t * 0.8 + (Math.random()*0.2);
          addParticle(x, y, z, 0, growthT);

          const width = Math.sin(t * Math.PI) * 1.0; 
          const density = 8; 
          for (let k = 0; k < density; k++) {
             const side = (Math.random() - 0.5) * 2 * width;
             const px = x + Math.cos(angle + Math.PI/2) * side;
             const pz = z + Math.sin(angle + Math.PI/2) * side;
             addParticle(px, y, pz, 1, growthT);
          }
        }
      }
    };

    // 5. OAK
    const generateOak = () => {
        const maxDepth = 5;
        const branch = (x:number, y:number, z:number, dirX:number, dirY:number, dirZ:number, len:number, depth:number, parentGrowth: number) => {
            if (depth === 0) return;
            
            const segments = 15;
            let cx = x, cy = y, cz = z;
            
            // This segment growth range
            // Depth 5 (Trunk) = early. Depth 1 (Tips) = late.
            // Inverse map depth to time.
            // 5 -> 0.0-0.2
            // 4 -> 0.2-0.4
            // ...
            const depthStep = 1 / maxDepth; // 0.2
            const startG = (maxDepth - depth) * depthStep;
            
            for(let i=0; i<segments; i++) {
                cx += dirX * (len/segments);
                cy += dirY * (len/segments);
                cz += dirZ * (len/segments);
                
                const segProgress = i/segments;
                const currentGrowth = startG + segProgress * depthStep;

                const thickness = depth * 0.05;
                for(let t=0; t<depth*2; t++) {
                     addParticle(cx + (Math.random()-0.5)*thickness, cy, cz + (Math.random()-0.5)*thickness, 0, currentGrowth);
                }
            }

            if (depth > 1) {
                const count = 2 + Math.floor(Math.random()*2); 
                for(let b=0; b<count; b++) {
                    const spread = 0.6;
                    const newDirX = dirX + (Math.random()-0.5)*spread;
                    const newDirY = dirY + (Math.random()-0.5)*spread;
                    const newDirZ = dirZ + (Math.random()-0.5)*spread;
                    const mag = Math.sqrt(newDirX*newDirX + newDirY*newDirY + newDirZ*newDirZ);
                    branch(cx, cy, cz, newDirX/mag, newDirY/mag, newDirZ/mag, len * 0.7, depth - 1, startG + depthStep);
                }
            } else {
                // LEAVES
                const leafCloudSize = 1.5;
                for(let l=0; l<60; l++) {
                     const theta = Math.random() * Math.PI * 2;
                     const phi = Math.random() * Math.PI;
                     const rad = Math.random() * leafCloudSize;
                     // Leaves appear at end of cycle
                     addParticle(
                         cx + rad * Math.sin(phi) * Math.cos(theta),
                         cy + rad * Math.sin(phi) * Math.sin(theta),
                         cz + rad * Math.cos(phi),
                         1,
                         0.85 + Math.random()*0.15
                     );
                }
            }
        };

        branch(0, -4, 0, 0, 1, 0, 3.5, maxDepth, 0); 
    };

    // 6. SNAKE PLANT
    const generateSnakePlant = () => {
        const bladeCount = 12;
        for(let i=0; i<bladeCount; i++) {
            const angle = (i/bladeCount) * Math.PI * 2 + (Math.random()*0.5);
            const r = Math.random() * 0.5;
            const sx = Math.cos(angle) * r;
            const sz = Math.sin(angle) * r;
            const height = 3 + Math.random() * 4;
            const widthBase = 0.3;
            
            for(let h=0; h<height; h+=0.03) {
                const progress = h/height;
                // Blades grow from ground up
                const currentWidth = widthBase * (1 - progress); 
                const wave = Math.sin(h * 2) * 0.1;
                const bx = sx + Math.cos(angle) * wave;
                const bz = sz + Math.sin(angle) * wave;
                const by = -4 + h;
                
                for(let w=-currentWidth; w<=currentWidth; w+=0.02) {
                     const curve = w*w*2;
                     addParticle(
                         bx + Math.cos(angle+Math.PI/2)*w,
                         by,
                         bz + Math.sin(angle+Math.PI/2)*w + curve,
                         1,
                         progress
                     );
                }
            }
        }
    };

    // --- SELECTION ---
    switch(species.id) {
        case 'rose': generateRose(); break;
        case 'monstera': generateMonstera(); break;
        case 'basil': generateBasil(); break;
        case 'fern': generateFern(); break;
        case 'oak': generateOak(); break;
        case 'snake-plant': generateSnakePlant(); break;
        default: generateFern(); break;
    }

    return { 
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
      types: new Float32Array(type),
      initialPos: new Float32Array(pos),
      phases: new Float32Array(ph),
      growthIndices: new Float32Array(gr),
      particleCount: pos.length / 3
    };
  }, [species]);

  // --- Ambient Dust Generation ---
  const { dustPositions, dustCount } = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
        // Random volume around the plant
        pos[i*3] = (Math.random() - 0.5) * 20;     // X: -10 to 10
        pos[i*3+1] = (Math.random() - 0.5) * 15;   // Y: -7.5 to 7.5
        pos[i*3+2] = (Math.random() - 0.5) * 20;   // Z: -10 to 10
    }
    return { dustPositions: pos, dustCount: count };
  }, []);

  // --- Animation Loop ---
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const health = plantState.health / 100;
    const currentGrowthPercent = plantState.growth / 100;

    // --- Wind Simulation ---
    // A slowly changing wind vector based on Perlin-like noise (approximated by sine waves)
    const windTime = time * 0.5;
    const windStrength = (Math.sin(windTime) + Math.sin(windTime * 3) * 0.5) * 0.05; 
    const windDirX = Math.sin(time * 0.3);
    const windDirZ = Math.cos(time * 0.2);

    // --- Plant Updates ---
    if (pointsRef.current) {
        const posAttr = pointsRef.current.geometry.attributes.position;
        const colAttr = pointsRef.current.geometry.attributes.color;
        
        const p = posAttr.array as Float32Array;
        const c = colAttr.array as Float32Array;
        
        const globalScale = 0.4 + (currentGrowthPercent * 0.6);
        pointsRef.current.scale.set(globalScale, globalScale, globalScale);
        
        const baseTrunk = new THREE.Color(species.trunkColor);
        const deadTrunk = new THREE.Color('#4a3b32');
        const woodColor = baseTrunk.clone().lerp(deadTrunk, 1 - health);
        
        const leafHealthy = new THREE.Color(species.leafColor);
        const leafDead = new THREE.Color('#8B4513'); 
        const leafColor = leafHealthy.clone().lerp(leafDead, 1 - health);
        
        const waterColor = new THREE.Color('#00ffff');
        const sunColor = new THREE.Color('#ffaa00');

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const type = types[i]; 
          const phase = phases[i];
          const growthIdx = growthIndices[i];
          
          // Growth Masking
          if (growthIdx > currentGrowthPercent) {
              p[i3] = 99999;
              p[i3+1] = 99999;
              p[i3+2] = 99999;
              continue; 
          }

          const ix = initialPos[i3];
          const iy = initialPos[i3 + 1];
          const iz = initialPos[i3 + 2];
          
          let x = ix;
          let y = iy;
          let z = iz;

          // 1. Universal Breathing
          const breath = Math.sin(time + iy) * 0.015 * health;
          x += x * breath; 
          z += z * breath;

          // 2. Wind Influence
          // Higher particles are affected more.
          const heightFactor = Math.max(0, iy + 4) / 8; // 0 at bottom, ~1 at top
          // Healthy plants sway, dry plants are stiff
          const flexibility = health * 0.8 + 0.2; 
          x += windDirX * windStrength * heightFactor * flexibility;
          z += windDirZ * windStrength * heightFactor * flexibility;

          // 3. Species Specific Motion
          if (species.id === 'fern' && type === 1) {
              const wave = Math.sin(time * 1.5 + x * 0.5) * 0.1 * health;
              y += wave;
          } else if (species.id === 'oak' && type === 1) {
              x += Math.sin(time * 3 + phase) * 0.03 * health;
              y += Math.cos(time * 2 + phase) * 0.03 * health;
          } else if (species.id === 'monstera') {
              x += Math.sin(time + y) * 0.02 * health;
          }

          // 4. Interactions
          if (currentGesture === GestureType.WEEDING) {
             x += (Math.random()-0.5) * 0.2;
             z += (Math.random()-0.5) * 0.2;
          }
          
          if (currentGesture === GestureType.WATERING) {
             if (Math.random() > 0.98) y -= 0.3;
          }

          p[i3] = x;
          p[i3 + 1] = y;
          p[i3 + 2] = z;

          // Color Mixing
          const mixedColor = type === 1 ? leafColor.clone() : woodColor.clone();
          
          if (species.id === 'rose' && type === 1) {
              if (iy < 1.5) { 
                 mixedColor.setHex(0x228B22); 
                 mixedColor.lerp(deadTrunk, 1-health);
              }
          }

          const glow = 0.8 + Math.sin(time * 2 + phase) * 0.2 * health;
          mixedColor.multiplyScalar(glow);

          if (currentGesture === GestureType.WATERING && type === 1) mixedColor.lerp(waterColor, 0.3);
          if (currentGesture === GestureType.SUNLIGHT && type === 1) mixedColor.lerp(sunColor, 0.3);

          c[i3] = mixedColor.r;
          c[i3 + 1] = mixedColor.g;
          c[i3 + 2] = mixedColor.b;
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
        pointsRef.current.rotation.y = time * 0.05; // Slower rotation
    }

    // --- Dust Updates ---
    if (dustRef.current) {
         const posAttr = dustRef.current.geometry.attributes.position;
         const dPos = posAttr.array as Float32Array;
         
         for(let i=0; i<dustCount; i++) {
             const i3 = i*3;
             let dx = dPos[i3];
             let dy = dPos[i3+1];
             let dz = dPos[i3+2];

             // Gravity / Settling
             dy -= 0.01; 

             // Wind Advection (Dust flows with the wind)
             dx += windDirX * windStrength * 0.8; 
             dz += windDirZ * windStrength * 0.8;

             // Brownian Motion (Random jitter)
             dx += (Math.random() - 0.5) * 0.02;
             dy += (Math.random() - 0.5) * 0.02;
             dz += (Math.random() - 0.5) * 0.02;

             // Boundary Check & Reset (Infinite loop)
             if (dy < -8) {
                 dy = 8; // Reset to top
                 dx = (Math.random() - 0.5) * 20;
                 dz = (Math.random() - 0.5) * 20;
             }
             // Wrap X/Z
             if (dx > 15) dx = -15;
             if (dx < -15) dx = 15;
             if (dz > 15) dz = -15;
             if (dz < -15) dz = 15;

             dPos[i3] = dx;
             dPos[i3+1] = dy;
             dPos[i3+2] = dz;
         }
         posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
        {/* Main Plant */}
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={particleCount}
              array={colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.06}
            vertexColors
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
            depthWrite={false}
          />
        </points>

        {/* Ambient Dust Motes */}
        <points ref={dustRef}>
            <bufferGeometry>
                <bufferAttribute 
                    attach="attributes-position"
                    count={dustCount}
                    array={dustPositions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial 
                size={0.08}
                color="#ffffff"
                transparent
                opacity={0.3}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    </group>
  );
};
