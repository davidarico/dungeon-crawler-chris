"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getGame, createPlayer, getPlayerByGameAndUser } from "@/lib/api"
import { Game } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const gameId = params.gameId as string

  const [game, setGame] = useState<Game | null>(null)
  const [playerName, setPlayerName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    async function fetchGameAndCheckPlayer() {
      try {
        setIsPageLoading(true)
        const gameData = await getGame(gameId)
        
        if (!gameData) {
          toast({
            title: "Game not found",
            description: "The game you're trying to join doesn't exist.",
            variant: "destructive",
          })
          router.push("/")
          return
        }
        
        setGame(gameData)
        
        // Check if the user is already a player in this game
        if (session?.user?.id) {
          const existingPlayer = await getPlayerByGameAndUser(gameId, session.user.id)
          
          if (existingPlayer) {
            // User is already a player in this game, redirect to player page
            toast({
              title: "Already joined",
              description: "You're already a player in this game.",
            })
            router.push(`/player/${gameId}`)
            return
          }
        }
      } catch (error) {
        console.error("Failed to fetch game:", error)
        toast({
          title: "Error",
          description: "Failed to load game information. Please try again.",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setIsPageLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchGameAndCheckPlayer()
    } else {
      setIsPageLoading(false)
    }
  }, [gameId, router, session])

  const handleJoinGame = async () => {
    if (!playerName.trim() || !session?.user?.id) return

    setIsLoading(true)

    try {
      // Create a new player in the database
      await createPlayer(gameId, session.user.id, playerName.trim())
      
      toast({
        title: "Success!",
        description: "You've successfully joined the game.",
      })
      
      // Redirect to player page after successful join
      router.push(`/player/${gameId}`)
    } catch (error) {
      console.error("Failed to join game:", error)
      toast({
        title: "Failed to join",
        description: "There was an error joining the game. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Retrieving game information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>You need to be signed in to join a game.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/login?callbackUrl=" + encodeURIComponent(`/invite/${gameId}`))}>
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Game Not Found</CardTitle>
            <CardDescription>The game you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/")}>
              Return Home
            </Button>
          </CardFooter>
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
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Joining..." : "Join Game"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
