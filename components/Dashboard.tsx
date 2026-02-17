'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard({ user }: { user: any }) {
    const [bookmarks, setBookmarks] = useState<any[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // 1. Fetch Initial Data
        const fetchBookmarks = async () => {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setBookmarks(data)
            if (error) console.error("Error fetching:", error)
        }

        fetchBookmarks()

        // 2. Real-time Subscription (Fixed)
        console.log("Setting up Realtime connection...") // Debug Log

        const channel = supabase
            .channel('realtime bookmarks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, (payload) => {
                console.log("Change received!", payload) // Debug Log

                if (payload.eventType === 'INSERT') {
                    setBookmarks((prev) => [payload.new, ...prev])
                }
                if (payload.eventType === 'DELETE') {
                    setBookmarks((prev) => prev.filter((item) => item.id !== payload.old.id))
                }
            })
            .subscribe((status) => {
                console.log("Realtime Status:", status) // Ye "SUBSCRIBED" aana chahiye
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, []) // <--- IMPORTANT: Yahan se [supabase] hata diya hai taaki re-render pe connection na tute

    // 3. Add Bookmark (With Instant UI Update)
    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) return
        setLoading(true)

        // .select() lagaya hai taaki humein turant naya data mile
        const { data, error } = await supabase.from('bookmarks').insert({
            title,
            url,
            user_id: user.id
        }).select()

        if (error) {
            alert(error.message)
        } else if (data) {
            // Instant update (Backup for Realtime)
            // Hum check karenge ki kya ye pehle se list mein hai (Realtime ki wajah se duplicate na ho)
            setBookmarks((prev) => {
                if (prev.find(b => b.id === data[0].id)) return prev
                return [data[0], ...prev]
            })
            setTitle('')
            setUrl('')
        }
        setLoading(false)
    }

    const deleteBookmark = async (id: number) => {
        // UI se pehle hi hata do (Optimistic Update)
        setBookmarks((prev) => prev.filter((item) => item.id !== id))
        await supabase.from('bookmarks').delete().eq('id', id)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Your Bookmarks</h2>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
            </div>

            <form onSubmit={addBookmark} className="mb-8 space-y-3 bg-white p-4 rounded shadow">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="url"
                    placeholder="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full border p-2 rounded"
                />
                <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    {loading ? 'Adding...' : 'Add Bookmark'}
                </button>
            </form>

            <div className="space-y-3">
                {bookmarks.length === 0 ? <p className="text-gray-500 text-center">No bookmarks yet.</p> : null}
                {bookmarks.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                        <div>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                {item.title}
                            </a>
                            <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => deleteBookmark(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    )
}