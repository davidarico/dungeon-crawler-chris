import type { Item } from "@/lib/types"

interface WeaponDetailsProps {
  item: Item
}

export function WeaponDetails({ item }: WeaponDetailsProps) {
  if (!item.damage) return null

  const formatRange = () => {
    if (!item.range) return "—"

    const ranges = []
    if (item.range.short) ranges.push(item.range.short)
    if (item.range.medium) ranges.push(item.range.medium)
    if (item.range.long) ranges.push(item.range.long)

    return ranges.length > 0 ? ranges.join("/") : "—"
  }

  return (
    <div className="mt-2 border-t border-border pt-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Damage:</span> <span className="font-medium">{item.damage}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Range:</span> <span className="font-medium">{formatRange()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Cost:</span>{" "}
          <span className="font-medium">{item.cost ? `${item.cost} GP` : "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Special:</span>{" "}
          <span className="font-medium">{item.special?.join(", ") || "—"}</span>
        </div>
      </div>
    </div>
  )
}
