"use client";

import { getKeywordColor } from "@/lib/keyword-colors"

interface KeywordBadgeProps {
  keyword: string
}

export default function KeywordBadge({ keyword }: KeywordBadgeProps) {
  const colorClass = getKeywordColor(keyword)
  console.log("keyword called : keyword - " + keyword + ", color class - " + colorClass)

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colorClass} whitespace-nowrap`}
      title={keyword}
    >
      {keyword}
    </span>
  )
}
