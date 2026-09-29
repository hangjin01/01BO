import { apiFetch } from './apiService';

// Credentials and model selection belong to the AWS server.
const callGeminiAPI = async (payload: unknown, signal?: AbortSignal): Promise<string> => {
  const result = await apiFetch<{ text: string }>('/ai/generate', {
    method: 'POST', body: JSON.stringify(payload), ...(signal ? { signal } : {}),
  });
  if (!result?.text?.trim()) throw new Error('AI 응답이 비어 있습니다. 다시 시도해 주세요.');
  return result.text;
};

export const analyzeReceiptImage = async (base64Image: string, mimeType = 'image/jpeg'): Promise<any> => {
  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Image,
              }
            },
            {
              text: "OCR this Japanese/Korean receipt. Extract details extremely fast and concise. Return merchant (under 10 chars), total amount (number only), date (YYYY-MM-DD), currency (ISO 4217 code), and category (Meals, Transport, Hotel, Other). Never guess currency."
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            currency: { type: "STRING" },
            merchant: { type: "STRING" },
            amount: { type: "NUMBER" },
            date: { type: "STRING" },
            category: { type: "STRING" }
          }
        }
      }
    };

    const text = await callGeminiAPI(payload);
    return JSON.parse(text.trim());
  } catch (error) {
    throw error;
  }
};

export const generateTripFromChat = async (message: string, language: 'ja' | 'ko' = 'ko', signal?: AbortSignal): Promise<any> => {
  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `
                Extract trip details from user message. Keep text fields under 15 characters for ultra-fast response.
                User Message: "${message}"
                Language: ${language === 'ja' ? 'Japanese' : 'Korean'}
                
                Return JSON schema only:
                {
                  "title": "Trip Title (e.g., 부산 출장)",
                  "destination": "Main Destination (e.g., 부산)",
                  "startDate": "YYYY-MM-DD (guess based on today if relative, today is ${new Date().toISOString().split('T')[0]})",
                  "endDate": "YYYY-MM-DD",
                  "purpose": "Purpose (short)",
                  "itinerary": [
                    {
                      "title": "Short event title (under 12 chars)",
                      "locationName": "Short location name",
                      "address": "Brief address",
                      "scheduledTime": "HH:MM",
                      "date": "YYYY-MM-DD (must be between startDate and endDate)",
                      "coords": {
                        "latitude": 35.1595,
                        "longitude": 129.1602
                      }
                    }
                  ]
                }
              `
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            destination: { type: "STRING" },
            startDate: { type: "STRING" },
            endDate: { type: "STRING" },
            purpose: { type: "STRING" },
            itinerary: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  locationName: { type: "STRING" },
                  address: { type: "STRING" },
                  scheduledTime: { type: "STRING" },
                  date: { type: "STRING" },
                  coords: {
                    type: "OBJECT",
                    properties: {
                      latitude: { type: "NUMBER" },
                      longitude: { type: "NUMBER" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const text = await callGeminiAPI(payload, signal);
    return JSON.parse(text.trim());
  } catch (error) {
    throw error;
  }
};

export const generateTripReport = async (checkIns: any[], expenses: any[], language: 'ja' | 'ko' = 'ja', itinerary: any[] = [], customPrompt?: string): Promise<string> => {
  try {
    const langInstruction = language === 'ja'
      ? "Japanese (with Korean translation in parentheses for key points)"
      : "Korean (with Japanese translation in parentheses for key points)";

    let prompt = `
      Create an extremely brief and highly summarized professional business trip report in ${langInstruction}.
      Keep sentences very short, bullet points punchy. Maximum 200 words.
      
      Trip Data:
      Planned Itinerary: ${JSON.stringify(itinerary)}
      Actual Check-ins: ${JSON.stringify(checkIns)}
      Expenses: ${JSON.stringify(expenses)}
      
      Formatting Requirements:
      - Use Markdown.
      - Use '## ' for Section Headers.
      - Use '**' for bolding key numbers, times, and status.
      - Use '- ' for lists.
      
      Structure:
      ## 1. Summary (概要/개요)
      ## 2. Schedule Verification (日程予実/일정 확인)
      ## 3. Activity Log (活動履歴/활동 내역)
      ## 4. Expense Summary (経費精算/경비 정산)
    `;

    if (customPrompt && customPrompt.trim()) {
      prompt += `
      
      CRITICAL USER CUSTOM INSTRUCTION:
      The user requested the following specific adjustments:
      "${customPrompt}"
      Please strictly incorporate these briefly!
      `;
    }

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    const text = await callGeminiAPI(payload);
    return text;
  } catch (error) {
    throw error;
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
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `
                Modify/add itinerary items based on user request. Keep descriptions and titles under 12 characters.
                
                Current Itinerary:
                ${JSON.stringify(currentItinerary)}
                
                Trip dates: ${tripStartDate} to ${tripEndDate}
                User instruction: "${message}"
                Language: ${language === 'ja' ? 'Japanese' : 'Korean'}
                
                Return the ENTIRE updated itinerary as a JSON array. Keep text short for maximum speed:
                [
                  {
                    "id": "item-id",
                    "title": "Title (e.g. B사 방문 - under 12 chars)",
                    "locationName": "Location (short)",
                    "address": "Brief address",
                    "scheduledTime": "HH:MM",
                    "date": "YYYY-MM-DD (must be between ${tripStartDate} and ${tripEndDate})",
                    "coords": {
                      "latitude": 35.6812,
                      "longitude": 139.7671
                    }
                  }
                ]
              `
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              title: { type: "STRING" },
              locationName: { type: "STRING" },
              address: { type: "STRING" },
              scheduledTime: { type: "STRING" },
              date: { type: "STRING" },
              coords: {
                type: "OBJECT",
                properties: {
                  latitude: { type: "NUMBER" },
                  longitude: { type: "NUMBER" }
                }
              }
            }
          }
        }
      }
    };

    const text = await callGeminiAPI(payload);
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Itinerary adjustment failed:", error);
    throw error;
  }
};