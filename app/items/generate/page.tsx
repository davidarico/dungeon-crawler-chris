"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Wand2, Loader2 } from "lucide-react"
import { fetchItems, generateItems, createItems } from "@/lib/client-utils" // Changed from @/lib/api to client-utils
import { Item, EquipSlot } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

// Item categories that the user can select
const ITEM_CATEGORIES = {
  WEAPON: "Weapon",
  ARMOR: "Armor",
  CONSUMABLE: "Consumable",
  MAGICAL: "Magical",
  TOOL: "Tool",
  TREASURE: "Treasure",
}

// Equipment slot options for armor items
const EQUIPMENT_SLOTS: Record<string, EquipSlot> = {
  HEAD: "head",
  CHEST: "chest",
  LEGS: "legs",
  HANDS: "hands",
  FEET: "feet",
  NECK: "neck",
  RING: "ring",
  SHIELD: "shield",
}

interface GeneratedItem extends Omit<Item, 'id'> {
  selected: boolean;
}

export default function GenerateItemsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existingItems, setExistingItems] = useState<Item[]>([])
  const [itemCategory, setItemCategory] = useState<string>(ITEM_CATEGORIES.WEAPON)
  const [equipmentSlot, setEquipmentSlot] = useState<EquipSlot | "">("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([])
  
  // Fetch existing items for context
  useEffect(() => {
    async function fetchItemsData() {
      try {
        const items = await fetchItems()
        setExistingItems(items)
      } catch (error) {
        console.error("Error fetching items:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchItemsData()
  }, [])
  
  // Create the prompt for ChatGPT based on user selections
  const generatePrompt = () => {
    // Filter items by category and equipment slot if applicable
    const existingItemsOfCategory = existingItems.filter(item => {
      if (itemCategory === ITEM_CATEGORIES.ARMOR && equipmentSlot) {
        return item.equip_slot === equipmentSlot || item.equipSlot === equipmentSlot;
      }
      return item.categories?.includes(itemCategory);
    });
    
    // Start the prompt with basic instructions
    let prompt = `Generate 10 fantasy items for a Dungeon Crawler game. Each item should have a name, description, and flavor text. Format the response as a JSON array with each item having the following structure: { name, description, flavorText, categories: string[], equipSlot?: string, damage?: string, armorClass?: number, value?: number, weight?: number }.\n\n`;
    
    prompt += `I want to generate items in the category: ${itemCategory}.`;
    
    if (itemCategory === ITEM_CATEGORIES.ARMOR && equipmentSlot) {
      prompt += ` Specifically for the ${equipmentSlot} equipment slot.`;
    }
    
    if (itemCategory === ITEM_CATEGORIES.WEAPON) {
      prompt += " Include a damage property for each weapon (e.g. '1d6', '2d4', etc.).";
    } else if (itemCategory === ITEM_CATEGORIES.ARMOR) {
      prompt += " Include an armorClass property for each armor item.";
    }
    
    // Add context from existing items if available - now with up to 10 examples
    if (existingItemsOfCategory.length > 0) {
      prompt += "\n\nHere are examples of existing items in this category for context. Please generate items with a similar style and format:\n";
      
      // Format each example item with all its properties
      existingItemsOfCategory.slice(0, 10).forEach((item, index) => {
        prompt += `${index + 1}. Name: ${item.name}\n`;
        prompt += `   Description: ${item.description}\n`;
        prompt += `   Flavor Text: "${item.flavorText}"\n`;
        
        if (item.damage) {
          prompt += `   Damage: ${item.damage}\n`;
        }
        
        if (item.armorClass !== undefined) {
          prompt += `   Armor Class: ${item.armorClass}\n`;
        }
        
        if (item.equipSlot || item.equip_slot) {
          prompt += `   Equipment Slot: ${item.equipSlot || item.equip_slot}\n`;
        }
        
        if (item.value) {
          prompt += `   Value: ${item.value}\n`;
        }
        
        if (item.weight) {
          prompt += `   Weight: ${item.weight}\n`;
        }
        
        prompt += `   Categories: ${item.categories.join(', ')}\n\n`;
      });
    }
    
    // Add any custom prompt from the user
    if (customPrompt.trim()) {
      prompt += `\nAdditional requirements: ${customPrompt}\n`;
    }
    
    // Final reminder to format as JSON
    prompt += "\nRemember to return a JSON array of 10 items with the specified properties, and ensure the properties use camelCase (e.g., 'equipSlot', 'armorClass', 'flavorText', etc.).";
    
    return prompt
  }
  
  // Handle the generation of items using ChatGPT
  const handleGenerate = async () => {
    try {
      setGenerating(true)
      setGeneratedItems([])
      
      const prompt = generatePrompt()
      
      // Make a request to the ChatGPT API to generate items
      const data = await generateItems(prompt, itemCategory, equipmentSlot)
      
      // Format and set the generated items
      setGeneratedItems(
        data.items.map((item: any) => ({
          ...item,
          categories: [itemCategory, ...(item.categories || [])],
          selected: true, // Select all items by default
        }))
      )
    } catch (error) {
      console.error("Error generating items:", error)
      toast({
        title: "Error",
        description: "Failed to generate items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }
  
  // Handle saving the selected items to the database
  const handleSaveItems = async () => {
    try {
      setSaving(true)
      
      const selectedItems = generatedItems.filter(item => item.selected)
      
      if (selectedItems.length === 0) {
        toast({
          title: "No items selected",
          description: "Please select at least one item to save.",
          variant: "destructive",
        })
        return
      }
      
      // Remove the selected property before saving
      const itemsToSave = selectedItems.map(({ selected, ...item }) => item)
      
      // Save the items to the database
      await createItems(itemsToSave)
      
      toast({
        title: "Success",
        description: `${selectedItems.length} items have been added to your collection.`,
      })
      
      // Navigate back to the items page
      router.push("/items")
    } catch (error) {
      console.error("Error saving items:", error)
      toast({
        title: "Error",
        description: "Failed to save items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }
  
  // Toggle the selection of an item
  const toggleItemSelection = (index: number) => {
    setGeneratedItems(prevItems => {
      const updatedItems = [...prevItems]
      updatedItems[index] = { ...updatedItems[index], selected: !updatedItems[index].selected }
      return updatedItems
    })
  }
  
  // Count how many items are selected
  const selectedItemsCount = generatedItems.filter(item => item.selected).length
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/items">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Generate Items with AI</h1>
      </div>
      
      {/* Item generation form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Item Generator</CardTitle>
          <CardDescription>Configure the type of items you want to generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Item Category</Label>
                <Select value={itemCategory} onValueChange={setItemCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ITEM_CATEGORIES).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {itemCategory === ITEM_CATEGORIES.ARMOR && (
                <div className="space-y-2">
                  <Label htmlFor="slot">Equipment Slot (Optional)</Label>
                  <Select value={equipmentSlot} onValueChange={(value) => setEquipmentSlot(value as EquipSlot | "")}>
                    <SelectTrigger id="slot">
                      <SelectValue placeholder="Select equipment slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Slot</SelectItem>
                      {Object.entries(EQUIPMENT_SLOTS).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key.charAt(0) + key.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt">Custom Requirements (Optional)</Label>
              <Textarea
                id="prompt"
                placeholder="Add any specific requirements or themes for the items..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerate} 
            disabled={generating || loading}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Items
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Generated items list */}
      {generatedItems.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Generated Items</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedItemsCount} of {generatedItems.length} selected
              </span>
              <Button 
                onClick={handleSaveItems} 
                disabled={selectedItemsCount === 0 || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Selected Items"
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedItems.map((item, index) => (
              <Card 
                key={index} 
                className={`overflow-hidden border ${
                  item.selected ? "border-primary border-2" : "border-border/50"
                } bg-card/80 backdrop-blur-sm relative`}
              >
                <div className="absolute top-2 right-2">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItemSelection(index)}
                    className="h-5 w-5 border-2"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription className="italic">"{item.flavorText}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.categories?.map((category: string) => (
                      <Badge key={category} variant="outline" className="bg-secondary/50">
                        {category}
                      </Badge>
                    ))}
                    {item.equipSlot && (
                      <Badge variant="default" className="bg-blue-600">
                        {item.equipSlot}
                      </Badge>
                    )}
                  </div>
                  {item.damage && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <strong className="mr-2">Damage:</strong> {item.damage}
                    </div>
                  )}
                  {item.value && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <strong className="mr-2">Value:</strong> {item.value} gold
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}