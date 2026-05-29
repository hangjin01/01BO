import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" 
});

export const analyzeReceiptImage = async (base64Image: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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

export const generateTripFromChat = async (message: string, language: 'ja' | 'ko' = 'ko'): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `
        Extract trip details from the following user message and create a structured itinerary.
        User Message: "${message}"
        
        Language: ${language === 'ja' ? 'Japanese' : 'Korean'}
        
        Return a JSON object with the following structure:
        {
          "title": "Trip Title (e.g., 부산 출장)",
          "destination": "Main Destination (e.g., 부산)",
          "startDate": "YYYY-MM-DD (guess based on today if relative, today is ${new Date().toISOString().split('T')[0]})",
          "endDate": "YYYY-MM-DD",
          "purpose": "Purpose of the trip",
          "itinerary": [
            {
              "title": "Event Title (e.g., 해운대 미팅)",
              "locationName": "Location Name (e.g., 해운대)",
              "address": "Approximate Address or City",
              "scheduledTime": "HH:MM",
              "date": "YYYY-MM-DD (occurring date of this event, must be between startDate and endDate)",
              "coords": {
                "latitude": 35.1595,
                "longitude": 129.1602
              }
            }
          ]
        }
        
        For coordinates, provide approximate realistic coordinates for the location if possible, otherwise use 0.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            destination: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            purpose: { type: Type.STRING },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  locationName: { type: Type.STRING },
                  address: { type: Type.STRING },
                  scheduledTime: { type: Type.STRING },
                  date: { type: Type.STRING },
                  coords: {
                    type: Type.OBJECT,
                    properties: {
                      latitude: { type: Type.NUMBER },
                      longitude: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Trip Generation Failed:", error);
    throw error;
  }
};

export const generateTripReport = async (checkIns: any[], expenses: any[], language: 'ja' | 'ko' = 'ja', itinerary: any[] = [], customPrompt?: string): Promise<string> => {
  try {
    const langInstruction = language === 'ja'
      ? "Japanese (with Korean translation in parentheses for key points)"
      : "Korean (with Japanese translation in parentheses for key points)";

    let prompt = `
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

    if (customPrompt && customPrompt.trim()) {
      prompt += `
      
      CRITICAL USER CUSTOM INSTRUCTION:
      The user requested the following specific adjustments/details/additions to the report:
      "${customPrompt}"
      Please strictly incorporate these instructions/changes when generating/updating the report!
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Report Generation Failed:", error);
    return "Error generating report due to API limits or network issues.";
  }
};

export const adjustTripItinerary = async (
  currentItinerary: any[],
  message: string,
  tripStartDate: string,
  tripEndDate: string,
  language: 'ja' | 'ko' = 'ko'
): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `
        You are an assistant that modifies or adds business trip itinerary items based on user requests.
        
        Current Itinerary:
        ${JSON.stringify(currentItinerary)}
        
        Trip dates: ${tripStartDate} to ${tripEndDate}
        User instruction: "${message}"
        Language for names/titles: ${language === 'ja' ? 'Japanese' : 'Korean'}
        
        Return the ENTIRE updated itinerary as a JSON array. You can:
        1. Add new items with unique ID (format: e.g., "item-1716..."). Ensure that any newly added item has a valid, unique id string.
        2. Modify existing items (keep their existing IDs).
        3. Delete items if explicitly requested.
        4. Sort the itinerary chronologically by date and scheduledTime.
        
        Return ONLY a JSON array with the following schema:
        [
          {
            "id": "item-id",
            "title": "Title (e.g. B사 방문)",
            "locationName": "Location name",
            "address": "Approximate address or empty if unknown",
            "scheduledTime": "HH:MM",
            "date": "YYYY-MM-DD (must be between ${tripStartDate} and ${tripEndDate})",
            "coords": {
              "latitude": 35.6812,
              "longitude": 139.7671
            }
          }
        ]
        
        Provide realistic coordinates (for Korea or Japan, mostly Tokyo/Seoul region if not specified).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              locationName: { type: Type.STRING },
              address: { type: Type.STRING },
              scheduledTime: { type: Type.STRING },
              date: { type: Type.STRING },
              coords: {
                type: Type.OBJECT,
                properties: {
                  latitude: { type: Type.NUMBER },
                  longitude: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    }
    throw new Error("No itinerary returned");
  } catch (error) {
    console.error("Itinerary adjustment failed:", error);
    throw error;
  }
};