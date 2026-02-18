// utils/supabase/server.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Note: Ye function ASYNC hai kyunki cookies padhna time leta hai
export async function createClient() {
    const cookieStore = await cookies() // Next.js 15 mein Await zaroori hai

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Sirf cookie padhne ka method chahiye server ko
                getAll() {
                    return cookieStore.getAll()
                },
                // Set/Remove hum Server Actions ya Middleware mein karte hain mostly
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server Component se cookies set nahi kar sakte (Read Only mode)
                        // Isliye ye empty catch block hai
                    }
                },
            },
        }
    )
}