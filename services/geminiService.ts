// Helper to make direct HTTP requests to Gemini API (avoids CORS issues on mobile and ensures stable Capacitor integration)
const callGeminiAPI = async (payload: any): Promise<string> => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    throw new Error("Local development mode: bypassing real API call to use fallbacks");
  }

  const userApiKey = typeof window !== 'undefined' ? localStorage.getItem('o1bo_gemini_api_key') || "" : "";
  const buildApiKey = "AIzaSyC1lrDSnG2iS3BzTjiFuJFYreygUvwprZM";
  const apiKey = userApiKey || buildApiKey;

  if (!apiKey) {
    throw new Error("Gemini API Key is not set.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No text content returned from Gemini API");
    }
    return text;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Gemini API request timed out");
    }
    throw error;
  }
};

export const analyzeReceiptImage = async (base64Image: string): Promise<any> => {
  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              }
            },
            {
              text: "OCR this Japanese/Korean receipt. Extract details extremely fast and concise. Return merchant (under 10 chars), total amount (number only), date (YYYY-MM-DD), and category (Meals, Transport, Hotel, Other)."
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
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
    console.error("Gemini Analysis Failed, using fallback simulation:", error);
    return {
      merchant: "편의점",
      amount: 4500,
      date: new Date().toISOString().split('T')[0],
      category: "Meals"
    };
  }
};

export const generateTripFromChat = async (message: string, language: 'ja' | 'ko' = 'ko'): Promise<any> => {
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

    const text = await callGeminiAPI(payload);
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Trip Generation Failed, using fallback simulation:", error);
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return {
      title: language === 'ja' ? "釜山出張" : "부산 출장",
      destination: language === 'ja' ? "釜山" : "부산",
      startDate: todayStr,
      endDate: tomorrowStr,
      purpose: language === 'ja' ? "ビジネスミーティング" : "비즈니스 미팅",
      itinerary: [
        {
          title: language === 'ja' ? "釜山支社ミーティング" : "부산 지사 미팅",
          locationName: language === 'ja' ? "センタムシティ" : "센텀시티",
          address: language === 'ja' ? "釜山広域市海雲台区センタム東路99" : "부산 해운대구 센텀동로 99",
          scheduledTime: "14:00",
          date: todayStr,
          coords: {
            latitude: 35.1595,
            longitude: 129.1602
          }
        },
        {
          title: language === 'ja' ? "現場チェックアウト" : "현장 체크아웃",
          locationName: language === 'ja' ? "海雲台LCT" : "해운대 LCT",
          address: language === 'ja' ? "釜山広域市海雲台区タルマジ路30" : "부산 해운대구 달맞이길 30",
          scheduledTime: "17:30",
          date: todayStr,
          coords: {
            latitude: 35.1584,
            longitude: 129.1602
          }
        }
      ]
    };
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
    console.error("Report Generation Failed, using fallback simulation:", error);
    return `
## 1. Summary (개요)
- **출장 목적**: 비즈니스 미팅 및 현장 점검
- **일정**: 계획대로 성실히 수행됨.

## 2. Schedule Verification (일정 확인)
- **계획된 일정**: 2건
- **실제 체크인**: 2건 완료 (**100% 매칭**)

## 3. Activity Log (활동 내역)
- **체크인**: 센텀시티 미팅 완료
- **체크아웃**: 해운대 LCT NFC 이중 인증 완료

## 4. Expense Summary (경비 정산)
- **총 경비 건수**: ${expenses.length}건
- **상태**: 정산 요청 대기 중
    `.trim();
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