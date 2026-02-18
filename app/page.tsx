import LoginButton from '@/components/LoginButton'
import Dashboard from '@/components/Dashboard'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  // Server par check karo user kaun hai
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          Smart <span className="text-sky-600">Bookmark</span> <span className="align-middle">🔖</span>
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-600">
          Save important links in one simple place and access them from anywhere.
        </p>
      </div>

      <div className="rounded-2xl bg-white/95 shadow-md border border-slate-200 p-6 md:p-8">
        {user ? (
          <Dashboard user={user} />
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-md text-sm text-slate-700">
              Sign in with Google to start adding and managing your bookmarks.
            </p>
            <LoginButton />
            <p className="text-xs text-slate-400">
              Your bookmarks stay private and are stored securely with Supabase.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}