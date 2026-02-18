// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // 1. URL se "code" nikalna
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Login ke baad kahan bhejna hai? (Default: Home page '/')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStore = await cookies() // Next.js 15 fix

        // 2. Supabase Server Client banana (Cookie access ke sath)
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set({ name, value, ...options })
                        })
                    },
                },
            }
        )

        // 3. THE MAGIC LINE: Code ko Session mein badalna
        // Ye function Google se baat karta hai: "Ye lo code, mujhe user ka data do."
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // 4. Sab sahi hai? Toh user ko Home page pe bhej do
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // 5. Agar code galat hai ya expiry ho gaya, toh error page pe bhejo
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}