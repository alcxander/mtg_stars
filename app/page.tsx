import CardSwiper from "@/components/card-swiper"
import { Suspense } from "react"
import LoadingCard from "@/components/loading-card"
import { cookies } from "next/headers"

export default async function Home() {
  // Force cookies to be read at the page level
  // This ensures cookies are properly initialized before any components that need them
  await cookies()
  await sleep(1000);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Magic Card Swiper</h1>
        <p className="text-center mb-12 text-muted-foreground">
          Swipe right to like, left to dislike. Find your favorite Magic: The Gathering cards!
        </p>

        <Suspense fallback={<LoadingCard />}>
          <CardSwiper />
        </Suspense>
      </div>
    </main>
  )
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
