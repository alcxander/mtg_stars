import { getTopCards } from "@/lib/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ThumbsDown, ThumbsUp, Award } from "lucide-react"

export default async function StatsPage() {
  const { mostLiked, mostDisliked, mostAllFormats } = await getTopCards()

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Swiper
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Card Stats</h1>
        </div>

        <Tabs defaultValue="liked" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="liked">Most Liked</TabsTrigger>
            <TabsTrigger value="disliked">Most Disliked</TabsTrigger>
            <TabsTrigger value="all-formats">All Formats</TabsTrigger>
          </TabsList>

          <TabsContent value="liked">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ThumbsUp className="mr-2 h-5 w-5 text-green-500" />
                  Most Liked Cards
                </CardTitle>
                <CardDescription>Cards with the most right swipes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostLiked.length > 0 ? (
                    mostLiked.map((card) => (
                      <div key={card.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                        <div className="relative h-16 w-12 overflow-hidden rounded-md">
                          <Image
                            src={card.image_url || "/placeholder.svg"}
                            alt={card.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{card.name}</h3>
                          <p className="text-sm text-muted-foreground">{card.likes_count} likes</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No liked cards yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disliked">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ThumbsDown className="mr-2 h-5 w-5 text-red-500" />
                  Most Disliked Cards
                </CardTitle>
                <CardDescription>Cards with the most left swipes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostDisliked.length > 0 ? (
                    mostDisliked.map((card) => (
                      <div key={card.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                        <div className="relative h-16 w-12 overflow-hidden rounded-md">
                          <Image
                            src={card.image_url || "/placeholder.svg"}
                            alt={card.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{card.name}</h3>
                          <p className="text-sm text-muted-foreground">{card.dislikes_count} dislikes</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No disliked cards yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-formats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-purple-500" />
                  Liked in All Formats
                </CardTitle>
                <CardDescription>Cards liked for EDH, Draft, and Constructed play</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostAllFormats && mostAllFormats.length > 0 ? (
                    mostAllFormats.map((card) => (
                      <div key={card.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                        <div className="relative h-16 w-12 overflow-hidden rounded-md">
                          <Image
                            src={card.image_url || "/placeholder.svg"}
                            alt={card.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{card.name}</h3>
                          <p className="text-sm text-muted-foreground">{card.all_formats_count} all-format likes</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No cards liked in all formats yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
