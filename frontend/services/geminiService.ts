import { GoogleGenAI } from "@google/genai";

// Ideally this comes from process.env, but for this demo context we assume it's available or user handles it.
// In a real app, never expose keys on client side.
const API_KEY = process.env.API_KEY || '';

export const getRecipeSuggestions = async (productName: string): Promise<string> => {
  if (!API_KEY) {
    return "Please configure your Gemini API Key to get AI recipe suggestions.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I have a jar of authentic Indian ${productName}. Suggest 3 creative and short ways to eat or pair this with other foods. Keep it appetizing and concise. Format as a simple list.`,
    });

    return response.text || "No suggestions available at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Our Chef AI is currently taking a nap. Please try again later.";
  }
};