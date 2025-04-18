"use server"

import { fetchNews } from "./fetch-news"
import type { NewsItem } from "./types"

export async function exportToCsv(formData: FormData) {
  const query = formData.get("query")?.toString() || ""
  const source = formData.get("source")?.toString() || "all"
  const sentiment = formData.get("sentiment")?.toString() || "all"
  const credibility = formData.get("credibility")?.toString() || "all"

  if (!query) {
    return { error: "No query provided" }
  }

  try {
    const newsItems = await fetchNews(query, source, sentiment, credibility)

    // Convert news items to CSV format
    const headers = ["Title", "Description", "Source", "Date", "Sentiment", "Credibility", "URL"]
    const rows = newsItems.map((item: NewsItem) => [
      item.title.replace(/"/g, '""'), // Escape quotes
      item.description.replace(/"/g, '""'),
      item.source,
      item.date || "",
      item.sentiment,
      item.credibility,
      item.url,
    ])

    // Create CSV content
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Return the CSV content
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="osint-news-${query}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting to CSV:", error)
    return { error: "Failed to export data to CSV" }
  }
}
