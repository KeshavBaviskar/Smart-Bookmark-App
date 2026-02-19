'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Bookmark = {
    id: number
    title: string
    url: string
    created_at: string
}

const getDomain = (link: string) => {
    try {
        const { hostname } = new URL(link)
        return hostname.replace(/^www\./, '')
    } catch {
        return link
    }
}

export default function Dashboard({ user }: { user: any }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)

    // Client creation
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Agar user ID nahi hai toh kuch mat karo
        if (!user?.id) return

        // 1. Fetch Initial Bookmarks
        const fetchBookmarks = async () => {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setBookmarks(data)
            if (error) console.error("Error fetching:", error)
        }

        fetchBookmarks()

        let channel: any;

        // 2. Realtime Subscription (THE REALTIME AUTH FIX 🛠️)
        const setupRealtime = async () => {
            // STEP A: Dusre tab ke WebSocket ko token do taaki INSERT RLS pass ho jaye
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.access_token) {
                supabase.realtime.setAuth(session.access_token)
            }

            // STEP B: Ab subscribe karo
            channel = supabase
                .channel('realtime bookmarks')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'bookmarks' },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            const newBookmark = payload.new as Bookmark
                            // Duplicate Check
                            setBookmarks((prev) => {
                                if (prev.find(b => b.id === newBookmark.id)) return prev
                                return [newBookmark, ...prev]
                            })
                        }
                        if (payload.eventType === 'DELETE') {
                            const oldBookmark = payload.old as Bookmark
                            setBookmarks((prev) =>
                                prev.filter((item) => item.id !== oldBookmark.id)
                            )
                        }
                    }
                )
                .subscribe()
        }

        setupRealtime()

        return () => {
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [supabase, user?.id])

    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) return
        setLoading(true)

        const { data, error } = await supabase.from('bookmarks').insert({
            title,
            url,
            user_id: user.id
        }).select()

        if (error) {
            alert(error.message)
        } else if (data) {
            // Optimistic Update
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
        // Optimistic Delete
        setBookmarks((prev) => prev.filter((item) => item.id !== id))
        await supabase.from('bookmarks').delete().eq('id', id)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Your bookmarks
                    </h2>
                    {user?.email && (
                        <p className="mt-1 text-xs text-slate-500">
                            Signed in as <span className="font-medium text-slate-800">{user.email}</span>
                        </p>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                    Logout
                </button>
            </div>

            {/* Input Form */}
            <form
                onSubmit={addBookmark}
                className="mb-2 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm"
            >
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">
                            Title
                        </label>
                        <input
                            type="text"
                            placeholder="Design systems to read later"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">
                            URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com/article"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        />
                    </div>
                </div>
                <button
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? 'Adding bookmark…' : 'Add bookmark'}
                </button>
            </form>

            {/* Bookmarks List */}
            <div className="space-y-3">
                {bookmarks.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-6 text-center text-sm text-slate-500">
                        No bookmarks yet. Add your first link above to get started.
                    </p>
                ) : null}

                {bookmarks.map((item) => {
                    const domain = getDomain(item.url)
                    const initial = domain?.charAt(0)?.toUpperCase() || 'B'

                    return (
                        <div
                            key={item.id}
                            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-sm text-slate-900 shadow-sm transition hover:border-sky-500/70"
                        >
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-sky-700">
                                {initial}
                            </div>
                            <div className="min-w-0 flex-1">
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="line-clamp-1 font-medium text-sky-700 hover:text-sky-900 hover:underline"
                                >
                                    {item.title}
                                </a>
                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                    {domain}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Saved on {new Date(item.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => deleteBookmark(item.id)}
                                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-xs text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                aria-label="Delete bookmark"
                            >
                                🗑️
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}