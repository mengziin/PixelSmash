import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

// Initialize Gemini client
// NOTE: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a badminton racket image to extract identity and stats.
 * @param base64Image The base64 encoded image string (without data:image/... prefix)
 * @param mimeType The mime type of the image
 */
export const analyzeRacketImage = async (base64Image: string, mimeType: string): Promise<AnalysisResponse> => {
  
  const prompt = `
    Analyze this image of a badminton racket.
    
    1. **Brand**: Identify the Brand (e.g., Yonex, Li-Ning, Victor).
    2. **Model**: Identify the Specific Model Name (e.g., Astrox 100ZZ, Nanoflare 800, Arcsaber 11 Pro). Be precise. If specific version is visible (like Pro, Tour, Game), include it.
    3. **Description**: Generate a short, engaging description (max 2 sentences) in **Chinese**. Focus on its playstyle (e.g., head-heavy, control-oriented, speedy).
    4. **Stats**: Estimate its performance stats (Attack, Speed, Defense) on a scale of 1 to 100 based on the model's real-world reputation.
                        
    Return the result strictly as JSON.

    Then, generate a new version of this image in a 'Pixel Art Comic Book' style. Use bold outlines, vibrant 8-bit colors, and a halftone dot background pattern. Make it look like a legendary item from a retro RPG.

  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand: { type: Type.STRING },
            model: { type: Type.STRING },
            description: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                attack: { type: Type.INTEGER },
                speed: { type: Type.INTEGER },
                defense: { type: Type.INTEGER },
              },
              required: ["attack", "speed", "defense"]
            }
          },
          required: ["brand", "model", "description", "stats"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};