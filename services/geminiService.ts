import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeReceiptImage = async (base64Image: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for camera captures
              data: base64Image,
            },
          },
          {
            text: "Analyze this Japanese receipt. Extract the merchant name, total amount (number only), date (YYYY-MM-DD), and category (Meals, Transport, Hotel, Other). Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
          },
        }
      }
    });

    if (response.text) {
      const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const generateTripReport = async (checkIns: any[], expenses: any[], language: 'ja' | 'ko' = 'ja', itinerary: any[] = []): Promise<string> => {
  try {
    const langInstruction = language === 'ja'
      ? "Japanese (with Korean translation in parentheses for key points)"
      : "Korean (with Japanese translation in parentheses for key points)";

    const prompt = `
      Create a professional business trip report in ${langInstruction}.
      
      Trip Data:
      Planned Itinerary: ${JSON.stringify(itinerary)}
      Actual Check-ins: ${JSON.stringify(checkIns)}
      Expenses: ${JSON.stringify(expenses)}
      
      Formatting Requirements:
      - Use Markdown.
      - Use '## ' for Section Headers.
      - Use '**' for bolding key numbers, times, and status (e.g., **On Time**, **¥5,000**).
      - Use '- ' for lists.
      
      Structure:
      ## 1. Summary (概要/개요)
      ## 2. Schedule Verification (日程予実/일정 확인) 
      (Compare planned times vs actual check-in times. Mark as On Time/Late).
      ## 3. Activity Log (活動履歴/활동 내역)
      ## 4. Expense Summary (経費精算/경비 정산)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Report Generation Failed:", error);
    return "Error generating report due to API limits or network issues.";
  }
};