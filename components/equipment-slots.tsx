import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ShieldIcon, Sword, Package } from "lucide-react"
import { Item } from "@/lib/types"

// Adjust EquipSlot type to exclude null
type EquipSlot = "head" | "neck" | "chest" | "hands" | "ring" | "legs" | "feet" | "weapon" | "shield";

interface EquipmentSlotsProps {
  playerId: string
  equippedItems: Record<EquipSlot, Item | null>
  inventoryItems: Item[]
  onEquip: (slot: EquipSlot, item: Item) => Promise<void>
  onUnequip: (slot: EquipSlot) => Promise<void>
}

export function EquipmentSlots({ 
  playerId, 
  equippedItems, 
  inventoryItems,
  onEquip,
  onUnequip 
}: EquipmentSlotsProps) {
  const [activeSlot, setActiveSlot] = useState<EquipSlot | null>(null)
  const [isEquipDialogOpen, setIsEquipDialogOpen] = useState(false)

  const handleSlotClick = (slot: EquipSlot) => {
    setActiveSlot(slot)
    setIsEquipDialogOpen(true)
  }

  const handleEquip = async (item: Item) => {
    if (!activeSlot) return
    
    await onEquip(activeSlot, item)
    setIsEquipDialogOpen(false)
  }

  const handleUnequip = async () => {
    if (!activeSlot) return
    
    await onUnequip(activeSlot)
    setIsEquipDialogOpen(false)
  }

  // Filter inventory items that can be equipped in the active slot
  const compatibleItems = inventoryItems.filter(item => {
    if (!activeSlot) return false
    return item.equip_slot === activeSlot
  })

  const getSlotIcon = (slot: EquipSlot, item: Item | null) => {
    if (item) {
      return (
        <div className="relative h-10 w-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-secondary/30 rounded-md"></div>
          {item.categories?.includes("Weapon") ? (
            <Sword className="h-6 w-6" />
          ) : item.categories?.includes("Shield") ? (
            <ShieldIcon className="h-6 w-6" />
          ) : (
            <Package className="h-6 w-6" />
          )}
        </div>
      )
    }

    return (
      <div className="h-10 w-10 border-2 border-dashed border-muted-foreground/50 rounded-md flex items-center justify-center">
        {slot === "weapon" && <Sword className="h-5 w-5 text-muted-foreground/70" />}
        {slot === "shield" && <ShieldIcon className="h-5 w-5 text-muted-foreground/70" />}
        {!["weapon", "shield"].includes(slot as string) && (
          <span className="text-xs text-muted-foreground/70">{slot}</span>
        )}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Character silhouette with equipment slots */}
            <div className="relative w-[280px] h-[400px] mb-4">
              {/* Silhouette background */}
              <div className="absolute inset-0 bg-muted/30 rounded-md mx-auto w-[180px]"></div>
              
              {/* Head slot */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 top-[20px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("head")}
              >
                {getSlotIcon("head", equippedItems.head)}
              </div>
              
              {/* Neck slot */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 top-[80px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("neck")}
              >
                {getSlotIcon("neck", equippedItems.neck)}
              </div>
              
              {/* Chest slot */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 top-[140px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("chest")}
              >
                {getSlotIcon("chest", equippedItems.chest)}
              </div>
              
              {/* Hands slot */}
              <div 
                className="absolute left-[40px] top-[160px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("hands")}
              >
                {getSlotIcon("hands", equippedItems.hands)}
              </div>
              
              {/* Ring slot */}
              <div 
                className="absolute right-[40px] top-[160px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("ring")}
              >
                {getSlotIcon("ring", equippedItems.ring)}
              </div>
              
              {/* Legs slot */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 top-[220px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("legs")}
              >
                {getSlotIcon("legs", equippedItems.legs)}
              </div>
              
              {/* Feet slot */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 top-[320px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("feet")}
              >
                {getSlotIcon("feet", equippedItems.feet)}
              </div>
              
              {/* Weapon slot (left hand) */}
              <div 
                className="absolute left-[0px] top-[220px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("weapon")}
              >
                {getSlotIcon("weapon", equippedItems.weapon)}
              </div>
              
              {/* Shield slot (right hand) */}
              <div 
                className="absolute right-[0px] top-[220px] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleSlotClick("shield")}
              >
                {getSlotIcon("shield", equippedItems.shield)}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground text-center">
              Click on a slot to equip or unequip items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equip Item Dialog */}
      <Dialog open={isEquipDialogOpen} onOpenChange={setIsEquipDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle>{activeSlot ? `${activeSlot.charAt(0).toUpperCase() + activeSlot.slice(1)} Slot` : "Equipment"}</DialogTitle>
            <DialogDescription>
              {equippedItems[activeSlot as EquipSlot] 
                ? "Currently equipped item:" 
                : `Select an item to equip in your ${activeSlot} slot`}
            </DialogDescription>
          </DialogHeader>
          
          {/* Currently equipped item */}
          {activeSlot && equippedItems[activeSlot] && (
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-medium mb-1">{equippedItems[activeSlot]?.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{equippedItems[activeSlot]?.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {equippedItems[activeSlot]?.categories?.map((category: string) => (
                  <Badge key={category} variant="outline" className="bg-secondary/50">
                    {category}
                  </Badge>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleUnequip}
              >
                Unequip
              </Button>
            </div>
          )}
          
          {/* Available items to equip */}
          {activeSlot && compatibleItems.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              <h4 className="text-sm font-medium mb-2">Available Items:</h4>
              {compatibleItems.map(item => (
                <div key={item.id} className="border rounded-md p-3 hover:bg-secondary/10">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.categories.map(category => (
                      <Badge key={category} variant="outline" className="bg-secondary/50">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => handleEquip(item)}
                  >
                    Equip
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            !equippedItems[activeSlot as EquipSlot] && (
              <div className="py-6 text-center text-muted-foreground">
                No compatible items found for this slot.
              </div>
            )
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEquipDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}