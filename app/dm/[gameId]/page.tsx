"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDMWebSocket } from "@/hooks/use-dm-websocket";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Coins,
  Copy,
  Edit,
  Heart,
  MoreHorizontal,
  Package,
  Plus,
  Scroll,
  Shield,
  Sword,
  Trash,
  TrendingUp,
  UserPlus,
  Users,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AbilityScoreCard } from "@/components/ability-score-card";
import { SavingThrowsCard } from "@/components/saving-throws-card";
import { FollowersCard } from "@/components/followers-card";
import { CreditCard } from "@/components/credit-card";
import {
  Game,
  PlayerWithRelations,
  Class,
  Spell,
  Item,
  Lootbox,
} from "@/lib/types";
import { useSession } from "next-auth/react";

export default function DMPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { data: session } = useSession();
  const { isConnected, lastUpdate } = useDMWebSocket(gameId);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<PlayerWithRelations[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [inviteLink, setInviteLink] = useState("");
  const [selectedPlayer, setSelectedPlayer] =
    useState<PlayerWithRelations | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSpellsDialogOpen, setIsSpellsDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [isLootboxesDialogOpen, setIsLootboxesDialogOpen] = useState(false);
  const [isAddItemsDialogOpen, setIsAddItemsDialogOpen] = useState(false);
  const [isAddSpellsDialogOpen, setIsAddSpellsDialogOpen] = useState(false);
  const [isEditLevelDialogOpen, setIsEditLevelDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const [isAbilityScoresDialogOpen, setIsAbilityScoresDialogOpen] =
    useState(false);
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerLevel, setNewPlayerLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const getPlayerSpells = (player: PlayerWithRelations): Spell[] => {
    if (!player.spells) return [];
    return player.spells.map(
      (spellId) =>
        spells.find((s) => s.id === spellId) || {
          id: spellId,
          name: "Unknown Spell",
          description: "Spell details not available",
        }
    ) as Spell[];
  };

  const getPlayerItems = (player: PlayerWithRelations): Item[] => {
    if (!player.items) return [];
    return player.items.map(
      (itemId) =>
        items.find((i) => i.id === itemId) || {
          id: itemId,
          name: "Unknown Item",
          description: "Item details not available",
          categories: [],
          flavorText: "",
        }
    ) as Item[];
  };

  const getPlayerLootboxes = (player: PlayerWithRelations): Lootbox[] => {
    if (!player.lootboxes) return [];
    return player.lootboxes.map((lootboxId) => ({
      id: lootboxId,
      name: "Lootbox",
      tier: "Bronze" as const,
      possibleItems: [],
    })) as Lootbox[];
  };

  // Fetch data function - wrapped in useCallback to maintain reference stability
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/games/${gameId}/dm-data`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.status === 403) {
          router.push(`/player/${gameId}`);
          return;
        }

        if (response.status === 404) {
          router.push("/");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load DM data");
      }

      const data = await response.json();

      setGame(data.game);
      setPlayers(data.players);
      setClasses(data.classes);
      setItems(data.items);
      setSpells(data.spells);
      setLastRefresh(new Date());

      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/invite/${gameId}`);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [gameId, router]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [gameId, router]);

  // Track the last update we processed to avoid duplicate processing
  const lastProcessedUpdateRef = useRef<string | null>(null);

  // Handle WebSocket updates with improved deduplication
  useEffect(() => {
    if (!lastUpdate || !gameId) return;

    // Skip if this is the same update we already processed
    // Using a ref instead of state to avoid re-renders
    if (lastUpdate.timestamp === lastProcessedUpdateRef.current) {
      console.log("Skipping duplicate WebSocket update:", lastUpdate.timestamp);
      return;
    }

    console.log("Processing DM WebSocket update:", lastUpdate);

    // Remember this update's timestamp
    lastProcessedUpdateRef.current = lastUpdate.timestamp;

    // Use a small delay to debounce rapid updates
    const timeoutId = setTimeout(() => {
      console.log("Executing debounced fetchData after WebSocket update");
      fetchData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [lastUpdate, gameId, fetchData]);

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Loading game data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-[50vh]">
        <div className="text-destructive mb-4">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-[50vh]">
        <div className="text-muted-foreground mb-4">Game not found</div>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const handleLevelUp = (playerId: string) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId ? { ...player, level: player.level + 1 } : player
      )
    );
  };

  const handleUpdateLevel = () => {
    if (!selectedPlayer) return;

    setPlayers(
      players.map((player) =>
        player.id === selectedPlayer.id
          ? { ...player, level: newPlayerLevel }
          : player
      )
    );

    setIsEditLevelDialogOpen(false);
  };

  const handleRenamePlayer = () => {
    if (!selectedPlayer || !newPlayerName.trim()) return;

    setPlayers(
      players.map((player) =>
        player.id === selectedPlayer.id
          ? { ...player, name: newPlayerName }
          : player
      )
    );

    setIsRenameDialogOpen(false);
  };

  const handleKickPlayer = () => {
    if (!selectedPlayer) return;

    setPlayers(players.filter((player) => player.id !== selectedPlayer.id));
    setIsKickDialogOpen(false);
  };

  const handleAssignClass = (classId: string) => {
    if (!selectedPlayer) return;

    const selectedClass = classes.find((cls) => cls.id === classId);
    if (!selectedClass) return;

    setPlayers(
      players.map((player) =>
        player.id === selectedPlayer.id
          ? {
              ...player,
              classId: classId,
              spells: [...selectedClass.defaultSpells],
            }
          : player
      )
    );

    setIsClassDialogOpen(false);
  };

  const handleAddItems = () => {
    if (!selectedPlayer || selectedItems.length === 0) return;

    setPlayers(
      players.map((player) => {
        if (player.id === selectedPlayer.id) {
          // Create a safe copy of the existing items as string[], handling both array types
          const existingItems = player.items
            ? Array.isArray(player.items)
              ? typeof player.items[0] === "string"
                ? (player.items as string[])
                : (player.items as Item[]).map((item) => item.id)
              : []
            : [];

          // Return the player with the updated items array
          return {
            ...player,
            items: [...existingItems, ...selectedItems],
          };
        }
        return player;
      })
    );

    setSelectedItems([]);
    setIsAddItemsDialogOpen(false);
  };

  const handleAddSpells = () => {
    if (!selectedPlayer || selectedSpells.length === 0) return;

    setPlayers(
      players.map((player) => {
        if (player.id === selectedPlayer.id) {
          // Create a safe copy of the existing spells as string[], handling both array types
          const existingSpells = player.spells
            ? Array.isArray(player.spells)
              ? typeof player.spells[0] === "string"
                ? (player.spells as string[])
                : (player.spells as Spell[]).map((spell) => spell.id)
              : []
            : [];

          // Return the player with the updated spells array
          return {
            ...player,
            spells: [...existingSpells, ...selectedSpells],
          };
        }
        return player;
      })
    );

    setSelectedSpells([]);
    setIsAddSpellsDialogOpen(false);
  };

  const handleAbilityScoreChange = (ability: string, value: number) => {
    if (!selectedPlayer) return;

    setPlayers(
      players.map((player) =>
        player.id === selectedPlayer.id
          ? {
              ...player,
              abilityScores: {
                ...player.abilityScores,
                [ability]: value,
              },
            }
          : player
      )
    );
  };

  const handleSavingThrowChange = (
    type: "fortitude" | "reflex" | "willpower",
    value: number
  ) => {
    if (!selectedPlayer) return;

    setPlayers(
      players.map((player) =>
        player.id === selectedPlayer.id
          ? {
              ...player,
              savingThrows: {
                ...player.savingThrows,
                [type]: value,
              },
            }
          : player
      )
    );
  };

  const handleFollowersChange = (followers: number, trending: number) => {
    if (!selectedPlayer) return;

    setPlayers(
      players.map((player) =>
        player.id === selectedPlayer.id
          ? {
              ...player,
              followers,
              trendingFollowers: trending,
            }
          : player
      )
    );

    setIsFollowersDialogOpen(false);
  };

  const handleCreditChange = (crawlerCredit: number) => {
    if (!selectedPlayer) return;

    setPlayers(
      players.map((player) =>
        player.id === selectedPlayer.id
          ? {
              ...player,
              crawlerCredit,
            }
          : player
      )
    );

    setIsCreditDialogOpen(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categories.some((cat) =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const filteredSpells = spells.filter(
    (spell) =>
      spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spell.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{game.name}</h1>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center text-sm">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="mr-4">{isConnected ? "Live" : "Offline"}</span>
            {lastRefresh && (
              <span className="text-muted-foreground">
                Last update: {format(lastRefresh, "HH:mm:ss")}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Invite Players
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card">
                <DialogHeader>
                  <DialogTitle>Invite Players</DialogTitle>
                  <DialogDescription>
                    Share this link with your players to invite them to your
                    game.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 mt-4">
                  <Input value={inviteLink} readOnly />
                  <Button size="icon" onClick={handleCopyInviteLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button asChild>
              <Link href={`/dm/${gameId}/lootbox`}>
                <Package className="mr-2 h-4 w-4" /> Give Lootbox
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => {
          const playerClass = player.classId
            ? classes.find((cls) => cls.id === player.classId)
            : null;
          const playerSpells = getPlayerSpells(player);
          const playerItems = getPlayerItems(player);
          const playerLootboxes = getPlayerLootboxes(player);

          return (
            <Card
              key={player.id}
              className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center">
                      {player.name}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-2"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlayer(player);
                              setNewPlayerName(player.name);
                              setIsRenameDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Rename Player
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlayer(player);
                              setIsAbilityScoresDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Ability Scores
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlayer(player);
                              setIsFollowersDialogOpen(true);
                            }}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Edit Followers
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlayer(player);
                              setIsCreditDialogOpen(true);
                            }}
                          >
                            <Coins className="mr-2 h-4 w-4" />
                            Edit Gold
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlayer(player);
                              setIsKickDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Kick Player
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardTitle>
                    <CardDescription>
                      {playerClass ? playerClass.name : "No Class Assigned"}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlayer(player);
                        setNewPlayerLevel(player.level);
                        setIsEditLevelDialogOpen(true);
                      }}
                    >
                      Level {player.level}
                    </Button>
                    <Button size="sm" onClick={() => handleLevelUp(player.id)}>
                      Level Up
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Health
                    </span>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-500 mr-1" />
                      <span>
                        {player.health}/{player.maxHealth}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      CrawlerCredit
                    </span>
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{player.crawlerCredit} CC</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0"
                        onClick={() => {
                          setSelectedPlayer(player);
                          setIsCreditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Followers
                    </span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-primary mr-1" />
                      <span>{player.followers.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Trending
                    </span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">
                        {player.trendingFollowers.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsFollowersDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-2"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsSpellsDialogOpen(true);
                    }}
                  >
                    <Scroll className="h-4 w-4 mb-1" />
                    <span className="text-xs">Spells</span>
                    <span className="text-sm font-bold">
                      {playerSpells.length}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-2"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsItemsDialogOpen(true);
                    }}
                  >
                    <Sword className="h-4 w-4 mb-1" />
                    <span className="text-xs">Items</span>
                    <span className="text-sm font-bold">
                      {playerItems.length}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-2"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsLootboxesDialogOpen(true);
                    }}
                  >
                    <Package className="h-4 w-4 mb-1" />
                    <span className="text-xs">Lootboxes</span>
                    <span className="text-sm font-bold">
                      {playerLootboxes.length}
                    </span>
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <div className="grid grid-cols-2 gap-2 w-full">
                  {!player.classId ? (
                    <Button
                      className="col-span-2"
                      onClick={() => {
                        setSelectedPlayer(player);
                        setIsClassDialogOpen(true);
                      }}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Assign Class
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setSelectedPlayer(player);
                          setSearchTerm("");
                          setSelectedSpells([]);
                          setIsAddSpellsDialogOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Spells
                      </Button>

                      <Button
                        onClick={() => {
                          setSelectedPlayer(player);
                          setSearchTerm("");
                          setSelectedItems([]);
                          setIsAddItemsDialogOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Items
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}

        {players.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No players have joined this game yet. Invite players to get started.
          </div>
        )}
      </div>

      {/* Assign Class Dialog */}
      <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>Assign Class</DialogTitle>
            <DialogDescription>
              Select a class for {selectedPlayer?.name}. This will also assign
              default spells.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className="cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => handleAssignClass(cls.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Default Spells:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cls.defaultSpells.map((spellId) => {
                      const spell = spells.find((s) => s.id === spellId);
                      return spell ? (
                        <Badge key={spellId} variant="outline">
                          {spell.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Spells Dialog */}
      <Dialog open={isSpellsDialogOpen} onOpenChange={setIsSpellsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>{selectedPlayer?.name}'s Spells</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            {selectedPlayer && getPlayerSpells(selectedPlayer).length > 0 ? (
              <div className="space-y-4">
                {getPlayerSpells(selectedPlayer).map((spell) => (
                  <Card key={spell.id} className="bg-secondary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{spell.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{spell.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No spells found.
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Items Dialog */}
      <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>{selectedPlayer?.name}'s Items</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            {selectedPlayer && getPlayerItems(selectedPlayer).length > 0 ? (
              <div className="space-y-4">
                {getPlayerItems(selectedPlayer).map((item) => (
                  <Card key={item.id} className="bg-secondary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription className="italic">
                        "{item.flavorText}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items found.
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Lootboxes Dialog */}
      <Dialog
        open={isLootboxesDialogOpen}
        onOpenChange={setIsLootboxesDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>{selectedPlayer?.name}'s Lootboxes</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            {selectedPlayer && getPlayerLootboxes(selectedPlayer).length > 0 ? (
              <div className="space-y-4">
                {getPlayerLootboxes(selectedPlayer).map((lootbox) => (
                  <Card key={lootbox.id} className="bg-secondary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{lootbox.name}</CardTitle>
                      <CardDescription>{lootbox.tier} Tier</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No lootboxes found.
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add Items Dialog */}
      <Dialog
        open={isAddItemsDialogOpen}
        onOpenChange={setIsAddItemsDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>Add Items to {selectedPlayer?.name}</DialogTitle>
            <DialogDescription>
              Select items to add to the player's inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary/20"
                  >
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(
                            selectedItems.filter((id) => id !== item.id)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`item-${item.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddItemsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddItems}
              disabled={selectedItems.length === 0}
            >
              Add Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Spells Dialog */}
      <Dialog
        open={isAddSpellsDialogOpen}
        onOpenChange={setIsAddSpellsDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>Add Spells to {selectedPlayer?.name}</DialogTitle>
            <DialogDescription>
              Select spells to add to the player's spellbook.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Search spells..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredSpells.map((spell) => (
                  <div
                    key={spell.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary/20"
                  >
                    <Checkbox
                      id={`spell-${spell.id}`}
                      checked={selectedSpells.includes(spell.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSpells([...selectedSpells, spell.id]);
                        } else {
                          setSelectedSpells(
                            selectedSpells.filter((id) => id !== spell.id)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`spell-${spell.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{spell.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {spell.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddSpellsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSpells}
              disabled={selectedSpells.length === 0}
            >
              Add Spells
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Level Dialog */}
      <Dialog
        open={isEditLevelDialogOpen}
        onOpenChange={setIsEditLevelDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Level</DialogTitle>
            <DialogDescription>
              Change {selectedPlayer?.name}'s level.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={newPlayerLevel}
              onChange={(e) => setNewPlayerLevel(parseInt(e.target.value))}
              min={1}
              max={20}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditLevelDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateLevel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Player Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Rename Player</DialogTitle>
            <DialogDescription>
              Change {selectedPlayer?.name}'s name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="New name"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenamePlayer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kick Player Dialog */}
      <Dialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Kick Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedPlayer?.name} from the
              game? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsKickDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleKickPlayer}>
              Kick Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ability Scores Dialog */}
      <Dialog
        open={isAbilityScoresDialogOpen}
        onOpenChange={setIsAbilityScoresDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Ability Scores</DialogTitle>
            <DialogDescription>
              Adjust {selectedPlayer?.name}'s ability scores.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPlayer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AbilityScoreCard
                  name="Strength"
                  score={selectedPlayer.abilityScores?.strength || 10}
                  description="Raw physical power: smashing, lifting, dragging, climbing. Affects melee attack rolls and melee damage."
                  editable
                  onScoreChange={(value) =>
                    handleAbilityScoreChange("strength", value)
                  }
                />
                <AbilityScoreCard
                  name="Agility"
                  score={selectedPlayer.abilityScores?.agility || 10}
                  description="Speed, reflexes, hand-eye coordination, and finesse. Affects Armor Class (AC), initiative rolls, ranged attacks, and Reflex saves."
                  editable
                  onScoreChange={(value) =>
                    handleAbilityScoreChange("agility", value)
                  }
                />
                <AbilityScoreCard
                  name="Stamina"
                  score={selectedPlayer.abilityScores?.stamina || 10}
                  description="Toughness, durability, resistance to pain, poison, or disease. Affects hit points and Fortitude saves."
                  editable
                  onScoreChange={(value) =>
                    handleAbilityScoreChange("stamina", value)
                  }
                />
                <AbilityScoreCard
                  name="Personality"
                  score={selectedPlayer.abilityScores?.personality || 10}
                  description="Charisma, willpower, presence, and crowd command. Affects Will saves and crowd interaction."
                  editable
                  onScoreChange={(value) =>
                    handleAbilityScoreChange("personality", value)
                  }
                />
                <AbilityScoreCard
                  name="Intelligence"
                  score={selectedPlayer.abilityScores?.intelligence || 10}
                  description="Smarts, memory, and problem-solving. Affects languages known and understanding puzzles, glyphs, ancient tech."
                  editable
                  onScoreChange={(value) =>
                    handleAbilityScoreChange("intelligence", value)
                  }
                />
                <AbilityScoreCard
                  name="Luck"
                  score={selectedPlayer.abilityScores?.luck || 10}
                  description="The wild card. Influences critical hits, fumbles, spell effects, glitches, and more. Can be burned for bonuses."
                  editable
                  onScoreChange={(value) =>
                    handleAbilityScoreChange("luck", value)
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAbilityScoresDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Followers Dialog */}
      <Dialog
        open={isFollowersDialogOpen}
        onOpenChange={setIsFollowersDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Followers</DialogTitle>
            <DialogDescription>
              Adjust {selectedPlayer?.name}'s follower count.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedPlayer && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="followers">Total Followers</Label>
                  <Input
                    id="followers"
                    type="number"
                    value={selectedPlayer.followers}
                    onChange={(e) =>
                      handleFollowersChange(
                        parseInt(e.target.value),
                        selectedPlayer.trendingFollowers
                      )
                    }
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trending">Trending Followers</Label>
                  <Input
                    id="trending"
                    type="number"
                    value={selectedPlayer.trendingFollowers}
                    onChange={(e) =>
                      handleFollowersChange(
                        selectedPlayer.followers,
                        parseInt(e.target.value)
                      )
                    }
                    min={0}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFollowersDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Credit Dialog */}
      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Crawler Credit</DialogTitle>
            <DialogDescription>
              Adjust {selectedPlayer?.name}'s crawler credit amount.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPlayer && (
              <div className="space-y-2">
                <Label htmlFor="crawlerCredit">Crawler Credit Amount</Label>
                <Input
                  id="crawlerCredit"
                  type="number"
                  value={selectedPlayer.crawlerCredit}
                  onChange={(e) => handleCreditChange(parseInt(e.target.value))}
                  min={0}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCreditDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
