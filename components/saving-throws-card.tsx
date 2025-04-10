"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface SavingThrowsCardProps {
  fortitude: number
  reflex: number
  willpower: number
  editable?: boolean
  onSavingThrowChange?: (type: "fortitude" | "reflex" | "willpower", value: number) => void
}

export function SavingThrowsCard({
  fortitude,
  reflex,
  willpower,
  editable = false,
  onSavingThrowChange,
}: SavingThrowsCardProps) {
  const formatModifier = (value: number) => (value >= 0 ? `+${value}` : `${value}`)

  return (
    <Card className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Saving Throws</CardTitle>
        <CardDescription>Resist effects and dangers</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium">Fortitude</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resistance to physical danger: poisons, acids, suffocation. Modified by Stamina.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {editable ? (
            <input
              type="number"
              value={fortitude}
              onChange={(e) =>
                onSavingThrowChange && onSavingThrowChange("fortitude", Number.parseInt(e.target.value) || 0)
              }
              className="w-12 h-8 text-center bg-background border border-input rounded-md"
            />
          ) : (
            <span
              className={`text-lg font-bold px-2 py-1 rounded-md ${
                fortitude > 0
                  ? "bg-green-500/20 text-green-400"
                  : fortitude < 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-secondary/20 text-muted-foreground"
              }`}
            >
              {formatModifier(fortitude)}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium">Reflex</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dodging sudden threats: traps, falling debris, energy blasts. Modified by Agility.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {editable ? (
            <input
              type="number"
              value={reflex}
              onChange={(e) =>
                onSavingThrowChange && onSavingThrowChange("reflex", Number.parseInt(e.target.value) || 0)
              }
              className="w-12 h-8 text-center bg-background border border-input rounded-md"
            />
          ) : (
            <span
              className={`text-lg font-bold px-2 py-1 rounded-md ${
                reflex > 0
                  ? "bg-green-500/20 text-green-400"
                  : reflex < 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-secondary/20 text-muted-foreground"
              }`}
            >
              {formatModifier(reflex)}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium">Willpower</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mental toughness: resisting charms, mind control, psychic effects. Modified by Personality.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {editable ? (
            <input
              type="number"
              value={willpower}
              onChange={(e) =>
                onSavingThrowChange && onSavingThrowChange("willpower", Number.parseInt(e.target.value) || 0)
              }
              className="w-12 h-8 text-center bg-background border border-input rounded-md"
            />
          ) : (
            <span
              className={`text-lg font-bold px-2 py-1 rounded-md ${
                willpower > 0
                  ? "bg-green-500/20 text-green-400"
                  : willpower < 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-secondary/20 text-muted-foreground"
              }`}
            >
              {formatModifier(willpower)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
