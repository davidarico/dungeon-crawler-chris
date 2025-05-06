"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, TrendingUp, Users } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
      setIsDialogOpen(false) // Close dialog after saving
    }
  }

  // Reset inputs when dialog opens
  const openDialog = () => {
    setFollowerInput(followers.toString())
    setTrendingInput(trendingFollowers.toString())
    setIsDialogOpen(true)
  }

  return (
    <>
      <Card className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Influencer Stats</CardTitle>
              <CardDescription>Your audience is watching</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={openDialog}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Total Followers</span>
              </div>
              <div className="text-2xl font-bold">{formatNumber(followers)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">Trending</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{formatNumber(trendingFollowers)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Followers Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Influencer Stats</DialogTitle>
            <DialogDescription>Update your follower count and trending numbers</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">Total Followers</span>
                </div>
                <Input
                  type="number"
                  value={followerInput}
                  onChange={(e) => setFollowerInput(e.target.value)}
                  className="text-center"
                />
                <div className="flex gap-1 mt-1 justify-center">
                  <Button variant="outline" size="sm" onClick={() => setFollowerInput(((Number.parseInt(followerInput) || 0) + 100).toString())}>
                    +100
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setFollowerInput(((Number.parseInt(followerInput) || 0) + 1000).toString())}>
                    +1K
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setFollowerInput(((Number.parseInt(followerInput) || 0) + 10000).toString())}>
                    +10K
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Trending</span>
                </div>
                <Input
                  type="number"
                  value={trendingInput}
                  onChange={(e) => setTrendingInput(e.target.value)}
                  className="text-center"
                />
                <div className="flex gap-1 mt-1 justify-center">
                  <Button variant="outline" size="sm" onClick={() => setTrendingInput(((Number.parseInt(trendingInput) || 0) + 50).toString())}>
                    +50
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTrendingInput(((Number.parseInt(trendingInput) || 0) + 500).toString())}>
                    +500
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTrendingInput(((Number.parseInt(trendingInput) || 0) + 5000).toString())}>
                    +5K
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
