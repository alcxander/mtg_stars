"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FlipVerticalIcon as Flip } from "lucide-react"

interface DualFacedCardProps {
  frontImage: string
  backImage: string
  frontName: string
  backName: string
}

export default function DualFacedCard({ frontImage, backImage, frontName, backName }: DualFacedCardProps) {
  const [showFront, setShowFront] = useState(true)

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full w-8 h-8 p-0 bg-black/50 hover:bg-black/70"
          onClick={() => setShowFront(!showFront)}
          aria-label={showFront ? `Show back: ${backName}` : `Show front: ${frontName}`}
        >
          <Flip className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="relative w-full h-full transition-opacity duration-300"
        style={{ opacity: showFront ? 1 : 0, position: showFront ? "relative" : "absolute" }}
      >
        <Image src={frontImage || "/placeholder.svg"} alt={frontName} fill className="object-contain" priority />
      </div>

      <div
        className="relative w-full h-full transition-opacity duration-300"
        style={{ opacity: showFront ? 0 : 1, position: showFront ? "absolute" : "relative" }}
      >
        <Image
          src={backImage || "/placeholder.svg"}
          alt={backName}
          fill
          className="object-contain"
          priority={!showFront}
        />
      </div>
    </div>
  )
}
