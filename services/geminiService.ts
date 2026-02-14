
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * High-reasoning analysis using Gemini 3 Pro.
 * Mandatory 32768 thinking budget for master technician depth.
 */
export const analyzeDiagnosticData = async (log: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `As an elite automotive engineer, perform a deep-reasoning forensic analysis of these UDS logs and DTCs. 
      Analyze voltage fluctuations, service response timing, and error code interdependencies. 
      Provide a logic-driven diagnostic path.
      
      DATA SET:
      ${log}`,
      config: {
        systemInstruction: "You are the GY OBD-II PRO AI Reasoning Engine. You have access to ISO-14229 full specifications. Your task is to provide 100% accurate diagnostic solutions using deep reasoning.",
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Pro Error:", error);
    return "Expert reasoning system encountered an error. Check project billing or API key status.";
  }
};

/**
 * Fast assistant using Gemini 2.5 Flash Lite for sub-second latency.
 */
export const fastAssistant = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: query,
      config: {
        systemInstruction: "You are the fast-response support bot for a professional OBD-II tool. Be brief, professional, and accurate.",
      },
    });
    return response.text;
  } catch (error) {
    return "Fast link failed.";
  }
};
