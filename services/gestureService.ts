import { GestureType } from '../types';

// Define the shape of the global handPoseDetection object provided by the script tag
declare global {
  interface Window {
    handPoseDetection: any;
  }
}

// Singleton for the detector to avoid reloading
let detector: any = null;

export const initializeDetector = async () => {
  if (detector) return detector;
  
  // Wait for scripts to load if they haven't yet
  if (!window.handPoseDetection) {
    console.warn("HandPoseDetection script not loaded yet, waiting...");
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!window.handPoseDetection) {
      throw new Error("HandPoseDetection library failed to load.");
    }
  }

  const model = window.handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'tfjs',
    modelType: 'lite',
    maxHands: 2
  };
  
  detector = await window.handPoseDetection.createDetector(model, detectorConfig);
  return detector;
};

// History for movement tracking
let previousX = 0;

export const detectGesture = async (video: HTMLVideoElement): Promise<GestureType> => {
  if (!detector) return GestureType.NONE;

  try {
    // flipHorizontal: false is standard for raw video feeds, 
    // MediaPipe will correctly identify Right/Left hands based on anatomy.
    const hands = await detector.estimateHands(video, { flipHorizontal: false });
    
    if (hands.length === 0) {
      return GestureType.NONE;
    }

    // 1. Check for WEEDING (Waving)
    // We track the primary hand (first detected) for substantial lateral movement.
    const primaryHand = hands[0];
    const indexTip = primaryHand.keypoints[8];
    const currentX = indexTip.x;
    
    // Calculate lateral velocity
    const dx = currentX - previousX;
    previousX = currentX; // Update history

    // If moving side-to-side fast, trigger Weeding
    if (Math.abs(dx) > 12) { 
      return GestureType.WEEDING;
    }

    // 2. Check for STATIC POSES based on Handedness
    // If movement is low, we check which hand is present.
    // MediaPipe 'handedness' returns 'Right' for the user's right hand 
    // and 'Left' for the user's left hand.
    
    const hasRightHand = hands.some((h: any) => h.handedness === 'Right');
    const hasLeftHand = hands.some((h: any) => h.handedness === 'Left');

    if (hasRightHand) return GestureType.WATERING;
    if (hasLeftHand) return GestureType.SUNLIGHT;

    return GestureType.NONE;

  } catch (err) {
    console.error("Gesture detection error", err);
    return GestureType.NONE;
  }
};