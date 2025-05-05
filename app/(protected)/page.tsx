"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sword, Shield, Plus, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { User as UserType } from "@/lib/db/user"
import { Game } from "@/lib/types"

interface HomePageProps {
  initialUserData?: UserType | null;
}

export default function Home({ initialUserData }: HomePageProps = {}) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [newGameName, setNewGameName] = useState("")
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserType | null>(initialUserData || null)

  // Fetch games using the API route when component mounts
  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true)
        // Use the API route instead of direct import
        const response = await fetch('/api/games')
        
        if (!response.ok) {
          throw new Error('Failed to fetch games')
        }
        
        const userGames = await response.json()
        setGames(userGames)
      } catch (error) {
        console.error("Error fetching games:", error)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch games if we have a user session
    if (session?.user?.id) {
      fetchGames()
    }
  }, [session])

  // If initialUserData wasn't provided, use the image from the session
  useEffect(() => {
    if (!userData && session?.user) {
      setUserData({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || null,
        image: session.user.image || null
      });
    }
  }, [session, userData]);

  const handleCreateGame = async () => {
    if (newGameName.trim() && session?.user?.id) {
      try {
        // Set loading state
        setIsCreateGameOpen(false);
        setLoading(true);
        
        console.log("Creating game with name:", newGameName);
        
        // Use the API route instead of direct import
        const response = await fetch('/api/games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newGameName }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create game');
        }
        
        const newGame = await response.json();
        
        // Update the local state with the new game
        setGames([...games, newGame]);
        
        // Reset form and navigate to the DM page
        setNewGameName("");
        router.push(`/dm/${newGame.id}`);
      } catch (error) {
        // Detailed error logging
        console.error("Error creating game:", error);
        
        // Display a more user-friendly error message
        alert(`Failed to create game: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Reset loading state
        setLoading(false);
        setIsCreateGameOpen(true);
      }
    }
  }

  const handleLogout = async () => {
    try {
      // First try standard NextAuth signOut
      await signOut({ callbackUrl: "/login", redirect: false });
      
      // Then manually clear any cookies and redirect
      document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // Use direct URL navigation to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: Force navigate to login page
      window.location.href = "/login";
    }
  }

  // Get initial for avatar fallback
  const getInitials = () => {
    return userData?.name?.charAt(0)?.toUpperCase() || 
           session?.user?.name?.charAt(0)?.toUpperCase() || 
           "U";
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="px-16 mb-4 relative">
          <h1 className="text-4xl md:text-5xl font-bold torch-title text-center">
            Dungeon Crawler Chris
          </h1>
        </div>
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarImage 
                src={userData?.image || session?.user?.image || '/placeholder-user.jpg'} 
                alt={userData?.name || session?.user?.name || 'User'} 
              />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">
              {userData?.name || session?.user?.name || 'User'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="space-x-2">
          <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Create Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card">
              <DialogHeader>
                <DialogTitle>Create New Game</DialogTitle>
                <DialogDescription>Enter a name for your new adventure.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newGameName}
                    onChange={(e) => setNewGameName(e.target.value)}
                    className="col-span-3"
                    placeholder="Goontastic Adventure"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateGame}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" asChild>
            <Link href="/items">
              <Sword className="mr-2 h-4 w-4" /> Items
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card
            key={game.id}
            className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{game.name}</CardTitle>
              <CardDescription>{game.isDM ? "Dungeon Master" : "Player"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                {game.isDM ? (
                  <Shield className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <Sword className="mr-2 h-4 w-4 text-primary" />
                )}
                {game.isDM ? "You are running this game" : "You are a player in this game"}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={game.isDM ? `/dm/${game.id}` : `/player/${game.id}`}>Launch Game</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
