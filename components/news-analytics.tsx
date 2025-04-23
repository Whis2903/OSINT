"use client"

import { useState, useEffect } from "react"
import { KeywordService } from "@/lib/services/keyword-service"
import type { NewsItem, KeywordResults } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, BarChart3, PieChartIcon, LineChartIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Colors for sentiment
const SENTIMENT_COLORS = {
  positive: "#10b981", // green
  neutral: "#f59e0b", // amber
  negative: "#ef4444", // red
}

// Colors for credibility
const CREDIBILITY_COLORS = {
  high: "#3b82f6", // blue
  medium: "#8b5cf6", // violet
  low: "#f43f5e", // pink
}

// Colors for pie charts
const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#10b981", "#f59e0b", "#f43f5e"]

export default function NewsAnalytics() {
  const [keywordResults, setKeywordResults] = useState<KeywordResults[]>([])
  const [selectedKeyword, setSelectedKeyword] = useState<string>("all")
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isClient, setIsClient] = useState(false)
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar")

  useEffect(() => {
    setIsClient(true)
    // Load keyword results from storage
    const results = KeywordService.getKeywordResults()
    setKeywordResults(results)

    // Set news items based on selected keyword
    if (selectedKeyword === "all") {
      setNewsItems(KeywordService.getAllNewsItems())
    } else {
      const keywordResult = results.find((r) => r.keyword.id === selectedKeyword)
      setNewsItems(keywordResult?.results || [])
    }
  }, [selectedKeyword])

  // Handle server-side rendering
  if (!isClient) {
    return (
      <Card className="w-full h-[400px] animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="w-full h-[300px] bg-gray-200 dark:bg-gray-800 rounded" />
        </CardContent>
      </Card>
    )
  }

  // If no data, show a message
  if (newsItems.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>Add keywords and fetch news to see analytics.</AlertDescription>
      </Alert>
    )
  }

  // Prepare data for sentiment distribution
  const sentimentData = [
    { name: "Positive", value: newsItems.filter((item) => item.sentiment === "positive").length },
    { name: "Neutral", value: newsItems.filter((item) => item.sentiment === "neutral").length },
    { name: "Negative", value: newsItems.filter((item) => item.sentiment === "negative").length },
  ]

  // Prepare data for credibility distribution
  const credibilityData = [
    { name: "High", value: newsItems.filter((item) => item.credibility === "high").length },
    { name: "Medium", value: newsItems.filter((item) => item.credibility === "medium").length },
    { name: "Low", value: newsItems.filter((item) => item.credibility === "low").length },
  ]

  // Prepare data for combined bar chart
  const combinedData = [
    {
      name: "Sentiment",
      Positive: sentimentData[0].value,
      Neutral: sentimentData[1].value,
      Negative: sentimentData[2].value,
    },
    {
      name: "Credibility",
      High: credibilityData[0].value,
      Medium: credibilityData[1].value,
      Low: credibilityData[2].value,
    },
  ]

  // Prepare data for time series if dates are available
  const timeSeriesData = (() => {
    // Filter items with dates and sort them
    const itemsWithDates = newsItems
      .filter((item) => item.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

    if (itemsWithDates.length === 0) return []

    // Group by date
    const groupedByDate = itemsWithDates.reduce(
      (acc, item) => {
        const date = new Date(item.date!).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = {
            date,
            positive: 0,
            neutral: 0,
            negative: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0,
          }
        }

        // Increment sentiment counters
        acc[date][item.sentiment] += 1
        // Increment credibility counters
        acc[date][item.credibility] += 1
        // Increment total
        acc[date].total += 1

        return acc
      },
      {} as Record<string, any>,
    )

    // Convert to array and calculate percentages
    return Object.values(groupedByDate).map((day) => ({
      date: day.date,
      positive: (day.positive / day.total) * 100,
      neutral: (day.neutral / day.total) * 100,
      negative: (day.negative / day.total) * 100,
      high: (day.high / day.total) * 100,
      medium: (day.medium / day.total) * 100,
      low: (day.low / day.total) * 100,
    }))
  })()

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Positive" stackId="sentiment" fill={SENTIMENT_COLORS.positive} />
        <Bar dataKey="Neutral" stackId="sentiment" fill={SENTIMENT_COLORS.neutral} />
        <Bar dataKey="Negative" stackId="sentiment" fill={SENTIMENT_COLORS.negative} />
        <Bar dataKey="High" stackId="credibility" fill={CREDIBILITY_COLORS.high} />
        <Bar dataKey="Medium" stackId="credibility" fill={CREDIBILITY_COLORS.medium} />
        <Bar dataKey="Low" stackId="credibility" fill={CREDIBILITY_COLORS.low} />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieCharts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-center text-sm font-medium mb-2">Sentiment Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} items`, "Count"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-center text-sm font-medium mb-2">Credibility Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={credibilityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {credibilityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} items`, "Count"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderLineChart = () => {
    if (timeSeriesData.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No time data available</AlertTitle>
          <AlertDescription>Time-based trends require news items with dates.</AlertDescription>
        </Alert>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: "Percentage (%)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.positive} name="Positive" />
          <Line type="monotone" dataKey="neutral" stroke={SENTIMENT_COLORS.neutral} name="Neutral" />
          <Line type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.negative} name="Negative" />
          <Line type="monotone" dataKey="high" stroke={CREDIBILITY_COLORS.high} name="High Credibility" />
          <Line type="monotone" dataKey="medium" stroke={CREDIBILITY_COLORS.medium} name="Medium Credibility" />
          <Line type="monotone" dataKey="low" stroke={CREDIBILITY_COLORS.low} name="Low Credibility" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>News Analytics</CardTitle>
            <CardDescription>Visualize sentiment and credibility trends</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select keyword" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Keywords</SelectItem>
                {keywordResults.map((result) => (
                  <SelectItem key={result.keyword.id} value={result.keyword.id}>
                    {result.keyword.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Badge
                variant={chartType === "bar" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Bar
              </Badge>
              <Badge
                variant={chartType === "pie" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setChartType("pie")}
              >
                <PieChartIcon className="h-3 w-3 mr-1" />
                Pie
              </Badge>
              <Badge
                variant={chartType === "line" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setChartType("line")}
              >
                <LineChartIcon className="h-3 w-3 mr-1" />
                Trend
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          {chartType === "bar" && renderBarChart()}
          {chartType === "pie" && renderPieCharts()}
          {chartType === "line" && renderLineChart()}
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SENTIMENT_COLORS.positive }} />
            <span className="text-xs">Positive</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SENTIMENT_COLORS.neutral }} />
            <span className="text-xs">Neutral</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SENTIMENT_COLORS.negative }} />
            <span className="text-xs">Negative</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CREDIBILITY_COLORS.high }} />
            <span className="text-xs">High Cred.</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CREDIBILITY_COLORS.medium }} />
            <span className="text-xs">Medium Cred.</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CREDIBILITY_COLORS.low }} />
            <span className="text-xs">Low Cred.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
