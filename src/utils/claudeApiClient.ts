import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:3001/api/claude';

interface ClaudeErrorResponse {
  error?: {
    message: string;
    type: string;
  };
}

export async function getClaudeAnalysis(prompt: string): Promise<string> {
  console.log('Attempting to call Claude API via proxy...');

  try {
    const response = await axios.post(API_URL, {
      model: "claude-3-opus-20240229",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    console.log('Claude API response received:', response.status);
    
    if (response.data && response.data.content && response.data.content.length > 0) {
      return response.data.content[0].text;
    } else {
      console.error('Unexpected response structure:', response.data);
      throw new Error('Unexpected response structure from Claude API');
    }
  } catch (error) {
    console.error('Detailed error:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ClaudeErrorResponse>;
      let errorMessage: string;

      if (axiosError.response?.data?.error?.message) {
        errorMessage = axiosError.response.data.error.message;
      } else if (axiosError.response?.data && typeof axiosError.response.data === 'string') {
        errorMessage = axiosError.response.data;
      } else {
        errorMessage = axiosError.message;
      }

      throw new Error(`API error: ${axiosError.response?.status} - ${errorMessage}`);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}