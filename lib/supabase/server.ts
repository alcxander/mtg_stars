import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      async get(name) {
        const cookie = cookieStore.get(name)
        return cookie?.value
      },
      async set(name, value, options) {
        cookieStore.set({ name, value, ...options })
      },
      async remove(name, options) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}
