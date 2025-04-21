"use server"

import { createClient } from "@/lib/supabase/server"

// Fetch a random card from Scryfall API
export async function fetchRandomCard(set: string | null = null) {
  try {
    // First check if we have any cards in our database
    const supabase = createClient()

    // If a set is specified, try to fetch from our database first
    if (set) {
      // Get count of cards with this set
      const { count, error: countError } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("set_code", set)

      if (countError) throw countError

      // If we have cards with this set, get a random one using offset
      if (count && count > 0) {
        const randomIndex = Math.floor(Math.random() * count)
        const { data: randomCard, error } = await supabase
          .from("cards")
          .select("*")
          .eq("set_code", set)
          .range(randomIndex, randomIndex)
          .single()

        if (!error && randomCard) {
          return randomCard
        }
      }
    } else {
      // If no set specified, try to get any random card from our database
      const { data: existingCards, error: dbError } = await supabase.from("cards").select("*").limit(1)

      // If we have cards in the database, fetch a random one
      if (existingCards && existingCards.length > 0) {
        // Get count of all cards
        const { count, error: countError } = await supabase.from("cards").select("*", { count: "exact", head: true })

        if (countError) throw countError

        // If we have cards, get a random one using offset
        if (count && count > 0) {
          const randomIndex = Math.floor(Math.random() * count)
          const { data: randomCard, error } = await supabase
            .from("cards")
            .select("*")
            .range(randomIndex, randomIndex)
            .single()

          if (error) throw error
          return randomCard
        }
      }
    }

    // If no cards in database or none matching the set, fetch from Scryfall API
    let url = "https://api.scryfall.com/cards/random?q=is:booster"
    if (set) {
      url += `+e:${set}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch card: ${response.statusText}`)
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

        if (fetchError) throw fetchError
        return existingCard
      }
      throw error
    }

    return insertedCard
  } catch (error) {
    console.error("Error fetching random card:", error)
    throw error
  }
}

// Rate a card (like or dislike)
export async function rateCard(cardId: number, liked: boolean) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("user_card_ratings").insert({
      card_id: cardId,
      liked: liked,
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
    const supabase = createClient()

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

    return {
      mostLiked: mostLiked || [],
      mostDisliked: mostDisliked || [],
    }
  } catch (error) {
    console.error("Error fetching top cards:", error)
    return {
      mostLiked: [],
      mostDisliked: [],
    }
  }
}

// Fetch all available sets from Scryfall API
export async function fetchSets() {
  try {
    const supabase = createClient()

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
