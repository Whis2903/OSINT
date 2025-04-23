"use server"

import { fetchNews } from "./fetch-news"
import type { NewsItem } from "./types"
import { ApiError } from "./api-client"

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

    if (newsItems.length === 0) {
      return new Response("No results found for the given query and filters.", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

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

    if (error instanceof ApiError) {
      return new Response(`API Error: ${error.message}`, {
        status: error.status,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    return new Response("Failed to export data to CSV. Please try again later.", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}
