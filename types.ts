export enum GestureType {
  NONE = 'NONE',
  WATERING = 'WATERING', // Hand moving down
  SUNLIGHT = 'SUNLIGHT', // Hand hovering/open
  WEEDING = 'WEEDING'    // Hand waving side to side
}

export enum PlantStage {
  SEEDLING = 'Seedling',
  GROWING = 'Growing',
  MATURE = 'Mature',
  FLOWERING = 'Flowering'
}

export interface PlantState {
  water: number; // 0-100 (Soil Moisture - persists)
  sun: number;   // 0-100 (Daily Exposure - resets)
  health: number; // 0-100
  growth: number; // 0-100
  stage: PlantStage;
  day: number;
}

export interface PlantSpecies {
  id: string;
  name: string;
  description: string;
  // Logic
  idealWater: number; // Target value
  idealSun: number;   // Target value
  tolerance: number;  // How far off stats can be before losing health (+/-)
  // Visuals
  trunkColor: string;
  leafColor: string;
  particleScale: number; // Multiplier for size
}

export interface ParticleProp {
  position: [number, number, number];
  color: string;
  size: number;
}