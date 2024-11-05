import { analytics } from './analytics';

interface ClaudeResponse {
  completion: string;
  stop_reason: string;
  model: string;
}

export class ClaudeApiClient {
  private static instance: ClaudeApiClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CLAUDE_API_URL || '/api/claude';
  }

  static getInstance(): ClaudeApiClient {
    if (!ClaudeApiClient.instance) {
      ClaudeApiClient.instance = new ClaudeApiClient();
    }
    return ClaudeApiClient.instance;
  }

  async getAnalysis(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ClaudeResponse = await response.json();
      return data.completion;
    } catch (error) {
      analytics.track('claude_api_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        prompt: prompt.slice(0, 100) // Only log first 100 chars for privacy
      });
      throw error;
    }
  }
}

export const claudeApi = ClaudeApiClient.getInstance();

// Legacy support for old code
export const getClaudeAnalysis = (prompt: string) => claudeApi.getAnalysis(prompt);