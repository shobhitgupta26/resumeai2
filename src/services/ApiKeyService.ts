
/**
 * Service for managing API keys securely using environment variables
 */

export interface ApiKeys {
  GEMINI_API_KEY: string;
}

class ApiKeyService {
  /**
   * Gets API key from environment variables
   */
  getApiKey(keyName: keyof ApiKeys): string | null {
    // Check for environment variables 
    if (import.meta.env[`VITE_${keyName}`]) {
      return import.meta.env[`VITE_${keyName}`] as string;
    }
    
    return null;
  }

  /**
   * Checks if the API key is available in environment variables
   */
  hasApiKey(keyName: keyof ApiKeys): boolean {
    return !!this.getApiKey(keyName);
  }
}

export const apiKeyService = new ApiKeyService();
