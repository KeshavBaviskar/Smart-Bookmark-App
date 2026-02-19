# Smart Bookmark App 🔖

A real-time bookmark manager built with **Next.js 15 (App Router)**, **Supabase**, and **Tailwind CSS**.

## 🚀 Live Demo
smart-bookmark-app-six-nu.vercel.app  

## ✨ Features
- **Google Authentication:** Secure login via Google OAuth (Supabase Auth).
- **Private Bookmarks:** Row Level Security (RLS) ensures users only see their own data.
- **Real-time Updates:** Bookmarks appear instantly across tabs without refreshing (Supabase Realtime).
- **Responsive UI:** Styled with Tailwind CSS.

## 🛠️ Problems I Faced and How I Solved Them

Coming from a basic MERN stack background, building a full-stack app with Next.js 15 (App Router) and Supabase was a great learning experience. Here are the main challenges I faced and how I solved them:

### 1. Next.js 15 Async Cookies Error
* **The Problem:** When setting up Google Authentication, my code was crashing. I realized that in the new Next.js 15 update, the `cookies()` function became asynchronous, which broke the standard Supabase auth setup.
* **The Solution:** I updated my `utils/supabase/server.ts` and auth callback route. I added `await cookies()` to make sure the server waits for the cookies to load before trying to read or write the user session.

### 2. "Row violates row-level security policy" Error
* **The Problem:** After deploying the app, I tried to add a bookmark, but the browser gave me an RLS (Row Level Security) error and blocked the insert.
* **The Solution:** I checked my Supabase Dashboard and noticed my `INSERT` and `DELETE` policies were accidentally set to `public`. I changed the Target Role to `authenticated` and made sure the rule was `auth.uid() = user_id`. This fixed the error and completely secured my database.

### 3. Realtime Sync Not Working for "Inserts" Across Tabs
* **The Problem:** I wanted bookmarks to sync instantly across multiple open tabs. Deleting a bookmark in Tab A updated Tab B instantly. However, *adding* a bookmark in Tab A did not show up in Tab B unless I refreshed the page.
* **The Solution:** I figured out that the WebSocket connection in Tab B was starting before the user's auth token was fully ready. Because of my database security (RLS), Supabase refused to send the new data to a connection without a token. I fixed this by manually passing the token using `supabase.realtime.setAuth(session.access_token)` inside my `useEffect` before subscribing to the channel.

### 4. Cross-Tab Logout Glitch
* **The Problem:** If I had the app open in two tabs and logged out from Tab A, Tab B would still show the dashboard. If I tried to add a bookmark in Tab B, it threw an error because the session was already gone.
* **The Solution:** I added Supabase's `onAuthStateChange` listener in my code. Now, if it detects a `SIGNED_OUT` event from any tab, it automatically calls `router.refresh()`. This safely redirects all open tabs back to the login screen at the same time.

## 📦 Tech Stack
- **Frontend:** Next.js 15, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)

