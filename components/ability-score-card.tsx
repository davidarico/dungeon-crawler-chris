"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getAbilityModifier } from "@/lib/mock-data"
import { Info } from "lucide-react"

interface AbilityScoreCardProps {
  name: string
  score: number
  description: string
  editable?: boolean
  onScoreChange?: (newScore: number) => void
}

export function AbilityScoreCard({ name, score, description, editable = false, onScoreChange }: AbilityScoreCardProps) {
  const modifier = getAbilityModifier(score)
  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`

  return (
    <Card className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg flex items-center gap-1">
            {name}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {editable ? (
            <input
              type="number"
              value={score}
              onChange={(e) => onScoreChange && onScoreChange(Number.parseInt(e.target.value) || 0)}
              className="w-12 h-8 text-center bg-background border border-input rounded-md"
              min="1"
              max="50"
            />
          ) : (
            <span className="text-xl font-bold">{score}</span>
          )}
          <span
            className={`text-sm font-semibold px-2 py-1 rounded-md ${
              modifier > 0
                ? "bg-green-500/20 text-green-400"
                : modifier < 0
                  ? "bg-red-500/20 text-red-400"
                  : "bg-secondary/20 text-muted-foreground"
            }`}
          >
            {modifierText}
          </span>
        </div>
      </CardHeader>
    </Card>
  )
}
