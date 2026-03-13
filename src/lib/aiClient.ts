import { GoogleGenerativeAI } from '@google/generative-ai';

// Centralized Google Generative AI client used by all AI-powered routes.
// Cloud mode controls whether these AI features are active for a user.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/** Default model name used across AI features. */
export const DEFAULT_AI_MODEL = 'gemini-2.0-flash';

/**
 * Returns a GenerativeModel instance for the given model name.
 * All AI routes should obtain their model through this helper so
 * that the client is initialised from a single place.
 */
export function getAIModel(modelName: string = DEFAULT_AI_MODEL) {
  return genAI.getGenerativeModel({ model: modelName });
}

export default genAI;
