import type { Credibility } from "../types"

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

export async function analyzeCredibility(text: string): Promise<Credibility> {
  const maxRetries = 3
  let retryCount = 0

  while (retryCount < maxRetries) {
    try {
      checkRateLimit()

      // Ensure the API key is retrieved securely from environment variables
      const apiKey = process.env.HUGGINGFACE_API_KEY
      if (!apiKey) {
        throw new Error("HuggingFace API key is not set in environment variables.")
      }

      // Use a more accurate model for credibility analysis
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: text.substring(0, 400),
            parameters: {
              candidate_labels: ["credible", "questionable", "fake"],
              multi_label: false,
            },
            options: {
              wait_for_model: true,
              use_cache: true // Enable caching to reduce load
            }
          }),
          next: { revalidate: 86400 },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = `HuggingFace API error: ${response.status} ${response.statusText}${errorData?.error ? ` - ${errorData.error}` : ''}`
        
        // If it's a rate limit or busy error, wait and retry
        if (response.status === 429 || (response.status === 500 && errorData?.error?.includes('busy'))) {
          retryCount++
          if (retryCount < maxRetries) {
            // Exponential backoff: 2^retryCount seconds
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
            continue
          }
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Map the result to our credibility types
      if (result && result.scores && Array.isArray(result.scores)) {
        const credibleScore = result.scores[result.labels.indexOf("credible")] || 0
        const questionableScore = result.scores[result.labels.indexOf("questionable")] || 0
        const fakeScore = result.scores[result.labels.indexOf("fake")] || 0

        // Adjust thresholds based on model performance
        if (credibleScore > 0.7) {
          return "high"
        } else if (fakeScore > 0.7) {
          return "low"
        } else if (questionableScore > 0.6) {
          return "medium"
        } else {
          // If no clear classification, use the highest score
          const maxScore = Math.max(credibleScore, questionableScore, fakeScore)
          if (maxScore === credibleScore) return "high"
          if (maxScore === fakeScore) return "low"
          return "medium"
        }
      }

      // Default to medium if we can't determine credibility
      return "medium"
    } catch (error) {
      console.error("Error analyzing credibility:", error)
      // Default to medium on error
      return "medium"
    }
  }

  // Default to medium if all retries fail
  return "medium"
}