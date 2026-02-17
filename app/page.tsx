import LoginButton from '@/components/LoginButton'
import Dashboard from '@/components/Dashboard'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  // Server par check karo user kaun hai
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Bookmark 🔖</h1>
        <p className="text-gray-600">Save your links securely.</p>
      </div>

      {user ? (
        // Agar user hai, toh Dashboard dikhao
        <Dashboard user={user} />
      ) : (
        // Agar nahi hai, toh Login Button dikhao
        <div className="bg-white p-8 rounded shadow-lg">
          <p className="mb-4 text-gray-700">Please login to manage bookmarks</p>
          <LoginButton />
        </div>
      )}
    </main>
  )
}