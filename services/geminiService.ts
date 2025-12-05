import { GoogleGenAI } from "@google/genai";
import { PlantState, PlantSpecies } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const getPlantAdvice = async (
  state: PlantState, 
  species: PlantSpecies, 
  lastDayStats?: { water: number; sun: number; healthChange: number }
): Promise<string> => {
  try {
    let context = "";
    if (lastDayStats) {
      const waterStatus = lastDayStats.water > species.idealWater + species.tolerance ? "too wet" 
        : lastDayStats.water < species.idealWater - species.tolerance ? "too dry" : "perfect";
      
      const sunStatus = lastDayStats.sun > species.idealSun + species.tolerance ? "too much sun"
        : lastDayStats.sun < species.idealSun - species.tolerance ? "too dark" : "perfect light";

      context = `
        It is now Morning of Day ${state.day}.
        Yesterday's care resulted in: Soil was ${waterStatus}, Lighting was ${sunStatus}.
        Health change overnight: ${lastDayStats.healthChange > 0 ? '+' : ''}${lastDayStats.healthChange}%.
      `;
    } else {
      context = `This is the first day (Day 1). I have just been planted.`;
    }

    const prompt = `
      You are a virtual ${species.name}.
      Your biological traits: ${species.description}
      
      Time: Day ${state.day}
      Current Status:
      - Health: ${state.health.toFixed(0)}%
      - Growth Stage: ${state.stage}
      
      Context from last night: ${context}

      Based on this, provide a short morning status update to your caretaker (max 20 words). 
      If health dropped, complain about the specific reason (water/sun). 
      If health rose, be happy. 
      Do not use emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I am processing the cosmos...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection to the ether is weak (API Error).";
  }
};
