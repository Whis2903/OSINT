"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Newspaper, ChevronLeft, ChevronRight, Globe, SearchCheck, Settings, Home } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // If mobile, always collapse the sidebar
  const isCollapsed = isMobile || collapsed

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "News Search",
      href: "/search",
      icon: SearchCheck,
    },
    {
      name: "News Feeds",
      href: "/newspapers",
      icon: Newspaper,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      name: "International",
      href: "/international",
      icon: Globe,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 h-screen flex flex-col border-r shadow-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex justify-between items-center px-3 h-14 border-b">
        {!isCollapsed && (
          <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            OSINT News
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto", isCollapsed && "rotate-180")}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-col gap-2 p-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isCollapsed && "justify-center p-2",
                  isActive && "bg-purple-100 dark:bg-purple-900/30",
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-purple-600" : "text-gray-500")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="border-t p-3">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start gap-3 px-3")}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium">
            OS
          </div>
          {!isCollapsed && <div className="font-medium">OSINT Analyzer</div>}
        </div>
      </div>
    </div>
  )
}
