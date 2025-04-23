import { NextResponse } from "next/server"
import { fetchNews } from "@/lib/fetch-news"

// This route is meant to be called by a cron job at 12 AM IST
// In Vercel, you would set up a cron job with the following schedule:
// 0 18 30 * * (18:30 UTC = 12:00 AM IST)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // In a real application, this would fetch keywords from a database
    // For this demo, we'll simulate by using a predefined list
    const keywords = [
      {
        id: "1",
        text: "artificial intelligence",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      { id: "2", text: "climate change", createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString() },
      {
        id: "3",
        text: "space exploration",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ]

    // Process each keyword
    const results = await Promise.allSettled(
      keywords.map(async (keyword) => {
        try {
          // Fetch news for this keyword
          const newsItems = await fetchNews(keyword.text)

          // In a real application, you would save these results to a database
          // For this demo, we'll just return them
          return {
            keyword,
            results: newsItems,
            count: newsItems.length,
          }
        } catch (error) {
          console.error(`Error fetching news for keyword "${keyword.text}":`, error)
          throw error
        }
      }),
    )

    // Count successful and failed updates
    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      message: `Updated ${successful} keywords, ${failed} failed`,
      timestamp: new Date().toISOString(),
      nextUpdate: "12:00 AM IST tomorrow",
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json(
      { error: "Failed to update keywords", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
