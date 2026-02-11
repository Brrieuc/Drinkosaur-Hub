import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseDrinkWithGemini = async (description: string): Promise<{ name: string; volumeMl: number; abv: number; icon: string } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract drink details from this description: "${description}". Return JSON. Estimate standard values if not specified. Icon should be a single emoji.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            volumeMl: { type: Type.NUMBER, description: "Volume in milliliters" },
            abv: { type: Type.NUMBER, description: "Alcohol percentage (e.g. 5.5)" },
            icon: { type: Type.STRING, description: "A single emoji representing the drink" }
          },
          required: ['name', 'volumeMl', 'abv', 'icon']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini parsing failed", error);
    return null;
  }
};