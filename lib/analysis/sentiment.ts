import type { Sentiment, SentimentAnalysisResult } from "../types"

export async function analyzeSentiment(text: string): Promise<Sentiment> {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      throw new Error("HuggingFace API key is not configured")
    }

    // Use HuggingFace's sentiment analysis model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text.substring(0, 500) }), // Limit text length
        next: { revalidate: 86400 }, // Cache for 24 hours
      },
    )

    if (!response.ok) {
      throw new Error(`HuggingFace API responded with status: ${response.status}`)
    }

    const result = (await response.json()) as SentimentAnalysisResult[]

    // Map HuggingFace's sentiment labels to our application's sentiment types
    if (Array.isArray(result) && result.length > 0) {
      const sentiment = result[0]

      if (sentiment.label === "POSITIVE" && sentiment.score > 0.6) {
        return "positive"
      } else if (sentiment.label === "NEGATIVE" && sentiment.score > 0.6) {
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
