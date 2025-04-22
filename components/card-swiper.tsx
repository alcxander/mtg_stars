"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, useAnimation, type PanInfo, useMotionValue, useTransform } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, BarChart2, SkipForward, Award } from "lucide-react"
import Image from "next/image"
import { fetchRandomCards, rateCard } from "@/lib/actions"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import LoadingCard from "./loading-card"
import SetSelector from "./set-selector"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import KeywordBadge from "./keyword-badge"
import DualFacedCard from "./dual-faced-card"

export default function CardSwiper() {
  const [card, setCard] = useState<any>(null)
  const [nextCard, setNextCard] = useState<any>(null)
  const [cardQueue, setCardQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const controls = useAnimation()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [selectedSet, setSelectedSet] = useState<string | null>(null)
  const [showAllFormatsButton, setShowAllFormatsButton] = useState(false)
  const prefetchingRef = useRef(false)
  const [nextCardVisible, setNextCardVisible] = useState(false)
  const [cardFaces, setCardFaces] = useState<any[] | null>(null)
  const [isUnmounted, setIsUnmounted] = useState(false)
  const [cardKeywords, setCardKeywords] = useState<string[]>([])

  // Motion values for tracking swipe progress
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Calculate opacity for the next card based on swipe distance
  const nextCardOpacity = useTransform([x, y], ([latestX, latestY]) => {
    const maxDistance = 200
    const distance = Math.max(Math.abs(latestX), Math.abs(latestY))
    return Math.min(distance / maxDistance, 1)
  })

  // Set isUnmounted to true when component unmounts
  useEffect(() => {
    return () => {
      setIsUnmounted(true)
    }
  }, [])
  

  // Safe state update function to prevent updates on unmounted component
  const safeSetState = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
      if (!isUnmounted) {
        setter(value)
      }
    },
    [isUnmounted],
  )

  // Process card data to extract card faces and keywords if present
  const processCardData = useCallback(
    (cardData: any) => {
      // Process card faces
      if (cardData?.card_faces && typeof cardData.card_faces === "string") {
        try {
          const faces = JSON.parse(cardData.card_faces)
          if (faces && Array.isArray(faces) && faces.length > 1) {
            safeSetState(setCardFaces, faces)
          } else {
            safeSetState(setCardFaces, null)
          }
        } catch (e) {
          console.error("Error parsing card faces:", e)
          safeSetState(setCardFaces, null)
        }
      } else {
        safeSetState(setCardFaces, null)
      }

      // Process keywords
      if (cardData?.keywords) {
        try {
          let keywords = cardData.keywords

          // If keywords is a string, try to parse it as JSON
          if (typeof keywords === "string") {
            try {
              keywords = JSON.parse(keywords)
            } catch (e) {
              console.error("Error parsing keywords string:", e)
              keywords = []
            }
          }

          // Ensure keywords is an array
          if (Array.isArray(keywords)) {
            safeSetState(setCardKeywords, keywords)
          } else {
            safeSetState(setCardKeywords, [])
          }
        } catch (e) {
          console.error("Error processing keywords:", e)
          safeSetState(setCardKeywords, [])
        }
      } else {
        safeSetState(setCardKeywords, [])
      }
    },
    [safeSetState],
  )

  // Load initial cards when component mounts or when selectedSet changes
  useEffect(() => {
    console.log("load cards")
    loadInitialCards()
    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log("return 124")
      setIsUnmounted(true)
    }
  }, [selectedSet])

  // Monitor the card queue and prefetch more cards when needed
  useEffect(() => {
    if (cardQueue.length < 3 && !prefetchingRef.current && !isUnmounted) {
      prefetchMoreCards()
    }
  }, [cardQueue, isUnmounted])

  // Update the next card whenever the card queue changes
  useEffect(() => {
    if (cardQueue.length > 0 && !isUnmounted) {
      safeSetState(setNextCard, cardQueue[0])
      safeSetState(setNextCardVisible, true)
    } else if (!isUnmounted) {
      safeSetState(setNextCard, null)
      safeSetState(setNextCardVisible, false)
    }
  }, [cardQueue, isUnmounted, safeSetState])

  // Process card data when card changes
  useEffect(() => {
    if (card) {
      processCardData(card)
    }
  }, [card, processCardData])

  const loadInitialCards = async () => {
    if (isUnmounted) return

    safeSetState(setLoading, true)
    safeSetState(setCardQueue, [])

    try {
      const cards = await fetchRandomCards(selectedSet, 5)
      console.log("all cards fetched")
      if (!isUnmounted) {
        console.log("!isUnmounted is true")
        if (cards && cards.length > 0) {
          safeSetState(setCard, cards[0])
          safeSetState(setCardQueue, cards.slice(1))
        } else {
          safeSetState(setCard, null)
        }
      }
    } catch (error) {
      if (!isUnmounted) {
        toast({
          title: "Error",
          description: "Failed to load cards. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      console.log("finally 1")
      if (!isUnmounted) {
        safeSetState(setLoading, false)
      }
    }
  }

  const prefetchMoreCards = async () => {
    if (prefetchingRef.current || isUnmounted) return

    prefetchingRef.current = true
    if (!isUnmounted) {
      safeSetState(setFetchingMore, true)
    }

    try {
      const newCards = await fetchRandomCards(selectedSet, 5)
      if (!isUnmounted && newCards && newCards.length > 0) {
        safeSetState(setCardQueue, (prev) => [...prev, ...newCards])
      }
    } catch (error) {
      console.error("Error prefetching cards:", error)
    } finally {
      if (!isUnmounted) {
        safeSetState(setFetchingMore, false)
        prefetchingRef.current = false
      }
    }
  }

  const loadNextCard = () => {
    if (isUnmounted) return false

    if (cardQueue.length > 0) {
      safeSetState(setCard, cardQueue[0])
      safeSetState(setCardQueue, (prev) => prev.slice(1))
      safeSetState(setShowAllFormatsButton, false)
      return true
    }
    return false
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isUnmounted) return

    // Update motion values during drag for both mobile and desktop
    x.set(info.offset.x)
    y.set(info.offset.y)
  }

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isUnmounted) return

    const thresholdX = 100
    const thresholdY = 100
    const directionX = info.offset.x > 0 ? "right" : "left"
    const directionY = info.offset.y > 0 ? "down" : "up"
    const distanceX = Math.abs(info.offset.x)
    const distanceY = Math.abs(info.offset.y)

    // Handle horizontal swipe (like/dislike)
    if (distanceX > thresholdX && distanceX > distanceY) {
      const liked = directionX === "right"
      await handleCardAction(liked, false)
    }
    // Handle vertical swipe down (like in all formats)
    else if (directionY > thresholdY && directionY > distanceX && directionY === "down") {
      await handleCardAction(true, true)
    }
    // If not dragged far enough, animate back to center
    else {
      controls.start({ x: 0, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } })
      // Reset motion values
      x.set(0)
      y.set(0)
    }
  }

  const handleCardAction = async (liked: boolean | null, allFormats = false) => {
    if (isUnmounted) return

    // Determine animation direction
    let animationProps = {}
    if (liked === true && !allFormats) {
      animationProps = { x: 1000, opacity: 0 }
    } else if (liked === false) {
      animationProps = { x: -1000, opacity: 0 }
    } else if (liked === null) {
      animationProps = { y: -1000, opacity: 0 }
    } else if (liked === true && allFormats) {
      animationProps = { y: 1000, opacity: 0 }
    }

    // Update motion values for desktop (for the next card effect)
    if (liked === true && !allFormats) {
      x.set(1000)
    } else if (liked === false) {
      x.set(-1000)
    } else if (liked === null) {
      y.set(-1000)
    } else if (liked === true && allFormats) {
      y.set(1000)
    }

    // Animate the card off-screen
    await controls.start({
      ...animationProps,
      transition: { duration: 0.5 },
    })

    if (isUnmounted) return

    // Handle the rating action
    if (card && liked !== null) {
      try {
        await rateCard(card.id, liked, allFormats)

        if (!isUnmounted) {
          let toastMessage = ""
          if (liked && allFormats) {
            toastMessage = `You liked ${card.name} in all formats!`
          } else if (liked) {
            toastMessage = `You liked ${card.name}`
          } else {
            toastMessage = `You disliked ${card.name}`
          }

          toast({
            title: liked ? (allFormats ? "Card Liked in All Formats!" : "Card Liked!") : "Card Disliked",
            description: toastMessage,
          })
        }
      } catch (error) {
        if (!isUnmounted) {
          toast({
            title: "Error",
            description: "Failed to save your preference",
            variant: "destructive",
          })
        }
      }
    } else if (liked === null && !isUnmounted) {
      toast({
        title: "Card Skipped",
        description: "Moving to the next card",
      })
    }

    if (isUnmounted) return

    // Load the next card from the queue
    const loaded = loadNextCard()

    if (!loaded && !isUnmounted) {
      // If queue is empty, show loading state and fetch more
      safeSetState(setLoading, true)
      try {
        const newCards = await fetchRandomCards(selectedSet, 5)
        if (!isUnmounted) {
          if (newCards && newCards.length > 0) {
            safeSetState(setCard, newCards[0])
            safeSetState(setCardQueue, newCards.slice(1))
          } else {
            safeSetState(setCard, null)
          }
        }
      } catch (error) {
        if (!isUnmounted) {
          toast({
            title: "Error",
            description: "Failed to load more cards",
            variant: "destructive",
          })
        }
      } finally {
        if (!isUnmounted) {
          safeSetState(setLoading, false)
        }
      }
    }

    if (!isUnmounted) {
      // Reset the card position and motion values
      controls.set({ x: 0, y: 0, opacity: 1 })
      x.set(0)
      y.set(0)
    }
  }

  const handleSetSelected = (setCode: string | null) => {
    if (!isUnmounted) {
      safeSetState(setSelectedSet, setCode)
    }
  }

  if (loading) {
    return <LoadingCard />
  }

  if (!card) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">No cards available. Please try again later.</p>
        <Button onClick={loadInitialCards}>Retry</Button>
      </div>
    )
  }

  // Parse card faces if they exist
  let frontFace = null
  let backFace = null

  if (card.card_faces && typeof card.card_faces === "string") {
    try {
      const faces = JSON.parse(card.card_faces)
      if (faces && Array.isArray(faces) && faces.length > 1) {
        frontFace = faces[0]
        backFace = faces[1]
      }
    } catch (e) {
      console.error("Error parsing card faces:", e)
    }
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
        {/* Next card (shown behind current card) */}
        {nextCard && nextCardVisible && (
          <motion.div
            className="absolute w-full h-full"
            style={{
              zIndex: 1,
              opacity: nextCardOpacity,
              scale: 0.95,
              y: 10,
            }}
          >
            <Card className="w-full h-full overflow-hidden shadow-lg">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="relative flex-grow">
                  <Image
                    src={nextCard.image_url || "/placeholder.svg"}
                    alt={nextCard.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="p-4 bg-black/80 text-white">
                  <h2 className="text-xl font-bold">{nextCard.name}</h2>
                  <p className="text-sm opacity-80">{nextCard.type_line}</p>
                  {nextCard.mana_cost && <p className="text-sm mt-1">Mana Cost: {nextCard.mana_cost}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Current card (top card) */}
        <motion.div
          drag={true} // Enable drag for both mobile and desktop
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="absolute w-full h-full"
          whileDrag={{ scale: 1.05 }}
          style={{
            x,
            y,
            zIndex: 2,
          }}
        >
          <Card className="w-full h-full overflow-hidden shadow-xl">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="relative flex-grow">
                {frontFace && backFace ? (
                  <DualFacedCard
                    frontImage={
                      frontFace.image_uris?.normal || frontFace.image_uris?.large || frontFace.image_uris?.png || ""
                    }
                    backImage={
                      backFace.image_uris?.normal || backFace.image_uris?.large || backFace.image_uris?.png || ""
                    }
                    frontName={frontFace.name}
                    backName={backFace.name}
                  />
                ) : (
                  <Image
                    src={card.image_url || "/placeholder.svg"}
                    alt={card.name}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
              <div className="p-4 bg-black/80 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{card.name}</h2>
                    <p className="text-sm opacity-80">{card.type_line}</p>
                    {card.mana_cost && <p className="text-sm mt-1">Mana Cost: {card.mana_cost}</p>}
                  </div>

                  {cardKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end max-w-[50%] ml-2">
                      {cardKeywords.map((keyword: string) => (
                        <KeywordBadge key={keyword} keyword={keyword} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-16 w-16 bg-red-100 hover:bg-red-200 border-red-300"
                onClick={() => handleCardAction(false)}
              >
                <ThumbsDown className="h-8 w-8 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dislike this card</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-16 w-16 bg-gray-100 hover:bg-gray-200 border-gray-300"
                onClick={() => handleCardAction(null)}
              >
                <SkipForward className="h-8 w-8 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Skip this card</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-16 w-16 bg-green-100 hover:bg-green-200 border-green-300"
                onClick={() => {
                  if (showAllFormatsButton) {
                    handleCardAction(true, true)
                  } else {
                    handleCardAction(true)
                    setShowAllFormatsButton(true)
                  }
                }}
              >
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Like this card</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showAllFormatsButton && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-16 w-16 bg-purple-100 hover:bg-purple-200 border-purple-300 animate-pulse"
                  onClick={() => handleCardAction(true, true)}
                >
                  <Award className="h-8 w-8 text-purple-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Like in all formats (EDH, Draft, Constructed)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {isMobile
            ? "Swipe left to dislike, right to like, down for all formats"
            : "Drag cards or use the buttons to rate"}
        </p>
        {fetchingMore && <p className="text-xs text-muted-foreground">Loading more cards...</p>}
      </div>
    </div>
  )
}
