"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
import { mockGames } from "@/lib/mock-data"
import { useRouter } from "next/navigation"

export default function Home() {
  const [games, setGames] = useState(mockGames)
  const [newGameName, setNewGameName] = useState("")
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false)
  const router = useRouter()

  const handleCreateGame = () => {
    if (newGameName.trim()) {
      const newGame = {
        id: `game-${Date.now()}`,
        name: newGameName,
        dmId: "current-user-id", // In a real app, this would be the authenticated user's ID
        isDM: true,
      }
      setGames([...games, newGame])
      setNewGameName("")
      setIsCreateGameOpen(false)
      router.push(`/dm/${newGame.id}`)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold torch-title text-center mb-4">Dungeon Crawler Chris</h1>
        <div className="w-full flex justify-end">
          <Button variant="ghost" size="icon">
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
                    placeholder="Epic Quest"
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
