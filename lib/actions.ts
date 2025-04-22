"use server"

import { createClient } from "@/lib/supabase/server"

// Fetch multiple random cards for prefetching
export async function fetchRandomCards(set: string | null = null, count = 5) {
  try {
    const supabase = await createClient()
    const cards = []

    // If a set is specified, try to fetch from our database first
    if (set) {
      // Get count of cards with this set
      const { count: totalCount, error: countError } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("set_code", set)

      if (countError) throw countError

      // If we have cards with this set, get random ones
      if (totalCount && totalCount > 0) {
        // Generate random indices
        const indices = Array.from({ length: count }, () => Math.floor(Math.random() * totalCount))

        // Fetch each card individually (since we can't do multiple random fetches in one query)
        for (const index of indices) {
          const { data: randomCard, error } = await supabase
            .from("cards")
            .select("*")
            .eq("set_code", set)
            .range(index, index)
            .single()

          if (!error && randomCard) {
            cards.push(randomCard)
          }
        }

        // If we got enough cards, return them
        if (cards.length > 0) {
          return cards
        }
      }
    } else {
      // If no set specified, try to get any random cards from our database
      const { data: existingCards, error: dbError } = await supabase.from("cards").select("*").limit(1)

      // If we have cards in the database, fetch random ones
      if (existingCards && existingCards.length > 0) {
        // Get count of all cards
        const { count: totalCount, error: countError } = await supabase
          .from("cards")
          .select("*", { count: "exact", head: true })

        if (countError) throw countError

        // If we have cards, get random ones
        if (totalCount && totalCount > 0) {
          // Generate random indices
          const indices = Array.from({ length: count }, () => Math.floor(Math.random() * totalCount))

          // Fetch each card individually
          for (const index of indices) {
            const { data: randomCard, error } = await supabase.from("cards").select("*").range(index, index).single()

            if (!error && randomCard) {
              cards.push(randomCard)
            }
          }

          // If we got enough cards, return them
          if (cards.length > 0) {
            return cards
          }
        }
      }
    }

    // If we couldn't get enough cards from the database, fetch from Scryfall API
    const fetchedCards = []
    for (let i = 0; i < count; i++) {
      let url = "https://api.scryfall.com/cards/random?q=is:booster"
      if (set) {
        url += `+e:${set}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        console.error(`Failed to fetch card: ${response.statusText}`)
        continue
      }

      const cardData = await response.json()

      // Extract the relevant data
      const card = {
        card_id: cardData.id,
        name: cardData.name,
        image_url: cardData.image_uris?.normal || cardData.image_uris?.large || cardData.image_uris?.png || "",
        artist: cardData.artist || "",
        set_name: cardData.set_name || "",
        set_code: cardData.set || "",
        type_line: cardData.type_line || "",
        oracle_text: cardData.oracle_text || "",
        mana_cost: cardData.mana_cost || "",
        rarity: cardData.rarity || "",
      }

      // Store the card in our database
      const { data: insertedCard, error } = await supabase.from("cards").insert(card).select().single()

      if (error) {
        // If the card already exists, fetch it
        if (error.code === "23505") {
          // Unique violation
          const { data: existingCard, error: fetchError } = await supabase
            .from("cards")
            .select("*")
            .eq("card_id", card.card_id)
            .single()

          if (fetchError) {
            console.error("Error fetching existing card:", fetchError)
            continue
          }
          fetchedCards.push(existingCard)
        } else {
          console.error("Error inserting card:", error)
          continue
        }
      } else {
        fetchedCards.push(insertedCard)
      }

      // Add a small delay to respect Scryfall API rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return [...cards, ...fetchedCards]
  } catch (error) {
    console.error("Error fetching random cards:", error)
    throw error
  }
}

// Fetch a single random card (for backward compatibility)
export async function fetchRandomCard(set: string | null = null) {
  const cards = await fetchRandomCards(set, 1)
  return cards[0] || null
}

// Rate a card (like or dislike)
export async function rateCard(cardId: number, liked: boolean, allFormats = false) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("user_card_ratings").insert({
      card_id: cardId,
      liked: liked,
      all_formats: allFormats,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error rating card:", error)
    throw error
  }
}

// Get top liked and disliked cards
export async function getTopCards(limit = 10) {
  try {
    const supabase = await createClient()

    const { data: mostLiked, error: likedError } = await supabase
      .from("aggregated_ratings")
      .select("*")
      .order("likes_count", { ascending: false })
      .limit(limit)

    if (likedError) throw likedError

    const { data: mostDisliked, error: dislikedError } = await supabase
      .from("aggregated_ratings")
      .select("*")
      .order("dislikes_count", { ascending: false })
      .limit(limit)

    if (dislikedError) throw dislikedError

    const { data: mostAllFormats, error: allFormatsError } = await supabase
      .from("aggregated_ratings")
      .select("*")
      .order("all_formats_count", { ascending: false })
      .limit(limit)

    if (allFormatsError) throw allFormatsError

    return {
      mostLiked: mostLiked || [],
      mostDisliked: mostDisliked || [],
      mostAllFormats: mostAllFormats || [],
    }
  } catch (error) {
    console.error("Error fetching top cards:", error)
    return {
      mostLiked: [],
      mostDisliked: [],
      mostAllFormats: [],
    }
  }
}

// Fetch all available sets from Scryfall API
export async function fetchSets() {
  try {
    const supabase = await createClient()

    // Check if we have sets cached in our database
    const { data: cachedSets, error: cacheError } = await supabase
      .from("mtg_sets")
      .select("*")
      .order("released_at", { ascending: false })

    // If we have cached sets, return them
    if (!cacheError && cachedSets && cachedSets.length > 0) {
      return cachedSets
    }

    // Otherwise fetch from Scryfall API
    const response = await fetch("https://api.scryfall.com/sets")

    if (!response.ok) {
      throw new Error(`Failed to fetch sets: ${response.statusText}`)
    }

    const data = await response.json()

    // Filter to only include sets with cards and sort by release date
    const sets = data.data
      .filter((set: any) => set.card_count > 0)
      .sort((a: any, b: any) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime())

    // Cache sets in our database for future use
    if (sets.length > 0) {
      // We'll create a table for sets if it doesn't exist yet
      const { error: tableError } = await supabase.rpc("create_sets_table_if_not_exists")

      if (!tableError) {
        // Insert sets into the database
        const { error: insertError } = await supabase.from("mtg_sets").insert(
          sets.map((set: any) => ({
            code: set.code,
            name: set.name,
            icon_svg_uri: set.icon_svg_uri || null,
            released_at: set.released_at,
            card_count: set.card_count,
          })),
        )

        if (insertError && insertError.code !== "23505") {
          // Ignore unique violation errors
          console.error("Error caching sets:", insertError)
        }
      }
    }

    return sets
  } catch (error) {
    console.error("Error fetching sets:", error)
    return []
  }
}
