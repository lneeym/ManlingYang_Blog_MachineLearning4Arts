import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PlantParticles } from './components/PlantParticles';
import { Interface } from './components/Interface';
import { detectGesture, initializeDetector } from './services/gestureService';
import { getPlantAdvice } from './services/geminiService';
import { PlantState, GestureType, PlantSpecies, PlantStage } from './types';

// --- Configuration: Plant Species Library ---
const PLANT_LIBRARY: PlantSpecies[] = [
  {
    id: 'rose',
    name: 'Red Rose',
    description: 'A classic symbol of romance. Requires plenty of sunlight to bloom.',
    idealWater: 60,
    idealSun: 80,
    tolerance: 15,
    trunkColor: '#2e8b57', // Green stem
    leafColor: '#dc143c',   // Crimson petals
    particleScale: 1.0
  },
  {
    id: 'monstera',
    name: 'Monstera',
    description: 'The Swiss Cheese Plant. Famous for its large, fenestrated leaves.',
    idealWater: 70,
    idealSun: 40, // Indirect light
    tolerance: 20,
    trunkColor: '#228B22',
    leafColor: '#32CD32', 
    particleScale: 1.1
  },
  {
    id: 'basil',
    name: 'Sweet Basil',
    description: 'A fragrant culinary herb. Loves moisture and warm sun.',
    idealWater: 85,
    idealSun: 75,
    tolerance: 10,
    trunkColor: '#6B8E23', 
    leafColor: '#7CFC00', 
    particleScale: 0.8
  },
  {
    id: 'fern',
    name: 'Boston Fern',
    description: 'An ancient plant with lush arching fronds. Thrives in shade and humidity.',
    idealWater: 90,
    idealSun: 20,
    tolerance: 25, 
    trunkColor: '#8B4513',
    leafColor: '#228B22', 
    particleScale: 1.0
  },
  {
    id: 'oak',
    name: 'Oak Sapling',
    description: 'A sturdy hardwood tree. Slow growing but extremely resilient.',
    idealWater: 40,
    idealSun: 60,
    tolerance: 30, 
    trunkColor: '#4d3319', // Dark Wood
    leafColor: '#556B2F', // Olive Green
    particleScale: 0.6 // Smaller particles for dense canopy
  },
  {
    id: 'snake-plant',
    name: 'Snake Plant',
    description: 'Sansevieria. Almost indestructible. Has tall, sword-like leaves.',
    idealWater: 20,
    idealSun: 50,
    tolerance: 40, 
    trunkColor: '#2F4F4F',
    leafColor: '#9ACD32', 
    particleScale: 1.2
  }
];

const INITIAL_STATE: PlantState = {
  water: 50,
  sun: 0, // Starts at 0 for the day
  health: 100,
  growth: 15,
  stage: PlantStage.SEEDLING,
  day: 1
};

const getStage = (growth: number): PlantStage => {
  if (growth < 30) return PlantStage.SEEDLING;
  if (growth < 70) return PlantStage.GROWING;
  if (growth < 90) return PlantStage.MATURE;
  return PlantStage.FLOWERING;
};

