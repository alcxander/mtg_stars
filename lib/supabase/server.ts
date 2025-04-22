import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // Create a cookies instance that we can reuse
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name) {
        // This is a synchronous function that returns the cookie value
        // We need to use a synchronous approach here as the Supabase client expects it
        try {
          return cookieStore.get(name)?.value
        } catch (error) {
          console.error("Error getting cookie:", error)
          return undefined
        }
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          console.error("Error setting cookie:", error)
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          console.error("Error removing cookie:", error)
        }
      },
    },
  })
}
