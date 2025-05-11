
/**
 * Service for managing API keys securely
 * Uses environment variables in production, and local storage in development
 */

export interface ApiKeys {
  GEMINI_API_KEY: string;
}

class ApiKeyService {
  private LOCAL_STORAGE_KEY = "resume_ai_api_keys";

  /**
   * Gets API key from environment variables in production
   * or from local storage in development
   */
  getApiKey(keyName: keyof ApiKeys): string | null {
    // Check for environment variables (production)
    if (import.meta.env[`VITE_${keyName}`]) {
      return import.meta.env[`VITE_${keyName}`] as string;
    }

    // Check local storage for development mode keys
    const storedKeys = this.getStoredApiKeys();
    return storedKeys[keyName] || null;
  }

  /**
   * Sets API key in local storage (for development only)
   */
  setApiKey(keyName: keyof ApiKeys, value: string): void {
    const storedKeys = this.getStoredApiKeys();
    storedKeys[keyName] = value;
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(storedKeys));
  }

  /**
   * Gets all stored API keys from local storage
   */
  getStoredApiKeys(): Partial<ApiKeys> {
    try {
      const keys = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return keys ? JSON.parse(keys) : {};
    } catch {
      return {};
    }
  }

  /**
   * Checks if the API key is available
   */
  hasApiKey(keyName: keyof ApiKeys): boolean {
    return !!this.getApiKey(keyName);
  }

  /**
   * Removes API key from local storage
   */
  removeApiKey(keyName: keyof ApiKeys): void {
    const storedKeys = this.getStoredApiKeys();
    delete storedKeys[keyName];
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(storedKeys));
  }
}

export const apiKeyService = new ApiKeyService();
