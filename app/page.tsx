import CardSwiper from "@/components/card-swiper"
import { Suspense } from "react"
import LoadingCard from "@/components/loading-card"
import { cookies } from "next/headers"


export default async function Home() {
  // Force cookies to be read at the page level
  // This ensures cookies are properly initialized before any components that need them
  await cookies()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl font-mono text-sm overflow-hidden flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-center mb-8">Magic Card Draft Swiper</h1>
        <p className="text-center mb-12 text-muted-foreground">
          Swipe right to <span className="text-green-400">like</span>, left to <span className="text-red-500">dislike</span>. Find your favorite Magic: The Gathering cards for <span className="text-gray-50">drafting</span>!
        </p>
        <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><LoadingCard /></div>}>
          <CardSwiper />
        </Suspense>
      </div>
    </main>
  )
}
