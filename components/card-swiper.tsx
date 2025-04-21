"use client"

import { useState, useEffect } from "react"
import { motion, useAnimation, type PanInfo } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, BarChart2, SkipForward } from "lucide-react"
import Image from "next/image"
import { fetchRandomCard, rateCard } from "@/lib/actions"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import LoadingCard from "./loading-card"
import SetSelector from "./set-selector"

export default function CardSwiper() {
  const [card, setCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const controls = useAnimation()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [selectedSet, setSelectedSet] = useState<string | null>(null)

  // Load a new card when component mounts or when selectedSet changes
  useEffect(() => {
    loadNewCard()
  }, [selectedSet])

  const loadNewCard = async () => {
    setLoading(true)
    try {
      const newCard = await fetchRandomCard(selectedSet)
      setCard(newCard)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load a new card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    const direction = info.offset.x > 0 ? "right" : "left"
    const distance = Math.abs(info.offset.x)

    if (distance > threshold) {
      // Animate the card off-screen
      await controls.start({
        x: direction === "right" ? 1000 : -1000,
        opacity: 0,
        transition: { duration: 0.5 },
      })

      // Handle the like/dislike action
      const liked = direction === "right"
      if (card) {
        try {
          await rateCard(card.id, liked)
          toast({
            title: liked ? "Card Liked!" : "Card Disliked",
            description: `You ${liked ? "liked" : "disliked"} ${card.name}`,
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to save your preference",
            variant: "destructive",
          })
        }
      }

      // Load a new card
      await loadNewCard()

      // Reset the card position
      controls.set({ x: 0, opacity: 1 })
    } else {
      // If not dragged far enough, animate back to center
      controls.start({ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } })
    }
  }

  const handleButtonAction = async (liked: boolean | null) => {
    // Animate the card off-screen
    await controls.start({
      x: liked === true ? 1000 : liked === false ? -1000 : 0,
      y: liked === null ? -1000 : 0,
      opacity: 0,
      transition: { duration: 0.5 },
    })

    // Handle the like/dislike action (skip doesn't record a preference)
    if (card && liked !== null) {
      try {
        await rateCard(card.id, liked)
        toast({
          title: liked ? "Card Liked!" : "Card Disliked",
          description: `You ${liked ? "liked" : "disliked"} ${card.name}`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save your preference",
          variant: "destructive",
        })
      }
    } else if (liked === null) {
      toast({
        title: "Card Skipped",
        description: "Moving to the next card",
      })
    }

    // Load a new card
    await loadNewCard()

    // Reset the card position
    controls.set({ x: 0, y: 0, opacity: 1 })
  }

  const handleSetSelected = (setCode: string | null) => {
    setSelectedSet(setCode)
  }

  if (loading) {
    return <LoadingCard />
  }

  if (!card) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">No cards available. Please try again later.</p>
        <Button onClick={loadNewCard}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <SetSelector onSetSelected={handleSetSelected} currentSet={selectedSet} />
        <Link href="/stats">
          <Button variant="outline" size="sm">
            <BarChart2 className="mr-2 h-4 w-4" />
            View Stats
          </Button>
        </Link>
      </div>
      <div className="relative w-full max-w-md h-[500px] mb-8">
        <motion.div
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="absolute w-full h-full"
          whileDrag={{ scale: 1.05 }}
        >
          <Card className="w-full h-full overflow-hidden shadow-xl">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="relative flex-grow">
                <Image
                  src={card.image_url || "/placeholder.svg"}
                  alt={card.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="p-4 bg-black/80 text-white">
                <h2 className="text-xl font-bold">{card.name}</h2>
                <p className="text-sm opacity-80">{card.type_line}</p>
                {card.mana_cost && <p className="text-sm mt-1">Mana Cost: {card.mana_cost}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-center gap-6 mb-8">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full h-16 w-16 bg-red-100 hover:bg-red-200 border-red-300"
          onClick={() => handleButtonAction(false)}
        >
          <ThumbsDown className="h-8 w-8 text-red-500" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="rounded-full h-16 w-16 bg-gray-100 hover:bg-gray-200 border-gray-300"
          onClick={() => handleButtonAction(null)}
        >
          <SkipForward className="h-8 w-8 text-gray-500" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="rounded-full h-16 w-16 bg-green-100 hover:bg-green-200 border-green-300"
          onClick={() => handleButtonAction(true)}
        >
          <ThumbsUp className="h-8 w-8 text-green-500" />
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {isMobile ? "Swipe left to dislike, right to like" : "Click the buttons to rate cards"}
        </p>
      </div>
    </div>
  )
}
