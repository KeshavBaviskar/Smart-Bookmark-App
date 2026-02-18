# Smart Bookmark App 🔖

A real-time bookmark manager built with **Next.js 15 (App Router)**, **Supabase**, and **Tailwind CSS**.

## 🚀 Live Demo
[LINK_HERE] (Yahan apna Vercel link paste kar)

## ✨ Features
- **Google Authentication:** Secure login via Google OAuth (Supabase Auth).
- **Private Bookmarks:** Row Level Security (RLS) ensures users only see their own data.
- **Real-time Updates:** Bookmarks appear instantly across tabs without refreshing (Supabase Realtime).
- **Responsive UI:** Styled with Tailwind CSS.

## 🛠️ Challenges & Solutions

### 1. Google OAuth 404 Error
**Problem:** After logging in with Google, I was redirected to a 404 page.
**Solution:** I realized I hadn't created the Route Handler to exchange the auth code for a session. I created `app/auth/callback/route.ts` using `@supabase/ssr` to handle the callback and redirect users to the dashboard.

### 2. Connection Resets in Real-time
**Problem:** The real-time subscription was disconnecting frequently, requiring page refreshes to see new bookmarks.
**Solution:** I optimized the `useEffect` hook in `Dashboard.tsx` to prevent re-subscriptions on every render. I also enabled "Realtime" specifically for the `bookmarks` table in the Supabase Dashboard.

### 3. Next.js 15 Async Cookies
**Problem:** I encountered a `TypeError: cookieStore.get is not a function`.
**Solution:** Next.js 15 made `cookies()` asynchronous. I updated my server-side code to `await cookies()` before accessing the cookie store.

## 📦 Tech Stack
- **Frontend:** Next.js 15, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)

