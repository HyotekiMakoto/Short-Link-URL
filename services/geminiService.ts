import { GoogleGenAI, Type } from "@google/genai";

// IMPORTANT: In a real app, this should be proxied through a backend to protect the key
// or the user should input their own key for this demo.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const suggestSlugs = async (url: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("API Key is missing for Gemini");
    return ["auto-gen-1", "link-xyz", "fast-url"]; // Fallback if no key
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 short, catchy, and unique URL slugs (5-10 chars) for this URL: ${url}. The slugs should be relevant to the content if possible.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const slugs = JSON.parse(text) as string[];
    return slugs;
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
};