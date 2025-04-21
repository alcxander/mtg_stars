import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingCard() {
  return (
    <div className="w-full max-w-md h-[500px] mb-8">
      <Card className="w-full h-full overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="relative flex-grow">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="p-4 bg-black/80">
            <Skeleton className="h-6 w-3/4 bg-gray-700 mb-2" />
            <Skeleton className="h-4 w-1/2 bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
