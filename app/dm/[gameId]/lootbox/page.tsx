"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Package, Search } from "lucide-react"
import { getGame, getGamePlayers, mockItems, mockLootboxes } from "@/lib/mock-data"

const LOOTBOX_TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Legendary", "Celestial"]

export default function LootboxPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.gameId as string

  const [game, setGame] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [lootboxes, setLootboxes] = useState<any[]>([])
  const [selectedLootbox, setSelectedLootbox] = useState<any>(null)

  const [lootboxName, setLootboxName] = useState("")
  const [selectedTier, setSelectedTier] = useState(LOOTBOX_TIERS[0])
  const [selectedPlayerId, setSelectedPlayerId] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchCategory, setSearchCategory] = useState("")

  // Get all unique categories
  const allCategories = Array.from(new Set(mockItems.flatMap((item) => item.categories))).sort()

  useEffect(() => {
    // In a real app, this would be an API call to get game data
    const gameData = getGame(gameId)
    if (!gameData) {
      router.push("/")
      return
    }

    setGame(gameData)
    setPlayers(getGamePlayers(gameId))

    // Get lootboxes for this game
    // In a real app, this would be filtered by gameId
    setLootboxes(mockLootboxes)
  }, [gameId, router])

  const handleSelectLootbox = (lootbox: any) => {
    setSelectedLootbox(lootbox)
    setLootboxName(lootbox.name)
    setSelectedTier(lootbox.tier)
    setSelectedItems(lootbox.possibleItems)
  }

  const handleSendLootbox = () => {
    if (!lootboxName.trim() || !selectedPlayerId || selectedItems.length === 0) {
      return
    }

    // In a real app, this would be an API call to create a lootbox
    const newLootbox = {
      id: `lootbox-${Date.now()}`,
      name: lootboxName,
      tier: selectedTier,
      possibleItems: selectedItems,
    }

    // Add lootbox to player
    const updatedPlayers = players.map((player) =>
      player.id === selectedPlayerId ? { ...player, lootboxes: [...player.lootboxes, newLootbox.id] } : player,
    )

    setPlayers(updatedPlayers)

    // Navigate back to DM page
    router.push(`/dm/${gameId}`)
  }

  // Filter items based on search term and selected category
  const filteredItems = mockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      searchCategory === "all" || searchCategory === "" ? true : item.categories.includes(searchCategory)

    return matchesSearch && matchesCategory
  })

  if (!game) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href={`/dm/${gameId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create Lootbox</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with existing lootboxes */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Existing Lootboxes</CardTitle>
            <CardDescription>Click on a lootbox to use as template</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {lootboxes.map((lootbox) => (
                  <div
                    key={lootbox.id}
                    className={`p-3 rounded-md cursor-pointer border ${
                      selectedLootbox?.id === lootbox.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-secondary/20"
                    }`}
                    onClick={() => handleSelectLootbox(lootbox)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{lootbox.name}</h3>
                      <Badge
                        className={`
                          ${lootbox.tier === "Bronze" ? "bg-amber-700" : ""}
                          ${lootbox.tier === "Silver" ? "bg-slate-400" : ""}
                          ${lootbox.tier === "Gold" ? "bg-yellow-500" : ""}
                          ${lootbox.tier === "Platinum" ? "bg-cyan-300 text-cyan-950" : ""}
                          ${lootbox.tier === "Legendary" ? "bg-purple-600" : ""}
                          ${lootbox.tier === "Celestial" ? "bg-blue-400 text-blue-950" : ""}
                        `}
                      >
                        {lootbox.tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{lootbox.possibleItems.length} items</p>
                  </div>
                ))}

                {lootboxes.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No lootboxes created yet.</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Lootbox creation form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Lootbox Details</CardTitle>
            <CardDescription>Create a new lootbox to give to a player</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Lootbox Name</Label>
                  <Input
                    id="name"
                    value={lootboxName}
                    onChange={(e) => setLootboxName(e.target.value)}
                    placeholder="Mysterious Chest"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier">Tier</Label>
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger id="tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOOTBOX_TIERS.map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {tier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">Player</Label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger id="player">
                    <SelectValue placeholder="Select player">
                      {selectedPlayerId
                        ? players.find((player) => player.id === selectedPlayerId)?.name
                        : "Select player"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lootbox Contents</Label>
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    {selectedItems.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedItems.map((itemId) => {
                          const item = mockItems.find((i) => i.id === itemId)
                          return item ? (
                            <Badge key={itemId} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                              {item.name}
                              <button
                                className="ml-1 rounded-full hover:bg-secondary/80"
                                onClick={() => setSelectedItems(selectedItems.filter((id) => id !== itemId))}
                              >
                                ×
                              </button>
                            </Badge>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No items added yet. Search and add items below.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex-1">
                    <Select value={searchCategory} onValueChange={setSearchCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {allCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <div className="space-y-4">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItems.includes(item.id)
                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-md border ${isSelected ? "border-primary bg-primary/10" : "border-border"}`}
                        >
                          <div className="flex items-start">
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedItems([...selectedItems, item.id])
                                } else {
                                  setSelectedItems(selectedItems.filter((id) => id !== item.id))
                                }
                              }}
                              className="mt-1 mr-2"
                            />
                            <div className="flex-1">
                              <Label htmlFor={`item-${item.id}`} className="text-base font-medium">
                                {item.name}
                              </Label>
                              <p className="text-sm text-muted-foreground italic">"{item.flavorText}"</p>
                              <p className="text-sm mt-1">{item.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.categories.map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {filteredItems.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">No items found matching your search.</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/dm/${gameId}`}>Cancel</Link>
            </Button>
            <Button
              onClick={handleSendLootbox}
              disabled={!lootboxName.trim() || !selectedPlayerId || selectedItems.length === 0}
            >
              <Package className="mr-2 h-4 w-4" />
              Send Lootbox
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
