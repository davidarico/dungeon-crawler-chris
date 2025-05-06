"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchGame, checkPlayerInGame, createPlayerForGame } from "@/lib/client-utils"
import { Game } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const gameId = params.gameId as string

  const [game, setGame] = useState<Game | null>(null)
  const [playerName, setPlayerName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>({})

  console.log("Invite page render - Session status:", sessionStatus, "User:", session?.user?.id ? "Logged in" : "Not logged in")
  console.log("Game ID from params:", gameId)

  useEffect(() => {
    console.log("Effect triggered - Session status:", sessionStatus, "User ID:", session?.user?.id)
    
    async function fetchGameAndCheckPlayer() {
      try {
        setIsPageLoading(true)
        console.log("Fetching game data for ID:", gameId)
        
        const gameData = await fetchGame(gameId, true) // Pass true to indicate this is an invite page
        console.log("Game data received:", gameData ? "Success" : "Not found")
        
        if (!gameData) {
          console.log("Game not found, redirecting to home")
          toast({
            title: "Game not found",
            description: "The game you're trying to join doesn't exist.",
            variant: "destructive",
          })
          router.push("/")
          return
        }
        
        setGame(gameData)
        setDebugInfo(prev => ({ ...prev, game: gameData }))
        
        // Check if the user is already a player in this game
        if (session?.user?.id) {
          console.log("Checking if user is already in game")
          try {
            const playerCheck = await checkPlayerInGame(gameId)
            console.log("Player check result:", playerCheck)
            setDebugInfo(prev => ({ ...prev, playerCheck }))
            
            if (playerCheck?.exists) {
              console.log("User already in game, redirecting to player page")
              // User is already a player in this game, redirect to player page
              toast({
                title: "Already joined",
                description: "You're already a player in this game.",
              })
              router.push(`/player/${gameId}`)
              return
            }
          } catch (playerCheckError) {
            console.error("Error checking player:", playerCheckError)
            setDebugInfo(prev => ({ ...prev, playerCheckError: playerCheckError.message }))
            // Don't redirect here, let the user see the form
          }
        }
      } catch (error) {
        console.error("Failed to fetch game:", error)
        setDebugInfo(prev => ({ ...prev, fetchError: error.message }))
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

    // Only fetch if we have a session or know we're not authenticated
    if (sessionStatus !== "loading") {
      if (session?.user?.id) {
        console.log("User is authenticated, fetching game data")
        fetchGameAndCheckPlayer()
      } else {
        console.log("User is not authenticated, showing sign-in prompt")
        setIsPageLoading(false)
      }
    }
  }, [gameId, router, session, sessionStatus])

  const handleJoinGame = async () => {
    if (!playerName.trim() || !session?.user?.id) return

    setIsLoading(true)

    try {
      console.log("Creating player for game:", gameId, "with name:", playerName.trim())
      // Create a new player in the database
      await createPlayerForGame(gameId, playerName.trim())
      
      toast({
        title: "Success!",
        description: "You've successfully joined the game.",
      })
      
      console.log("Player created successfully, redirecting to player page")
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
