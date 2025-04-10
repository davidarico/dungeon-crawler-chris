"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getGame } from "@/lib/mock-data"

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.gameId as string

  const [game, setGame] = useState<any>(null)
  const [playerName, setPlayerName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // In a real app, this would be an API call to get game data
    const gameData = getGame(gameId)
    if (!gameData) {
      router.push("/")
      return
    }

    setGame(gameData)
  }, [gameId, router])

  const handleJoinGame = () => {
    if (!playerName.trim()) return

    setIsLoading(true)

    // In a real app, this would be an API call to join the game
    setTimeout(() => {
      // Simulate API call
      router.push(`/player/${gameId}`)
    }, 1000)
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Retrieving game information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md border border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Join Game</CardTitle>
          <CardDescription>
            You've been invited to join <span className="font-semibold">{game.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Character Name</Label>
              <Input
                id="name"
                placeholder="Enter your character name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleJoinGame} disabled={!playerName.trim() || isLoading}>
            {isLoading ? "Joining..." : "Join Game"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
