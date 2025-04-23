import type { Credibility } from "../types"

export async function analyzeCredibility(text: string): Promise<Credibility> {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      throw new Error("HuggingFace API key is not configured")
    }

    // Use HuggingFace's fake news detection model
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-mnli", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text.substring(0, 500), // Limit text length
        parameters: {
          candidate_labels: ["credible", "questionable", "fake"],
        },
      }),
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error(`HuggingFace API responded with status: ${response.status}`)
    }

    const result = await response.json()

    // Map the result to our credibility types
    if (result && result.scores && Array.isArray(result.scores)) {
      const credibleScore = result.scores[result.labels.indexOf("credible")] || 0
      const questionableScore = result.scores[result.labels.indexOf("questionable")] || 0
      const fakeScore = result.scores[result.labels.indexOf("fake")] || 0

      if (credibleScore > 0.6) {
        return "high"
      } else if (fakeScore > 0.6) {
        return "low"
      } else {
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
