import type { NewsItem } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, ThumbsUp, ThumbsDown, Meh, Shield, ShieldAlert, ShieldQuestion } from "lucide-react"
import Link from "next/link"

export default function NewsCard({ item }: { item: NewsItem }) {
  // Sentiment emoji mapping
  const sentimentEmoji = {
    positive: { icon: ThumbsUp, color: "text-green-500", label: "Positive" },
    neutral: { icon: Meh, color: "text-yellow-500", label: "Neutral" },
    negative: { icon: ThumbsDown, color: "text-red-500", label: "Negative" },
  }

  // Credibility badge mapping
  const credibilityBadge = {
    high: {
      icon: Shield,
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      label: "High Credibility",
    },
    medium: {
      icon: ShieldQuestion,
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      label: "Medium Credibility",
    },
    low: {
      icon: ShieldAlert,
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      label: "Low Credibility",
    },
  }

  const SentimentIcon = sentimentEmoji[item.sentiment].icon
  const CredibilityIcon = credibilityBadge[item.credibility].icon

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2">
              {item.source.charAt(0).toUpperCase() + item.source.slice(1)}
            </Badge>
            <CardTitle className="text-xl">{item.title}</CardTitle>
            <CardDescription className="mt-1">
              {item.date && (
                <span className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
              )}
            </CardDescription>
          </div>
          <Badge className={credibilityBadge[item.credibility].color}>
            <CredibilityIcon className="h-3 w-3 mr-1" />
            {credibilityBadge[item.credibility].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center">
          <SentimentIcon className={`h-4 w-4 mr-1 ${sentimentEmoji[item.sentiment].color}`} />
          <span className="text-sm">{sentimentEmoji[item.sentiment].label}</span>
        </div>
        <Link
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm flex items-center text-primary hover:underline"
        >
          View Source <ExternalLink className="h-3 w-3 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  )
}
