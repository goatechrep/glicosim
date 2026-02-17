
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ParsedVoiceCommand {
  periodo?: string;
  medicamento?: string;
  valor_glicemia?: number;
  dose?: string;
  notes?: string;
}

export const parseVoiceCommand = async (text: string): Promise<ParsedVoiceCommand | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Interprete o seguinte comando de voz sobre medição de glicose e extraia os dados em JSON: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            periodo: { 
                type: Type.STRING, 
                description: "O período do dia (Café da Manhã, Almoço, Lanche, Jantar, Glicemia ao Deitar)" 
            },
            medicamento: { 
                type: Type.STRING, 
                description: "Medicamento citado (Humalog, Basal, Metformina, Nenhum)" 
            },
            valor_glicemia: { 
                type: Type.NUMBER, 
                description: "Valor numérico da glicemia encontrado no texto" 
            },
            dose: { 
                type: Type.STRING, 
                description: "A dose do medicamento (ex: 10ui, 500mg)" 
            },
            notes: { 
                type: Type.STRING, 
                description: "Observações adicionais capturadas" 
            }
          }
        }
      }
    });

    // Fix: Accessing .text property and checking for undefined values
    const jsonStr = response.text;
    if (!jsonStr) {
      return null;
    }
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Error parsing voice with Gemini:", error);
    return null;
  }
};
