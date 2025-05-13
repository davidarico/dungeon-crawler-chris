"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Coins } from "lucide-react"
import { useState } from "react"

interface CreditCardProps {
  crawlerCredit: number
  editable?: boolean
  onCrawlerCreditChange?: (crawlerCredit: number) => void
}

export function CreditCard({ crawlerCredit, editable = false, onCrawlerCreditChange }: CreditCardProps) {
  const [creditInput, setCreditInput] = useState(crawlerCredit.toString())
  const [creditChange, setCreditChange] = useState(0)

  const handleSave = () => {
    const newCredit = Number.parseInt(creditInput) || 0
    if (onCrawlerCreditChange) {
      onCrawlerCreditChange(newCredit)
    }
  }

  const handleCreditChange = (amount: number) => {
    const newCredit = Math.max(0, crawlerCredit + amount)
    if (onCrawlerCreditChange) {
      onCrawlerCreditChange(newCredit)
    }
    setCreditChange(0)
  }

  return (
    <Card className="overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Crawler Credit
        </CardTitle>
        <CardDescription>Currency for purchases and bribes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editable ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                value={creditInput}
                onChange={(e) => setCreditInput(e.target.value)}
                className="text-center"
              />
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-yellow-500">{crawlerCredit} CC</div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={creditChange}
                onChange={(e) => {
                  const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value)
                  setCreditChange(isNaN(value) ? 0 : value)
                }}
                className="text-center"
                placeholder="Amount"
              />
              <Button variant="outline" onClick={() => handleCreditChange(creditChange)}>
                Add
              </Button>
              <Button variant="outline" onClick={() => handleCreditChange(-creditChange)}>
                Spend
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}