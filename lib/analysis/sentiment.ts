import type { Sentiment, SentimentAnalysisResult } from "../types"

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 100,
  windowMs: 60000, // 1 minute
}

let requestCount = 0
let lastResetTime = Date.now()

function checkRateLimit() {
  const now = Date.now()
  if (now - lastResetTime >= RATE_LIMIT.windowMs) {
    requestCount = 0
    lastResetTime = now
  }
  
  if (requestCount >= RATE_LIMIT.requests) {
    throw new Error('HuggingFace API rate limit exceeded. Please try again later.')
  }
  
  requestCount++
}

export async function analyzeSentiment(text: string): Promise<Sentiment> {
  try {
    checkRateLimit()

    // Ensure the API key is retrieved securely from environment variables
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      throw new Error("HuggingFace API key is not set in environment variables.")
    }
    
    // Use a more accurate sentiment analysis model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: text.substring(0, 400), // Reduced from 500 to 400 characters
          options: {
            wait_for_model: true // Wait for model to be loaded if needed
          }
        }),
        next: { revalidate: 86400 }, // Cache for 24 hours
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `HuggingFace API error: ${response.status} ${response.statusText}${errorData?.error ? ` - ${errorData.error}` : ''}`
      )
    }

    const result = (await response.json()) as SentimentAnalysisResult[]

    // Map HuggingFace's sentiment labels to our application's sentiment types
    if (Array.isArray(result) && result.length > 0) {
      const sentiment = result[0]

      // The twitter-roberta-base-sentiment model returns labels as:
      // LABEL_0: negative
      // LABEL_1: neutral
      // LABEL_2: positive
      if (sentiment.label === "LABEL_2" && sentiment.score > 0.6) {
        return "positive"
      } else if (sentiment.label === "LABEL_0" && sentiment.score > 0.6) {
        return "negative"
      } else {
        return "neutral"
      }
    }

    // Default to neutral if we can't determine sentiment
    return "neutral"
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    // Default to neutral on error
    return "neutral"
  }
}