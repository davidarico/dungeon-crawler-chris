"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Coins } from "lucide-react"
import { useState } from "react"

interface GoldCardProps {
  gold: number
  editable?: boolean
  onGoldChange?: (gold: number) => void
}

export function GoldCard({ gold, editable = false, onGoldChange }: GoldCardProps) {
  const [goldInput, setGoldInput] = useState(gold.toString())
  const [goldChange, setGoldChange] = useState(0)

  const handleSave = () => {
    const newGold = Number.parseInt(goldInput) || 0
    if (onGoldChange) {
      onGoldChange(newGold)
    }
  }

  const handleGoldChange = (amount: number) => {
    const newGold = Math.max(0, gold + amount)
    if (onGoldChange) {
      onGoldChange(newGold)
    }
    setGoldChange(0)
  }

  return (
    <Card className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Gold
        </CardTitle>
        <CardDescription>Currency for purchases and bribes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editable ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                value={goldInput}
                onChange={(e) => setGoldInput(e.target.value)}
                className="text-center"
              />
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-yellow-500">{gold} GP</div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={goldChange}
                onChange={(e) => {
                  const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value)
                  setGoldChange(isNaN(value) ? 0 : value)
                }}
                className="text-center"
                placeholder="Amount"
              />
              <Button variant="outline" onClick={() => handleGoldChange(goldChange)}>
                Add
              </Button>
              <Button variant="outline" onClick={() => handleGoldChange(-goldChange)}>
                Spend
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
