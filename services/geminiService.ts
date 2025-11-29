import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GroundingMetadata } from "../types";

// Initialize the client
// CRITICAL: Using process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Gemini 2.5 Flash for speed and general competence
const MODEL_NAME = 'gemini-2.5-flash';

export class GeminiService {
  private chatSession: Chat | null = null;

  constructor() {
    this.startNewSession();
  }

  public startNewSession() {
    this.chatSession = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `أنت مساعد ذكي متقدم ومفيد يتحدث اللغة العربية بطلاقة. 
        مهمتك هي مساعدة المستخدم في الإجابة على الأسئلة، تلخيص النصوص، وكتابة المحتوى الإبداعي والبرمجي.
        
        - كن دقيقاً ومختصراً عندما يطلب منك ذلك.
        - استخدم تنسيق Markdown بشكل جيد (عناوين، قوائم، أكواد برمجية).
        - حافظ على نبرة مهذبة واحترافية.`,
        // Grounding Config: Use Google Search
        tools: [{ googleSearch: {} }],
      },
    });
  }

  /**
   * Sends a message to the model and streams the response.
   * @param message The user's input message
   * @param onChunk Callback for each text chunk received
   * @param onComplete Callback when stream finishes, providing full text and grounding metadata
   */
  public async sendMessageStream(
    message: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string, grounding?: GroundingMetadata) => void,
    onError: (error: Error) => void
  ) {
    if (!this.chatSession) {
      this.startNewSession();
    }

    try {
      const resultStream = await this.chatSession!.sendMessageStream({ message });
      
      let accumulatedText = '';
      let finalGroundingMetadata: GroundingMetadata | undefined;

      for await (const chunk of resultStream) {
        const responseChunk = chunk as GenerateContentResponse;
        
        // Extract text
        const text = responseChunk.text;
        if (text) {
          accumulatedText += text;
          onChunk(accumulatedText);
        }

        // Check for grounding metadata in the chunk (usually comes at the end)
        if (responseChunk.candidates?.[0]?.groundingMetadata) {
          finalGroundingMetadata = responseChunk.candidates[0].groundingMetadata as unknown as GroundingMetadata;
        }
      }

      onComplete(accumulatedText, finalGroundingMetadata);

    } catch (error) {
      console.error("Gemini API Error:", error);
      onError(error instanceof Error ? error : new Error("Unknown error occurred"));
    }
  }
}

// Singleton instance for simplicity in this app structure
export const geminiService = new GeminiService();