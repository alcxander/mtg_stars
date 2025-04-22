import { getKeywordColor } from "@/lib/keyword-colors"

interface KeywordBadgeProps {
  keyword: string
}

export default function KeywordBadge({ keyword }: KeywordBadgeProps) {
  const colorClass = getKeywordColor(keyword)

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colorClass} whitespace-nowrap`}
      title={keyword}
    >
      {keyword}
    </span>
  )
}
