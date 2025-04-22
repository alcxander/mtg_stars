"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { fetchSets } from "@/lib/actions"
import Image from "next/image"
import { Filter } from "lucide-react"

interface SetSelectorProps {
  onSetSelected: (set: string | null) => void
  currentSet: string | null
}

export default function SetSelector({ onSetSelected, currentSet }: SetSelectorProps) {
  const [sets, setSets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const loadSets = async () => {
      try {
        const setsData = await fetchSets()
        setSets(setsData)
      } catch (error) {
        console.error("Failed to load sets:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSets()
  }, [])

  const filteredSets = sets.filter(
    (set) =>
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSetSelect = (setCode: string) => {
    onSetSelected(setCode)
    setOpen(false)
  }

  const handleClearFilter = () => {
    onSetSelected(null)
    setOpen(false)
  }

  // Find current set name
  const currentSetName = currentSet ? sets.find((set) => set.code === currentSet)?.name || currentSet : "All Sets"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="max-w-[150px] truncate">{currentSetName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Set</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            placeholder="Search sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {loading ? (
            <div className="flex justify-center py-4">Loading sets...</div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start text-left mb-2 font-normal"
                onClick={handleClearFilter}
              >
                Show All Sets (No Filter)
              </Button>

              <ScrollArea className="h-[50vh]">
                <div className="space-y-1">
                  {filteredSets.map((set) => (
                    <Button
                      key={set.code}
                      variant="ghost"
                      className={`w-full justify-start text-left ${currentSet === set.code ? "bg-muted" : ""}`}
                      onClick={() => handleSetSelect(set.code)}
                    >
                      <div className="flex items-center gap-3">
                        {set.icon_svg_uri ? (
                          <div className="relative h-8 w-8 flex-shrink-0 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                            <Image
                              src={set.icon_svg_uri || "/placeholder.svg"}
                              alt={set.name}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 flex-shrink-0 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                            {set.code.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{set.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {set.code.toUpperCase()} • {set.card_count} cards
                          </span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
