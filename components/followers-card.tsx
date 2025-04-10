"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingUp, Users } from "lucide-react"
import { useState } from "react"

interface FollowersCardProps {
  followers: number
  trendingFollowers: number
  editable?: boolean
  onFollowersChange?: (followers: number, trending: number) => void
}

export function FollowersCard({
  followers,
  trendingFollowers,
  editable = false,
  onFollowersChange,
}: FollowersCardProps) {
  const [followerInput, setFollowerInput] = useState(followers.toString())
  const [trendingInput, setTrendingInput] = useState(trendingFollowers.toString())

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const handleSave = () => {
    const newFollowers = Number.parseInt(followerInput) || 0
    const newTrending = Number.parseInt(trendingInput) || 0

    if (onFollowersChange) {
      onFollowersChange(newFollowers, newTrending)
    }
  }

  const handleQuickAdd = (amount: number, type: "followers" | "trending") => {
    if (type === "followers") {
      const newValue = (Number.parseInt(followerInput) || 0) + amount
      setFollowerInput(newValue.toString())
      if (!editable && onFollowersChange) {
        onFollowersChange(newValue, Number.parseInt(trendingInput) || 0)
      }
    } else {
      const newValue = (Number.parseInt(trendingInput) || 0) + amount
      setTrendingInput(newValue.toString())
      if (!editable && onFollowersChange) {
        onFollowersChange(Number.parseInt(followerInput) || 0, newValue)
      }
    }
  }

  return (
    <Card className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Influencer Stats</CardTitle>
        <CardDescription>Your audience is watching</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Total Followers</span>
            </div>
            {editable ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={followerInput}
                  onChange={(e) => setFollowerInput(e.target.value)}
                  className="text-center"
                />
              </div>
            ) : (
              <div className="text-2xl font-bold">{formatNumber(followers)}</div>
            )}
            {!editable && (
              <div className="flex gap-1 mt-1">
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(100, "followers")}>
                  +100
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(1000, "followers")}>
                  +1K
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(10000, "followers")}>
                  +10K
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium">Trending</span>
            </div>
            {editable ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={trendingInput}
                  onChange={(e) => setTrendingInput(e.target.value)}
                  className="text-center"
                />
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-500">{formatNumber(trendingFollowers)}</div>
            )}
            {!editable && (
              <div className="flex gap-1 mt-1">
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(50, "trending")}>
                  +50
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(500, "trending")}>
                  +500
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(5000, "trending")}>
                  +5K
                </Button>
              </div>
            )}
          </div>
        </div>

        {editable && (
          <Button className="w-full" onClick={handleSave}>
            Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
