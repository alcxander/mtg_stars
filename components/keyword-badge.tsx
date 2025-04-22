import { getKeywordColor } from "@/lib/keyword-colors"

interface KeywordBadgeProps {
  keyword: string
}

export default function KeywordBadge({ keyword }: KeywordBadgeProps) {
  const colorClass = getKeywordColor(keyword)

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {keyword}
    </span>
  )
}