const App: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [plantState, setPlantState] = useState<PlantState>(INITIAL_STATE);
  const [gesture, setGesture] = useState<GestureType>(GestureType.NONE);
  const [advice, setAdvice] = useState<string>("Welcome. Care for your plant today, then Sleep to see results.");
  const [loadingGemini, setLoadingGemini] = useState(false);
  
  // Species Selection State
  const [speciesIndex, setSpeciesIndex] = useState(0);
  const currentSpecies = PLANT_LIBRARY[speciesIndex];

  // Initialize AI/CV Detector
  useEffect(() => {
    initializeDetector().catch(err => console.error("Detector Init Failed", err));
  }, []);

  // Reset state when species changes
  useEffect(() => {
    setPlantState({
      water: currentSpecies.idealWater, 
      sun: 0,
      health: 100,
      growth: 15,
      stage: PlantStage.SEEDLING,
      day: 1
    });
    setAdvice(`Day 1: You have planted a ${currentSpecies.name}.`);
  }, [currentSpecies]);

  // Gesture Detection Loop
  useEffect(() => {
    const interval = setInterval(async () => {
      if (webcamRef.current?.video?.readyState === 4) {
        const detected = await detectGesture(webcamRef.current.video);
        setGesture(detected);
      }
    }, 150); 
    return () => clearInterval(interval);
  }, []);

  // Gesture Input Handler (Fills bars immediately, doesn't affect health yet)
  useEffect(() => {
    if (gesture === GestureType.NONE) return;

    const tick = setInterval(() => {
      setPlantState(prev => {
        let { water, sun } = prev;
        
        // 1. Input Logic
        if (gesture === GestureType.WATERING) water = Math.min(100, water + 1.0);
        if (gesture === GestureType.SUNLIGHT) sun = Math.min(100, sun + 1.0);
        // Weeding is handled in Next Day calculation or as immediate tiny bonus? 
        // Let's keep Weeding simple: It doesn't show on a bar, but maybe we can add a 'care' flag later.
        // For now, Weeding just visually happens.

        return { ...prev, water, sun };
      });
    }, 100); 
    return () => clearInterval(tick);
  }, [gesture]);

  // --- Core Game Logic: Next Day Transition ---
  const handleNextDay = async () => {
    setLoadingGemini(true);
    setAdvice("Passing the night...");

    // 1. Capture "Yesterday's" Stats for Analysis
    const prevWater = plantState.water;
    const prevSun = plantState.sun;

    // 2. Calculate Consequences
    const waterDiff = Math.abs(prevWater - currentSpecies.idealWater);
    const sunDiff = Math.abs(prevSun - currentSpecies.idealSun);
    
    let healthChange = 0;
    
    // Water Check
    if (waterDiff <= currentSpecies.tolerance) {
        healthChange += 5; // Good watering
    } else {
        // Penalty scales with how bad it was
        const penalty = Math.floor((waterDiff - currentSpecies.tolerance) / 2);
        healthChange -= Math.max(5, penalty); 
    }

    // Sun Check
    if (sunDiff <= currentSpecies.tolerance) {
        healthChange += 5;
    } else {
        const penalty = Math.floor((sunDiff - currentSpecies.tolerance) / 2);
        healthChange -= Math.max(5, penalty);
    }
    
    // Weeding Bonus (simulated random need or just pure bonus)
    // If health is low, maybe weeding helped? Let's assume standard care includes weeding.
    
    let newHealth = Math.max(0, Math.min(100, plantState.health + healthChange));
    
    // 3. Calculate Growth
    let growthChange = 0;
    if (newHealth > 60) {
        growthChange = 8; // Grow if healthy
    } else {
        growthChange = -2; // Wither if unhealthy
    }
    let newGrowth = Math.max(0, Math.min(100, plantState.growth + growthChange));
    
    // 4. Update State for Next Day
    const nextDay = plantState.day + 1;
    // Water Evaporates
    const nextWater = Math.max(0, prevWater - 20); 
    // Sun Resets
    const nextSun = 0;

    const newState: PlantState = {
       water: nextWater,
       sun: nextSun,
       health: newHealth,
       growth: newGrowth,
       stage: getStage(newGrowth),
       day: nextDay
    };
    
    setPlantState(newState);

    // 5. Get AI Feedback
    const adviceText = await getPlantAdvice(
        newState, 
        currentSpecies, 
        { water: prevWater, sun: prevSun, healthChange }
    );
    setAdvice(adviceText);
    setLoadingGemini(false);
  };

  const handleAdviceRequest = async () => {
      if (loadingGemini) return;
      setLoadingGemini(true);
      const text = await getPlantAdvice(plantState, currentSpecies);
      setAdvice(text);
      setLoadingGemini(false);
  }

  const handleNextSpecies = () => {
    setSpeciesIndex((prev) => (prev + 1) % PLANT_LIBRARY.length);
  };

  const handlePrevSpecies = () => {
    setSpeciesIndex((prev) => (prev - 1 + PLANT_LIBRARY.length) % PLANT_LIBRARY.length);
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Hidden Webcam for Computer Vision */}
      <Webcam
        ref={webcamRef}
        className="absolute opacity-0 pointer-events-none"
        width={640}
        height={480}
        screenshotFormat="image/jpeg"
      />
      
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
        <pointLight position={[-10, 5, -5]} intensity={0.8} color="#ffd700" />
        
        <PlantParticles 
          key={currentSpecies.id} 
          plantState={plantState} 
          currentGesture={gesture} 
          species={currentSpecies}
        />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI/1.8} 
          minPolarAngle={Math.PI/3} 
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* UI Layer */}
      <Interface 
        state={plantState}
        gesture={gesture}
        advice={advice}
        loadingGemini={loadingGemini}
        species={currentSpecies}
        onHelp={handleAdviceRequest}
        onNextSpecies={handleNextSpecies}
        onPrevSpecies={handlePrevSpecies}
        onNextDay={handleNextDay}
      />
    </div>
  );
};

export default App;