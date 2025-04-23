"use client"

import type { NewsItem } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ExternalLink, ThumbsUp, ThumbsDown, Meh, Shield, ShieldAlert, ShieldQuestion, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function NewsCard({ item }: { item: NewsItem }) {
  // Sentiment emoji mapping
  const sentimentEmoji = {
    positive: { icon: ThumbsUp, color: "text-green-500", label: "Positive", bg: "bg-green-50 dark:bg-green-950/50" },
    neutral: { icon: Meh, color: "text-yellow-500", label: "Neutral", bg: "bg-yellow-50 dark:bg-yellow-950/50" },
    negative: { icon: ThumbsDown, color: "text-red-500", label: "Negative", bg: "bg-red-50 dark:bg-red-950/50" },
  }

  // Credibility badge mapping
  const credibilityBadge = {
    high: {
      icon: Shield,
      color: "bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-300",
      label: "High Credibility",
    },
    medium: {
      icon: ShieldQuestion,
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-300",
      label: "Medium Credibility",
    },
    low: {
      icon: ShieldAlert,
      color: "bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-300",
      label: "Low Credibility",
    },
  }

  // Source badge mapping
  const sourceBadge = {
    google: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300",
      label: "Google",
    },
    reddit: {
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/70 dark:text-orange-300",
      label: "Reddit",
    },
    youtube: {
      color: "bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-300",
      label: "YouTube",
    },
  }

  const SentimentIcon = sentimentEmoji[item.sentiment].icon
  const CredibilityIcon = credibilityBadge[item.credibility].icon

  // Format date if available
  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-2">
              <Badge className={sourceBadge[item.source].color}>{sourceBadge[item.source].label}</Badge>
              {formattedDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formattedDate}
                </div>
              )}
            </div>
            <Badge className={credibilityBadge[item.credibility].color}>
              <CredibilityIcon className="h-3 w-3 mr-1" />
              {credibilityBadge[item.credibility].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {item.thumbnail && (
              <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold line-clamp-2 mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className={`flex items-center px-3 py-1 rounded-full ${sentimentEmoji[item.sentiment].bg}`}>
            <SentimentIcon className={`h-4 w-4 mr-1 ${sentimentEmoji[item.sentiment].color}`} />
            <span className={`text-xs font-medium ${sentimentEmoji[item.sentiment].color}`}>
              {sentimentEmoji[item.sentiment].label}
            </span>
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
    </motion.div>
  )
}
