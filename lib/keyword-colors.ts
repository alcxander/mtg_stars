// Color mapping for MTG keywords
export const keywordColors: Record<string, string> = {
  // Evergreen keywords
  flying: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100",
  deathtouch: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  defender: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  doublestrike: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  "double strike": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  enchant: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  equip: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  firststrike: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  "first strike": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  flash: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  haste: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  hexproof: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
  indestructible: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  lifelink: "bg-white text-gray-800 dark:bg-gray-200 dark:text-gray-800 border border-gray-200 dark:border-gray-400",
  menace: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  prowess: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  reach: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  trample: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  vigilance: "bg-white text-gray-800 dark:bg-gray-200 dark:text-gray-800 border border-gray-200 dark:border-gray-400",

  // Other common keywords
  coven: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  ward: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  foretell: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  boast: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  kicker: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  flashback: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  aftermath: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  cascade: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  convoke: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  delve: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  emerge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  escape: "bg-black text-white dark:bg-gray-800 dark:text-gray-100",
  mutate: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  surveil: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  buyback: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",

  // Default for unknown keywords
  default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
}

export function getKeywordColor(keyword: string): string {
  const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, "")
  return keywordColors[normalizedKeyword] || keywordColors[keyword.toLowerCase()] || keywordColors.default
}
