"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Package, Scroll, Search, Sword, Trash } from "lucide-react"
import { AbilityScoreCard } from "@/components/ability-score-card"
import { SavingThrowsCard } from "@/components/saving-throws-card"
import { WeaponDetails } from "@/components/weapon-details"
import { FollowersCard } from "@/components/followers-card"
import { GoldCard } from "@/components/gold-card"
import * as api from "@/lib/api"
import { getSession } from "next-auth/react"

export default function PlayerPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.gameId as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [game, setGame] = useState<any>(null)
  const [player, setPlayer] = useState<any>(null)
  const [playerClass, setPlayerClass] = useState<any>(null)
  const [playerItems, setPlayerItems] = useState<any[]>([])
  const [playerSpells, setPlayerSpells] = useState<any[]>([])
  const [playerLootboxes, setPlayerLootboxes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("items")
  const [healthChange, setHealthChange] = useState(0)
  const [selectedLootbox, setSelectedLootbox] = useState<any>(null)
  const [isLootboxDialogOpen, setIsLootboxDialogOpen] = useState(false)
  const [lootboxResult, setLootboxResult] = useState<any>(null)
  const [isLootboxResultDialogOpen, setIsLootboxResultDialogOpen] = useState(false)
  const [sparkles, setSparkles] = useState<any[]>([])
  const [isAbilityScoresDialogOpen, setIsAbilityScoresDialogOpen] = useState(false)

  const lootboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get the session using the non-hook method
        const session = await getSession();
        const userId = session?.user?.id;
        
        // Get game data
        const gameData = await api.getGame(gameId, userId);
        if (!gameData) {
          router.push("/");
          return;
        }
        
        // If the user is the DM, redirect to the DM page
        if (gameData.isDM) {
          router.push(`/dm/${gameId}`);
          return;
        }
        
        setGame(gameData);
        
        // Get player data
        let playerData = null;
        if (userId) {
          playerData = await api.getPlayerByGameAndUser(gameId, userId);
        }
        
        if (playerData) {
          setPlayer(playerData);
        } else {
          // No player found for this user/game - show creation form
          setError("No player found for this user/game.");
        }
        
        // Get player class if available
        if (playerData?.classId) {
          const classData = await api.getClass(playerData.classId);
          setPlayerClass(classData);
        }

        // Get player items, spells, and lootboxes
        const items = await api.getPlayerItems(playerData);
        const spells = await api.getPlayerSpells(playerData);
        const lootboxes = await api.getPlayerLootboxes(playerData);

        setPlayerItems(items);
        setPlayerSpells(spells);
        setPlayerLootboxes(lootboxes);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [gameId, router]);

  const refreshPlayerData = async () => {
    if (!player) return

    try {
      // Get updated player data
      const updatedPlayer = await api.getPlayer(player.id)
      if (!updatedPlayer) return

      setPlayer(updatedPlayer)

      // Refresh related data
      const items = await api.getPlayerItems(updatedPlayer)
      const spells = await api.getPlayerSpells(updatedPlayer)
      const lootboxes = await api.getPlayerLootboxes(updatedPlayer)

      setPlayerItems(items)
      setPlayerSpells(spells)
      setPlayerLootboxes(lootboxes)

      // Update class if needed
      if (updatedPlayer.classId !== player.classId) {
        const classData = updatedPlayer.classId ? await api.getClass(updatedPlayer.classId) : null
        setPlayerClass(classData)
      }
    } catch (err) {
      console.error("Error refreshing player data:", err)
    }
  }

  const handleHealthChange = async (amount: number) => {
    if (!player) return

    try {
      const newHealth = Math.min(Math.max(player.health + amount, 0), player.maxHealth)
      const updatedPlayer = await api.updatePlayerHealth(player.id, newHealth)
      setPlayer(updatedPlayer)
      setHealthChange(0) // Reset the input after applying
    } catch (err) {
      console.error("Error updating health:", err)
    }
  }

  const handleLongRest = async () => {
    if (!player) return

    try {
      const updatedPlayer = await api.updatePlayerHealth(player.id, player.maxHealth)
      setPlayer(updatedPlayer)
    } catch (err) {
      console.error("Error performing long rest:", err)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!player) return

    try {
      const updatedPlayer = await api.removeItemFromPlayer(player.id, itemId)
      setPlayer(updatedPlayer)

      // Update the items list
      const updatedItems = playerItems.filter((item) => item.id !== itemId)
      setPlayerItems(updatedItems)
    } catch (err) {
      console.error("Error removing item:", err)
    }
  }

  const handleOpenLootbox = async () => {
    if (!selectedLootbox || !player) return

    try {
      // Get a random item from the lootbox
      const possibleItems = await api.getLootboxItems(selectedLootbox)
      const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)]

      setLootboxResult(randomItem)

      // Remove lootbox from player and add item
      await api.removeLootboxFromPlayer(player.id, selectedLootbox.id)
      await api.addItemToPlayer(player.id, randomItem.id)

      // Refresh player data
      await refreshPlayerData()

      // Close lootbox dialog and open result dialog
      setIsLootboxDialogOpen(false)
      setIsLootboxResultDialogOpen(true)

      // Create sparkles
      createSparkles()
    } catch (err) {
      console.error("Error opening lootbox:", err)
    }
  }

  const handleAbilityScoreChange = async (ability: keyof typeof player.abilityScores, value: number) => {
    if (!player) return

    try {
      const updatedPlayer = await api.updatePlayerAbilityScores(player.id, {
        [ability]: value,
      })
      setPlayer(updatedPlayer)
    } catch (err) {
      console.error("Error updating ability score:", err)
    }
  }

  const handleSavingThrowChange = async (type: "fortitude" | "reflex" | "willpower", value: number) => {
    if (!player) return

    try {
      const updatedPlayer = await api.updatePlayerSavingThrows(player.id, {
        [type]: value,
      })
      setPlayer(updatedPlayer)
    } catch (err) {
      console.error("Error updating saving throw:", err)
    }
  }

  const handleFollowersChange = async (followers: number, trending: number) => {
    if (!player) return

    try {
      const updatedPlayer = await api.updatePlayerFollowers(player.id, followers, trending)
      setPlayer(updatedPlayer)
    } catch (err) {
      console.error("Error updating followers:", err)
    }
  }

  const handleGoldChange = async (gold: number) => {
    if (!player) return

    try {
      const updatedPlayer = await api.updatePlayerGold(player.id, gold)
      setPlayer(updatedPlayer)
    } catch (err) {
      console.error("Error updating gold:", err)
    }
  }

  const createSparkles = () => {
    const newSparkles = []
    for (let i = 0; i < 20; i++) {
      newSparkles.push({
        id: i,
        tx: Math.random() * 300 - 150,
        ty: Math.random() * 300 - 150,
      })
    }
    setSparkles(newSparkles)
  }

  // Filter items based on search term
  const filteredItems = playerItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categories.some((cat: string) => cat.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Filter spells based on search term
  const filteredSpells = playerSpells.filter(
    (spell) =>
      spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spell.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter lootboxes based on search term
  const filteredLootboxes = playerLootboxes.filter(
    (lootbox) =>
      lootbox.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lootbox.tier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-muted-foreground">Retrieving your character data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!game || !player) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game or Player Not Found</h2>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{game.name}</h1>
      </div>

      <Card className="mb-6 border border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{player.name}</CardTitle>
              <CardDescription>
                Level {player.level} {playerClass ? playerClass.name : "No Class"}
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center justify-center bg-gray-200 rounded-md p-2 w-24">
                  <span className="text-xl font-bold text-red-600">{player.health}</span>
                  <span className="text-sm text-gray-600">{player.maxHealth}</span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleLongRest}
                >
                  REST
                </Button>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleHealthChange(healthChange)}
                  >
                    HEAL
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    THP
                  </Button>
                </div>

                <Input
                  type="number"
                  value={healthChange}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value)
                    setHealthChange(isNaN(value) ? 0 : value)
                  }}
                  className="text-center"
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleHealthChange(-healthChange)}
                >
                  DAMAGE
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Followers Section */}
        <FollowersCard
          followers={player.followers}
          trendingFollowers={player.trendingFollowers}
          onFollowersChange={handleFollowersChange}
        />

        {/* Gold Section */}
        <GoldCard gold={player.gold} onGoldChange={handleGoldChange} />
      </div>

      {/* Ability Scores Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ability Scores</h2>
          <Button variant="outline" size="sm" onClick={() => setIsAbilityScoresDialogOpen(true)}>
            Edit Scores
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AbilityScoreCard
            name="Strength"
            score={player.abilityScores.strength}
            description="Raw physical power: smashing, lifting, dragging, climbing. Affects melee attack rolls and melee damage."
          />
          <AbilityScoreCard
            name="Agility"
            score={player.abilityScores.agility}
            description="Speed, reflexes, hand-eye coordination, and finesse. Affects Armor Class (AC), initiative rolls, ranged attacks, and Reflex saves."
          />
          <AbilityScoreCard
            name="Stamina"
            score={player.abilityScores.stamina}
            description="Toughness, durability, resistance to pain, poison, or disease. Affects hit points and Fortitude saves."
          />
          <AbilityScoreCard
            name="Personality"
            score={player.abilityScores.personality}
            description="Charisma, willpower, presence, and crowd command. Affects Will saves and crowd interaction."
          />
          <AbilityScoreCard
            name="Intelligence"
            score={player.abilityScores.intelligence}
            description="Smarts, memory, and problem-solving. Affects languages known and understanding puzzles, glyphs, ancient tech."
          />
          <AbilityScoreCard
            name="Luck"
            score={player.abilityScores.luck}
            description="The wild card. Influences critical hits, fumbles, spell effects, glitches, and more. Can be burned for bonuses."
          />
        </div>
      </div>

      {/* Saving Throws Section */}
      <div className="mb-6">
        <SavingThrowsCard
          fortitude={player.savingThrows.fortitude}
          reflex={player.savingThrows.reflex}
          willpower={player.savingThrows.willpower}
        />
      </div>

      <div className="mb-6">
        <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="items" className="flex items-center gap-1">
                <Sword className="h-4 w-4" />
                <span>Items</span>
              </TabsTrigger>
              <TabsTrigger value="spells" className="flex items-center gap-1">
                <Scroll className="h-4 w-4" />
                <span>Spells</span>
              </TabsTrigger>
              <TabsTrigger value="lootboxes" className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>Lootboxes</span>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="items" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription className="italic">"{item.flavorText}"</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.categories.map((category: string) => (
                          <Badge key={category} variant="outline" className="bg-secondary/50">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      {item.categories.includes("Weapon") && <WeaponDetails item={item} />}
                    </CardContent>
                    <CardFooter>
                      {item.categories.includes("Consumable") && (
                        <Button variant="outline" className="w-full" onClick={() => handleRemoveItem(item.id)}>
                          Consume
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {searchTerm ? "No items found matching your search." : "You don't have any items yet."}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="spells" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpells.length > 0 ? (
                filteredSpells.map((spell) => (
                  <Card key={spell.id} className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>{spell.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{spell.description}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {searchTerm ? "No spells found matching your search." : "You don't have any spells yet."}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lootboxes" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLootboxes.length > 0 ? (
                filteredLootboxes.map((lootbox) => (
                  <Card
                    key={lootbox.id}
                    className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{lootbox.name}</CardTitle>
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
                    </CardHeader>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedLootbox(lootbox)
                          setIsLootboxDialogOpen(true)
                        }}
                      >
                        Open
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {searchTerm ? "No lootboxes found matching your search." : "You don't have any lootboxes yet."}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lootbox Opening Dialog */}
      <Dialog open={isLootboxDialogOpen} onOpenChange={setIsLootboxDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Open Lootbox</DialogTitle>
            <DialogDescription>Are you sure you want to open this {selectedLootbox?.tier} lootbox?</DialogDescription>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            <div
              className={`
                w-32 h-32 rounded-lg flex items-center justify-center
                ${selectedLootbox?.tier === "Bronze" ? "bg-amber-700/30" : ""}
                ${selectedLootbox?.tier === "Silver" ? "bg-slate-400/30" : ""}
                ${selectedLootbox?.tier === "Gold" ? "bg-yellow-500/30" : ""}
                ${selectedLootbox?.tier === "Platinum" ? "bg-cyan-300/30" : ""}
                ${selectedLootbox?.tier === "Legendary" ? "bg-purple-600/30" : ""}
                ${selectedLootbox?.tier === "Celestial" ? "bg-blue-400/30" : ""}
              `}
            >
              <Package className="h-16 w-16" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLootboxDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenLootbox}>Open Lootbox</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lootbox Result Dialog */}
      <Dialog open={isLootboxResultDialogOpen} onOpenChange={setIsLootboxResultDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>You found an item!</DialogTitle>
          </DialogHeader>
          <div className="py-8 flex justify-center">
            <div
              ref={lootboxRef}
              className="relative w-64 h-64 rounded-lg flex items-center justify-center lootbox-animation"
            >
              {sparkles.map((sparkle) => (
                <div
                  key={sparkle.id}
                  className="sparkle"
                  style={
                    {
                      "--tx": `${sparkle.tx}px`,
                      "--ty": `${sparkle.ty}px`,
                      left: "50%",
                      top: "50%",
                      animationDelay: `${sparkle.id * 0.05}s`,
                    } as React.CSSProperties
                  }
                />
              ))}

              {lootboxResult && (
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{lootboxResult.name}</h3>
                  <p className="text-sm italic mb-4">"{lootboxResult.flavorText}"</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {lootboxResult.categories.map((category: string) => (
                      <Badge key={category} variant="outline" className="bg-secondary/50">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm">{lootboxResult.description}</p>
                  {lootboxResult.categories.includes("Weapon") && <WeaponDetails item={lootboxResult} />}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLootboxResultDialogOpen(false)}>Add to Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ability Scores Dialog */}
      <Dialog open={isAbilityScoresDialogOpen} onOpenChange={setIsAbilityScoresDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Ability Scores</DialogTitle>
            <DialogDescription>Adjust your character's ability scores and saving throws</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AbilityScoreCard
                name="Strength"
                score={player.abilityScores.strength}
                description="Raw physical power: smashing, lifting, dragging, climbing. Affects melee attack rolls and melee damage."
                editable={true}
                onScoreChange={(value) => handleAbilityScoreChange("strength", value)}
              />
              <AbilityScoreCard
                name="Agility"
                score={player.abilityScores.agility}
                description="Speed, reflexes, hand-eye coordination, and finesse. Affects Armor Class (AC), initiative rolls, ranged attacks, and Reflex saves."
                editable={true}
                onScoreChange={(value) => handleAbilityScoreChange("agility", value)}
              />
              <AbilityScoreCard
                name="Stamina"
                score={player.abilityScores.stamina}
                description="Toughness, durability, resistance to pain, poison, or disease. Affects hit points and Fortitude saves."
                editable={true}
                onScoreChange={(value) => handleAbilityScoreChange("stamina", value)}
              />
              <AbilityScoreCard
                name="Personality"
                score={player.abilityScores.personality}
                description="Charisma, willpower, presence, and crowd command. Affects Will saves and crowd interaction."
                editable={true}
                onScoreChange={(value) => handleAbilityScoreChange("personality", value)}
              />
              <AbilityScoreCard
                name="Intelligence"
                score={player.abilityScores.intelligence}
                description="Smarts, memory, and problem-solving. Affects languages known and understanding puzzles, glyphs, ancient tech."
                editable={true}
                onScoreChange={(value) => handleAbilityScoreChange("intelligence", value)}
              />
              <AbilityScoreCard
                name="Luck"
                score={player.abilityScores.luck}
                description="The wild card. Influences critical hits, fumbles, spell effects, glitches, and more. Can be burned for bonuses."
                editable={true}
                onScoreChange={(value) => handleAbilityScoreChange("luck", value)}
              />
            </div>

            <SavingThrowsCard
              fortitude={player.savingThrows.fortitude}
              reflex={player.savingThrows.reflex}
              willpower={player.savingThrows.willpower}
              editable={true}
              onSavingThrowChange={handleSavingThrowChange}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAbilityScoresDialogOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
