// API client with better error handling, retries, and caching
import { cache } from "react";

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  cacheTime?: number;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retries = 3, retryDelay = 500, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new ApiError(`API request failed with status ${response.status}`, response.status);
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Last attempt failed, throw the error
      if (attempt === retries) {
        throw lastError;
      }

      // Wait before retrying (with exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never happen due to the throw in the loop
  throw new Error("Unexpected error in fetch retry logic");
}

export const apiClient = {
  get: cache(async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    const response = await fetchWithRetry(url, {
      ...options,
      method: "GET",
      next: { revalidate: options.cacheTime || 3600 },
    });
    return response.json();
  }),

  post: cache(async <T>(url: string, data: any, options: FetchOptions = {}): Promise<T> => {
    const response = await fetchWithRetry(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      next: { revalidate: options.cacheTime || 3600 },
    });
    return response.json();
  }),

  getRedditData: async (endpoint: string) => {
    const url = `https://www.reddit.com/${endpoint}`;
    const response = await fetchWithRetry(url, {
      headers: {
        "User-Agent": "OSINT News Analyzer/1.0",
      },
    });
    return response.json();
  },

  searchYouTube: async (query: string) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YouTube API key is not configured");

    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${query}&part=snippet&maxResults=10&type=video`;
    const response = await fetchWithRetry(url);
    return response.json();
  },

  searchGoogle: async (query: string) => {
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      throw new Error("Google API key or Search Engine ID is not configured");
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}`;
    const response = await fetchWithRetry(url);
    return response.json();
  },

  analyzeText: async (text: string) => {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) throw new Error("HuggingFace API key is not configured");

    const url = `https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english`;
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text.substring(0, 500) }),
    });
    return response.json();
  },
};